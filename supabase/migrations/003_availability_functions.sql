-- ============================================================================
-- AVAILABILITY ENGINE - SQL FUNCTIONS
-- Migration 003: Availability checking functions and indexes
-- ============================================================================

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Critical indexes for availability queries
CREATE INDEX IF NOT EXISTS idx_bookings_tent_dates 
  ON bookings(tent_id, check_in_date, check_out_date);

CREATE INDEX IF NOT EXISTS idx_bookings_dates_status 
  ON bookings(check_in_date, check_out_date, status);

CREATE INDEX IF NOT EXISTS idx_tents_type_status 
  ON tents(tent_type_id, status);

CREATE INDEX IF NOT EXISTS idx_tent_types_active 
  ON tent_types(is_active) WHERE is_active = true;

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_bookings_availability_check 
  ON bookings(tent_id, status, check_in_date, check_out_date)
  WHERE status NOT IN ('cancelled', 'checked_out');

-- ============================================================================
-- FUNCTION: check_tent_availability
-- Check if a specific tent is available for given dates
-- ============================================================================

CREATE OR REPLACE FUNCTION check_tent_availability(
  p_tent_id UUID,
  p_check_in DATE,
  p_check_out DATE
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Validate input
  IF p_check_in >= p_check_out THEN
    RAISE EXCEPTION 'Check-out date must be after check-in date';
  END IF;

  -- Check if tent exists and is available
  IF NOT EXISTS (
    SELECT 1 FROM tents 
    WHERE id = p_tent_id 
    AND status = 'available'
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Check for overlapping bookings
  -- Date overlap logic:
  -- - New check-in falls within existing booking
  -- - New check-out falls within existing booking  
  -- - New booking encompasses existing booking
  RETURN NOT EXISTS (
    SELECT 1 FROM bookings
    WHERE tent_id = p_tent_id
    AND status NOT IN ('cancelled', 'checked_out')
    AND (
      -- Case 1: New check-in falls within existing booking
      (p_check_in >= check_in_date AND p_check_in < check_out_date)
      
      -- Case 2: New check-out falls within existing booking
      OR (p_check_out > check_in_date AND p_check_out <= check_out_date)
      
      -- Case 3: New booking encompasses existing booking
      OR (p_check_in <= check_in_date AND p_check_out >= check_out_date)
    )
  );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION check_tent_availability IS 
'Check if a specific tent is available for the given date range. Returns true if available, false otherwise.';

-- ============================================================================
-- FUNCTION: get_available_tents
-- Get all available tents for a date range (individual tents)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_available_tents(
  p_check_in DATE,
  p_check_out DATE,
  p_guest_count INTEGER DEFAULT NULL
)
RETURNS TABLE (
  tent_id UUID,
  tent_number VARCHAR,
  tent_type_id UUID,
  tent_type_name VARCHAR,
  capacity INTEGER,
  base_price DECIMAL,
  description TEXT,
  amenities JSONB,
  tent_status VARCHAR
) AS $$
BEGIN
  -- Validate input
  IF p_check_in >= p_check_out THEN
    RAISE EXCEPTION 'Check-out date must be after check-in date';
  END IF;

  RETURN QUERY
  SELECT 
    t.id,
    t.tent_number,
    tt.id,
    tt.name,
    tt.capacity,
    tt.base_price,
    tt.description,
    tt.amenities,
    t.status
  FROM tents t
  INNER JOIN tent_types tt ON t.tent_type_id = tt.id
  WHERE 
    -- Tent must be available (not in maintenance or out of service)
    t.status = 'available'
    
    -- Tent type must be active
    AND tt.is_active = true
    
    -- Optional: Filter by guest count capacity
    AND (p_guest_count IS NULL OR tt.capacity >= p_guest_count)
    
    -- Check availability using the function
    AND check_tent_availability(t.id, p_check_in, p_check_out)
    
  ORDER BY tt.capacity, tt.base_price, t.tent_number;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_available_tents IS 
'Get all available tents for the given date range. Optionally filter by guest count.';

-- ============================================================================
-- FUNCTION: get_available_tents_by_type
-- Get available tents grouped by tent type with counts
-- ============================================================================

CREATE OR REPLACE FUNCTION get_available_tents_by_type(
  p_check_in DATE,
  p_check_out DATE,
  p_guest_count INTEGER DEFAULT NULL
)
RETURNS TABLE (
  tent_type_id UUID,
  tent_type_name VARCHAR,
  capacity INTEGER,
  base_price DECIMAL,
  description TEXT,
  amenities JSONB,
  images JSONB,
  available_count BIGINT,
  total_count BIGINT,
  available_tent_ids UUID[],
  available_tent_numbers VARCHAR[]
) AS $$
BEGIN
  -- Validate input
  IF p_check_in >= p_check_out THEN
    RAISE EXCEPTION 'Check-out date must be after check-in date';
  END IF;

  RETURN QUERY
  SELECT 
    tt.id,
    tt.name,
    tt.capacity,
    tt.base_price,
    tt.description,
    tt.amenities,
    tt.images,
    
    -- Count of available tents for this type
    COUNT(DISTINCT t.id),
    
    -- Total tents of this type (that are in 'available' status)
    (
      SELECT COUNT(*) 
      FROM tents 
      WHERE tent_type_id = tt.id 
      AND status = 'available'
    )::BIGINT,
    
    -- Array of available tent IDs
    ARRAY_AGG(t.id),
    
    -- Array of available tent numbers (sorted)
    ARRAY_AGG(t.tent_number ORDER BY t.tent_number)
    
  FROM tent_types tt
  INNER JOIN tents t ON t.tent_type_id = tt.id
  WHERE 
    -- Tent type must be active
    tt.is_active = true
    
    -- Tent must be available
    AND t.status = 'available'
    
    -- Optional: Filter by guest count capacity
    AND (p_guest_count IS NULL OR tt.capacity >= p_guest_count)
    
    -- Check availability
    AND check_tent_availability(t.id, p_check_in, p_check_out)
    
  GROUP BY 
    tt.id, 
    tt.name, 
    tt.capacity, 
    tt.base_price, 
    tt.description, 
    tt.amenities,
    tt.images
    
  -- Only return tent types that have at least one available tent
  HAVING COUNT(DISTINCT t.id) > 0
  
  ORDER BY tt.capacity, tt.base_price;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_available_tents_by_type IS 
'Get available tents grouped by tent type with availability counts. Returns only types with available tents.';

-- ============================================================================
-- FUNCTION: get_occupancy_rate
-- Calculate occupancy rate for a specific date
-- ============================================================================

CREATE OR REPLACE FUNCTION get_occupancy_rate(
  p_date DATE
)
RETURNS TABLE (
  date DATE,
  total_tents INTEGER,
  occupied_tents INTEGER,
  available_tents INTEGER,
  occupancy_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p_date,
    COUNT(DISTINCT t.id)::INTEGER as total,
    COUNT(DISTINCT CASE 
      WHEN EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.tent_id = t.id
        AND b.status NOT IN ('cancelled', 'checked_out')
        AND p_date >= b.check_in_date 
        AND p_date < b.check_out_date
      ) THEN t.id 
    END)::INTEGER as occupied,
    (COUNT(DISTINCT t.id) - COUNT(DISTINCT CASE 
      WHEN EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.tent_id = t.id
        AND b.status NOT IN ('cancelled', 'checked_out')
        AND p_date >= b.check_in_date 
        AND p_date < b.check_out_date
      ) THEN t.id 
    END))::INTEGER as available,
    ROUND(
      (COUNT(DISTINCT CASE 
        WHEN EXISTS (
          SELECT 1 FROM bookings b
          WHERE b.tent_id = t.id
          AND b.status NOT IN ('cancelled', 'checked_out')
          AND p_date >= b.check_in_date 
          AND p_date < b.check_out_date
        ) THEN t.id 
      END)::DECIMAL / NULLIF(COUNT(DISTINCT t.id), 0)) * 100,
      2
    ) as rate
  FROM tents t
  WHERE t.status = 'available';
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_occupancy_rate IS 
'Calculate occupancy rate for a specific date. Returns total, occupied, available tents and occupancy percentage.';

-- ============================================================================
-- FUNCTION: get_tent_booking_history
-- Get booking history for a specific tent
-- ============================================================================

CREATE OR REPLACE FUNCTION get_tent_booking_history(
  p_tent_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  booking_id UUID,
  booking_reference VARCHAR,
  customer_name VARCHAR,
  check_in_date DATE,
  check_out_date DATE,
  status VARCHAR,
  total_amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.booking_reference,
    c.name,
    b.check_in_date,
    b.check_out_date,
    b.status,
    b.total_amount
  FROM bookings b
  INNER JOIN customers c ON b.customer_id = c.id
  WHERE b.tent_id = p_tent_id
  ORDER BY b.check_in_date DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_tent_booking_history IS 
'Get booking history for a specific tent. Returns most recent bookings.';

-- ============================================================================
-- FUNCTION: validate_booking_dates
-- Validate booking dates before creating a booking
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_booking_dates(
  p_tent_id UUID,
  p_check_in DATE,
  p_check_out DATE
)
RETURNS TABLE (
  is_valid BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  v_tent_exists BOOLEAN;
  v_tent_status VARCHAR;
  v_is_available BOOLEAN;
BEGIN
  -- Check if dates are valid
  IF p_check_in >= p_check_out THEN
    RETURN QUERY SELECT FALSE, 'Check-out date must be after check-in date';
    RETURN;
  END IF;

  -- Check if check-in is in the past
  IF p_check_in < CURRENT_DATE THEN
    RETURN QUERY SELECT FALSE, 'Check-in date cannot be in the past';
    RETURN;
  END IF;

  -- Check if tent exists
  SELECT EXISTS(SELECT 1 FROM tents WHERE id = p_tent_id) INTO v_tent_exists;
  IF NOT v_tent_exists THEN
    RETURN QUERY SELECT FALSE, 'Tent does not exist';
    RETURN;
  END IF;

  -- Check tent status
  SELECT status INTO v_tent_status FROM tents WHERE id = p_tent_id;
  IF v_tent_status != 'available' THEN
    RETURN QUERY SELECT FALSE, 'Tent is not available (status: ' || v_tent_status || ')';
    RETURN;
  END IF;

  -- Check availability
  SELECT check_tent_availability(p_tent_id, p_check_in, p_check_out) INTO v_is_available;
  IF NOT v_is_available THEN
    RETURN QUERY SELECT FALSE, 'Tent is already booked for the selected dates';
    RETURN;
  END IF;

  -- All validations passed
  RETURN QUERY SELECT TRUE, 'Booking dates are valid'::TEXT;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION validate_booking_dates IS 
'Validate booking dates before creating a booking. Returns validation result and error message if invalid.';

-- ============================================================================
-- FUNCTION: get_next_available_date
-- Find the next available date for a tent after a given date
-- ============================================================================

CREATE OR REPLACE FUNCTION get_next_available_date(
  p_tent_id UUID,
  p_start_date DATE,
  p_nights INTEGER DEFAULT 1,
  p_max_days_ahead INTEGER DEFAULT 90
)
RETURNS DATE AS $$
DECLARE
  v_check_date DATE;
  v_check_out DATE;
  v_is_available BOOLEAN;
BEGIN
  -- Start from the given date
  v_check_date := p_start_date;
  
  -- Loop through dates up to max_days_ahead
  FOR i IN 0..p_max_days_ahead LOOP
    v_check_date := p_start_date + i;
    v_check_out := v_check_date + p_nights;
    
    -- Check if tent is available for this date range
    SELECT check_tent_availability(p_tent_id, v_check_date, v_check_out) 
    INTO v_is_available;
    
    IF v_is_available THEN
      RETURN v_check_date;
    END IF;
  END LOOP;
  
  -- No available date found
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_next_available_date IS 
'Find the next available date for a tent after a given date. Returns NULL if no availability found within max_days_ahead.';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION check_tent_availability TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_tents TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_tents_by_type TO authenticated;
GRANT EXECUTE ON FUNCTION get_occupancy_rate TO authenticated;
GRANT EXECUTE ON FUNCTION get_tent_booking_history TO authenticated;
GRANT EXECUTE ON FUNCTION validate_booking_dates TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_available_date TO authenticated;

-- Grant execute permissions to anonymous users (for public availability checks)
GRANT EXECUTE ON FUNCTION get_available_tents TO anon;
GRANT EXECUTE ON FUNCTION get_available_tents_by_type TO anon;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Test availability functions
DO $$
BEGIN
  RAISE NOTICE 'Availability functions created successfully';
  RAISE NOTICE 'Run the following to test:';
  RAISE NOTICE 'SELECT * FROM get_available_tents_by_type(CURRENT_DATE, CURRENT_DATE + 2);';
END $$;

-- Made with Bob
