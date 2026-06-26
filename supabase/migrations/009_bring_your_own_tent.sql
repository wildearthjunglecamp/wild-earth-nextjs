-- Migration 009: Add "Bring Your Own Tent" (BYOT) Support
-- This migration adds support for guests to bring their own tents
-- BYOT is charged per guest per night and includes breakfast & snacks

-- ============================================================================
-- 1. ALTER tent_types TABLE
-- ============================================================================
-- First, make capacity nullable to allow BYOT (which has no fixed capacity)
ALTER TABLE tent_types ALTER COLUMN capacity DROP NOT NULL;

-- Add columns to support BYOT functionality
ALTER TABLE tent_types
ADD COLUMN IF NOT EXISTS is_byot BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS per_guest_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS max_guests_per_night INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN tent_types.is_byot IS 'True if this is a "Bring Your Own Tent" type (no physical tent inventory)';
COMMENT ON COLUMN tent_types.per_guest_price IS 'Price per guest per night for BYOT types (NULL for regular tent types)';
COMMENT ON COLUMN tent_types.max_guests_per_night IS 'Maximum total guests allowed per night for BYOT (NULL for regular tent types)';

-- ============================================================================
-- 2. INSERT BYOT TENT TYPE
-- ============================================================================
INSERT INTO tent_types (
  name,
  capacity,
  base_price,
  description,
  amenities,
  images,
  is_active,
  is_byot,
  per_guest_price,
  max_guests_per_night
) VALUES (
  'Bring Your Own Tent',
  NULL, -- No capacity limit as guests bring their own tents
  1499.00, -- Base price shown for reference (actual pricing is per_guest_price)
  'Bring your own tent and enjoy our campsite facilities. Includes breakfast and snacks for all guests. Perfect for adventurers who prefer their own camping gear!',
  '["Campsite access", "Breakfast included", "Snacks included", "Washroom facilities", "Common area access", "Bonfire area", "Parking"]'::jsonb,
  '[]'::jsonb,
  true,
  true, -- This is a BYOT type
  1499.00, -- ₹1499 per guest per night
  30 -- Maximum 30 BYOT guests per night
);

-- ============================================================================
-- 3. CREATE FUNCTION TO CHECK BYOT CAPACITY
-- ============================================================================
-- Function to check if BYOT capacity is available for a date range
CREATE OR REPLACE FUNCTION check_byot_capacity(
  p_check_in DATE,
  p_check_out DATE,
  p_requested_guests INTEGER
)
RETURNS TABLE (
  date DATE,
  current_guests INTEGER,
  available_capacity INTEGER,
  is_available BOOLEAN
) AS $$
DECLARE
  v_byot_tent_type_id UUID;
  v_max_guests INTEGER;
BEGIN
  -- Get BYOT tent type ID and max capacity
  SELECT id, max_guests_per_night
  INTO v_byot_tent_type_id, v_max_guests
  FROM tent_types
  WHERE is_byot = true AND is_active = true
  LIMIT 1;

  -- If no BYOT type found, return empty result
  IF v_byot_tent_type_id IS NULL THEN
    RETURN;
  END IF;

  -- Calculate current BYOT guests for each date in range
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      p_check_in,
      p_check_out - INTERVAL '1 day',
      INTERVAL '1 day'
    )::DATE AS check_date
  ),
  byot_bookings AS (
    SELECT
      ds.check_date,
      COALESCE(SUM(b.adults + b.children), 0)::INTEGER AS current_byot_guests
    FROM date_series ds
    LEFT JOIN bookings b ON
      b.check_in_date <= ds.check_date AND
      b.check_out_date > ds.check_date AND
      b.status NOT IN ('cancelled') AND
      EXISTS (
        SELECT 1 FROM tents t
        WHERE t.id = b.tent_id AND t.tent_type_id = v_byot_tent_type_id
      )
    GROUP BY ds.check_date
  )
  SELECT
    bb.check_date,
    bb.current_byot_guests,
    (v_max_guests - bb.current_byot_guests)::INTEGER AS available_capacity,
    (bb.current_byot_guests + p_requested_guests <= v_max_guests) AS is_available
  FROM byot_bookings bb
  ORDER BY bb.check_date;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. CREATE VIRTUAL TENT FOR BYOT BOOKINGS
-- ============================================================================
-- BYOT doesn't need physical tent instances, but we create one virtual tent
-- for booking system compatibility
INSERT INTO tents (tent_type_id, tent_number, status, notes)
SELECT
  id,
  'BYOT-VIRTUAL',
  'available',
  'Virtual tent for "Bring Your Own Tent" bookings. Not a physical tent.'
FROM tent_types
WHERE is_byot = true
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. UPDATE get_available_tents_by_type FUNCTION
-- ============================================================================
-- Modify the function to always include BYOT as available
CREATE OR REPLACE FUNCTION get_available_tents_by_type(
  p_check_in DATE,
  p_check_out DATE,
  p_guest_count INTEGER DEFAULT NULL
)
RETURNS TABLE (
  tent_type_id UUID,
  tent_type_slug VARCHAR,
  tent_type_name VARCHAR,
  capacity INTEGER,
  base_price DECIMAL,
  description TEXT,
  amenities JSONB,
  images JSONB,
  available_count BIGINT,
  total_count BIGINT,
  available_tent_ids UUID[],
  available_tent_numbers VARCHAR[],
  is_byot BOOLEAN,
  per_guest_price DECIMAL,
  max_guests_per_night INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH tent_availability AS (
    SELECT
      tt.id,
      tt.name,
      tt.capacity,
      tt.base_price,
      tt.description,
      tt.amenities,
      tt.images,
      tt.is_byot,
      tt.per_guest_price,
      tt.max_guests_per_night,
      t.id AS tent_id,
      t.tent_number,
      -- Check if tent is available (not booked in the date range)
      CASE
        WHEN tt.is_byot THEN true -- BYOT is always "available"
        ELSE NOT EXISTS (
          SELECT 1
          FROM bookings b
          WHERE b.tent_id = t.id
            AND b.status NOT IN ('cancelled', 'checked_out')
            AND b.check_in < p_check_out
            AND b.check_out > p_check_in
        )
      END AS is_available
    FROM tent_types tt
    INNER JOIN tents t ON t.tent_type_id = tt.id
    WHERE tt.is_active = true
      AND t.status = 'available'
      AND (p_guest_count IS NULL OR tt.capacity >= p_guest_count OR tt.is_byot = true)
  )
  SELECT
    ta.id AS tent_type_id,
    CAST(LOWER(REPLACE(ta.name, ' ', '_')) AS varchar) AS tent_type_slug,
    ta.name AS tent_type_name,
    ta.capacity,
    ta.base_price,
    ta.description,
    ta.amenities,
    ta.images,
    CASE
      WHEN ta.is_byot THEN 999 -- Show high availability for BYOT
      ELSE COUNT(*) FILTER (WHERE ta.is_available)
    END AS available_count,
    COUNT(*) AS total_count,
    ARRAY_AGG(ta.tent_id) FILTER (WHERE ta.is_available) AS available_tent_ids,
    ARRAY_AGG(CAST(ta.tent_number AS varchar)) FILTER (WHERE ta.is_available) AS available_tent_numbers,
    ta.is_byot,
    ta.per_guest_price,
    ta.max_guests_per_night
  FROM tent_availability ta
  GROUP BY
    ta.id,
    ta.name,
    ta.capacity,
    ta.base_price,
    ta.description,
    ta.amenities,
    ta.images,
    ta.is_byot,
    ta.per_guest_price,
    ta.max_guests_per_night
  HAVING COUNT(*) FILTER (WHERE ta.is_available) > 0 OR ta.is_byot = true
  ORDER BY
    ta.is_byot DESC, -- BYOT appears last
    ta.capacity ASC,
    ta.base_price ASC;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 6. ADD INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_tent_types_is_byot ON tent_types(is_byot) WHERE is_byot = true;
CREATE INDEX IF NOT EXISTS idx_bookings_dates_status ON bookings(check_in_date, check_out_date, status);

-- ============================================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================================
-- To rollback this migration, run:
-- DROP FUNCTION IF EXISTS check_byot_capacity(DATE, DATE, INTEGER);
-- DELETE FROM tents WHERE tent_number = 'BYOT-VIRTUAL';
-- DELETE FROM tent_types WHERE is_byot = true;
-- ALTER TABLE tent_types DROP COLUMN IF EXISTS is_byot;
-- ALTER TABLE tent_types DROP COLUMN IF EXISTS per_guest_price;
-- ALTER TABLE tent_types DROP COLUMN IF EXISTS max_guests_per_night;
-- ALTER TABLE tent_types ALTER COLUMN capacity SET NOT NULL;

-- Made with Bob