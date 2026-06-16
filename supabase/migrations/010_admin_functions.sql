-- ============================================================================
-- Migration 010: Admin support functions
--   1. Fix get_occupancy_rate     (used the dead single-tent model)
--   2. Fix get_tent_booking_history (same defect + unused customers join)
--   3. Add create_manual_booking  (admin offline/walk-in bookings, no Razorpay)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. get_occupancy_rate — rewrite against booking_tents + booking_status.
--    Same return signature, so CREATE OR REPLACE is fine. SECURITY DEFINER so
--    it can read RLS-protected bookings/booking_tents.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_occupancy_rate(p_date DATE)
RETURNS TABLE (
  date DATE,
  total_tents INTEGER,
  occupied_tents INTEGER,
  available_tents INTEGER,
  occupancy_rate DECIMAL
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_total INTEGER;
  v_occupied INTEGER;
BEGIN
  -- Operational tents
  SELECT COUNT(*) INTO v_total FROM tents WHERE status = 'available';

  -- Tents occupied on p_date by an active booking (half-open interval)
  SELECT COUNT(DISTINCT bt.tent_id) INTO v_occupied
  FROM booking_tents bt
  INNER JOIN bookings b ON b.id = bt.booking_id
  WHERE b.booking_status NOT IN ('cancelled', 'no_show')
    AND b.check_in <= p_date
    AND b.check_out > p_date;

  RETURN QUERY SELECT
    p_date,
    v_total,
    v_occupied,
    GREATEST(v_total - v_occupied, 0),
    CASE
      WHEN v_total > 0 THEN ROUND((v_occupied::DECIMAL / v_total) * 100, 2)
      ELSE 0
    END;
END;
$$;

COMMENT ON FUNCTION get_occupancy_rate IS
'Occupancy for a date using booking_tents + booking_status. Returns total, occupied, available tents and occupancy %.';

-- ----------------------------------------------------------------------------
-- 2. get_tent_booking_history — rewrite against booking_tents and the inline
--    customer columns. Return columns changed, so DROP first.
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS get_tent_booking_history(UUID, INTEGER);

CREATE OR REPLACE FUNCTION get_tent_booking_history(
  p_tent_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  booking_id UUID,
  booking_number VARCHAR,
  customer_name VARCHAR,
  check_in DATE,
  check_out DATE,
  booking_status VARCHAR,
  total_amount DECIMAL
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.booking_number,
    b.customer_name,
    b.check_in,
    b.check_out,
    b.booking_status,
    b.total_amount
  FROM bookings b
  INNER JOIN booking_tents bt ON bt.booking_id = b.id
  WHERE bt.tent_id = p_tent_id
  ORDER BY b.check_in DESC
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION get_tent_booking_history IS
'Most recent bookings for a tent (via booking_tents).';

-- ----------------------------------------------------------------------------
-- 3. create_manual_booking — admin-created booking with NO online payment.
--    Mirrors create_booking_with_payment''s tent assignment/locking, but skips
--    Razorpay verification and records an offline payment row. payment_status
--    is 'paid' (collected offline) or 'pending' (collect later).
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS create_manual_booking;

CREATE OR REPLACE FUNCTION create_manual_booking(
  p_booking_number TEXT,
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_check_in DATE,
  p_check_out DATE,
  p_tent_items JSONB, -- [{tentTypeSlug, quantity, pricePerNight}]
  p_adults INTEGER,
  p_children INTEGER,
  p_total_amount DECIMAL(10, 2),
  p_special_requests TEXT,
  p_payment_status TEXT -- 'paid' | 'pending'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_booking_id UUID;
  v_payment_id UUID;
  v_tent_item JSONB;
  v_tent_type_id UUID;
  v_tent_type_slug TEXT;
  v_quantity INTEGER;
  v_price_per_night DECIMAL(10, 2);
  v_available_tents UUID[];
  v_tent_id UUID;
  v_nights INTEGER;
  v_total_tents_assigned INTEGER := 0;
  v_total_tents_requested INTEGER := 0;
BEGIN
  v_nights := p_check_out - p_check_in;
  IF v_nights <= 0 THEN
    RAISE EXCEPTION 'invalid_dates: Check-out must be after check-in';
  END IF;

  IF p_tent_items IS NULL OR jsonb_array_length(p_tent_items) = 0 THEN
    RAISE EXCEPTION 'invalid_tent_items: At least one tent type must be specified';
  END IF;

  IF p_payment_status NOT IN ('paid', 'pending') THEN
    RAISE EXCEPTION 'invalid_payment_status: must be paid or pending';
  END IF;

  FOR v_tent_item IN SELECT * FROM jsonb_array_elements(p_tent_items)
  LOOP
    v_total_tents_requested := v_total_tents_requested + (v_tent_item->>'quantity')::INTEGER;
  END LOOP;

  -- Create the booking (always confirmed; payment_status as chosen)
  INSERT INTO bookings (
    booking_number, customer_name, customer_email, customer_phone,
    check_in, check_out, adults, children, total_amount,
    booking_status, payment_status, special_requests, created_at, updated_at
  ) VALUES (
    p_booking_number, p_customer_name, p_customer_email, p_customer_phone,
    p_check_in, p_check_out, p_adults, p_children, p_total_amount,
    'confirmed', p_payment_status, p_special_requests, NOW(), NOW()
  )
  RETURNING id INTO v_booking_id;

  -- Assign tents per type with row-level locking (same as the online flow)
  FOR v_tent_item IN SELECT * FROM jsonb_array_elements(p_tent_items)
  LOOP
    v_tent_type_slug := v_tent_item->>'tentTypeSlug';
    v_quantity := (v_tent_item->>'quantity')::INTEGER;
    v_price_per_night := (v_tent_item->>'pricePerNight')::DECIMAL(10, 2);

    IF v_quantity <= 0 THEN
      RAISE EXCEPTION 'invalid_quantity: Quantity must be positive for tent type %', v_tent_type_slug;
    END IF;

    SELECT id INTO v_tent_type_id
    FROM tent_types
    WHERE slug = v_tent_type_slug AND is_active = true;

    IF v_tent_type_id IS NULL THEN
      RAISE EXCEPTION 'invalid_tent_type: Tent type % not found or inactive', v_tent_type_slug;
    END IF;

    WITH locked_tents AS (
      SELECT t.id
      FROM tents t
      WHERE t.tent_type_id = v_tent_type_id
        AND t.status = 'available'
        AND t.id NOT IN (
          SELECT bt.tent_id
          FROM booking_tents bt
          INNER JOIN bookings b ON bt.booking_id = b.id
          WHERE b.booking_status NOT IN ('cancelled', 'no_show')
            AND (b.check_in < p_check_out AND b.check_out > p_check_in)
        )
      LIMIT v_quantity
      FOR UPDATE OF t
    )
    SELECT ARRAY_AGG(id) INTO v_available_tents FROM locked_tents;

    IF v_available_tents IS NULL OR array_length(v_available_tents, 1) < v_quantity THEN
      RAISE EXCEPTION 'insufficient_tents: Only % tents available for type %, but % requested',
        COALESCE(array_length(v_available_tents, 1), 0), v_tent_type_slug, v_quantity;
    END IF;

    FOREACH v_tent_id IN ARRAY v_available_tents
    LOOP
      INSERT INTO booking_tents (
        booking_id, tent_id, tent_type_id, price_per_night, nights, subtotal, created_at
      ) VALUES (
        v_booking_id, v_tent_id, v_tent_type_id, v_price_per_night, v_nights,
        v_price_per_night * v_nights, NOW()
      );
      v_total_tents_assigned := v_total_tents_assigned + 1;
    END LOOP;
  END LOOP;

  IF v_total_tents_assigned != v_total_tents_requested THEN
    RAISE EXCEPTION 'tent_assignment_mismatch: Requested % tents but only assigned %',
      v_total_tents_requested, v_total_tents_assigned;
  END IF;

  -- Record an offline payment row (Razorpay ids left NULL).
  INSERT INTO payments (
    booking_id, amount, currency, status, payment_method, paid_at, created_at, updated_at
  ) VALUES (
    v_booking_id, p_total_amount, 'INR', p_payment_status, 'offline',
    CASE WHEN p_payment_status = 'paid' THEN NOW() ELSE NULL END, NOW(), NOW()
  )
  RETURNING id INTO v_payment_id;

  RETURN json_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'booking_number', p_booking_number,
    'payment_id', v_payment_id,
    'nights', v_nights,
    'tents_assigned', v_total_tents_assigned
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '%', SQLERRM;
END;
$$;

GRANT EXECUTE ON FUNCTION create_manual_booking TO authenticated;

COMMENT ON FUNCTION create_manual_booking IS
'Admin-only offline/walk-in booking creation. No Razorpay; records an offline payment row. Assigns tents with row-level locking, mirroring create_booking_with_payment.';

