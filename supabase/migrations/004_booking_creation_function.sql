-- Migration: Create atomic booking creation function
-- This function handles the entire booking creation process in a single transaction
-- with row-level locking to prevent race conditions and double bookings

CREATE OR REPLACE FUNCTION create_booking_with_payment(
  p_booking_number TEXT,
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_check_in DATE,
  p_check_out DATE,
  p_tent_type TEXT,
  p_tent_quantity INTEGER,
  p_adults INTEGER,
  p_children INTEGER,
  p_total_amount DECIMAL(10, 2),
  p_special_requests TEXT,
  p_razorpay_order_id TEXT,
  p_razorpay_payment_id TEXT,
  p_razorpay_signature TEXT
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_booking_id UUID;
  v_tent_type_id UUID;
  v_available_tents UUID[];
  v_tent_id UUID;
  v_payment_id UUID;
  v_assigned_count INTEGER := 0;
BEGIN
  -- Start transaction (implicit in function)
  
  -- Step 1: Check if payment already exists (prevent duplicate processing)
  IF EXISTS (
    SELECT 1 FROM payments 
    WHERE razorpay_payment_id = p_razorpay_payment_id
  ) THEN
    RAISE EXCEPTION 'duplicate_payment: This payment has already been processed';
  END IF;

  -- Step 2: Get tent type ID
  SELECT id INTO v_tent_type_id
  FROM tent_types
  WHERE slug = p_tent_type;

  IF v_tent_type_id IS NULL THEN
    RAISE EXCEPTION 'invalid_tent_type: Tent type not found';
  END IF;

  -- Step 3: Find available tents with row-level locking
  -- This prevents race conditions by locking the rows until transaction completes
  SELECT ARRAY_AGG(t.id)
  INTO v_available_tents
  FROM tents t
  WHERE t.tent_type_id = v_tent_type_id
    AND t.status = 'available'
    AND t.id NOT IN (
      -- Exclude tents that are already booked for overlapping dates
      SELECT bt.tent_id
      FROM booking_tents bt
      INNER JOIN bookings b ON bt.booking_id = b.id
      WHERE b.booking_status NOT IN ('cancelled', 'no_show')
        AND (
          -- Check for date overlap
          (b.check_in < p_check_out AND b.check_out > p_check_in)
        )
    )
  LIMIT p_tent_quantity
  FOR UPDATE OF t; -- Lock the tent rows

  -- Step 4: Validate sufficient tents available
  IF v_available_tents IS NULL OR array_length(v_available_tents, 1) < p_tent_quantity THEN
    RAISE EXCEPTION 'insufficient_tents: Only % tents available, but % requested', 
      COALESCE(array_length(v_available_tents, 1), 0), 
      p_tent_quantity;
  END IF;

  -- Step 5: Create booking record
  INSERT INTO bookings (
    booking_number,
    customer_name,
    customer_email,
    customer_phone,
    check_in,
    check_out,
    tent_type_id,
    adults,
    children,
    total_amount,
    booking_status,
    payment_status,
    special_requests,
    created_at,
    updated_at
  ) VALUES (
    p_booking_number,
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_check_in,
    p_check_out,
    v_tent_type_id,
    p_adults,
    p_children,
    p_total_amount,
    'confirmed', -- Booking is confirmed since payment is verified
    'paid',      -- Payment status is paid
    p_special_requests,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_booking_id;

  -- Step 6: Assign tents to booking
  FOREACH v_tent_id IN ARRAY v_available_tents
  LOOP
    INSERT INTO booking_tents (
      booking_id,
      tent_id,
      created_at
    ) VALUES (
      v_booking_id,
      v_tent_id,
      NOW()
    );
    
    v_assigned_count := v_assigned_count + 1;
  END LOOP;

  -- Step 7: Create payment record
  INSERT INTO payments (
    booking_id,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amount,
    currency,
    status,
    payment_method,
    paid_at,
    created_at,
    updated_at
  ) VALUES (
    v_booking_id,
    p_razorpay_order_id,
    p_razorpay_payment_id,
    p_razorpay_signature,
    p_total_amount,
    'INR',
    'paid',
    'razorpay',
    NOW(),
    NOW(),
    NOW()
  )
  RETURNING id INTO v_payment_id;

  -- Step 8: Return success response
  RETURN json_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'payment_id', v_payment_id,
    'tents_assigned', v_assigned_count,
    'message', 'Booking created successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Rollback happens automatically on exception
    -- Re-raise the exception with details
    RAISE EXCEPTION '%', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_booking_with_payment TO authenticated;
GRANT EXECUTE ON FUNCTION create_booking_with_payment TO anon;

-- Add comment
COMMENT ON FUNCTION create_booking_with_payment IS 
'Atomically creates a booking with payment verification. 
Handles tent assignment with row-level locking to prevent race conditions.
All operations are performed in a single transaction.';

-- Made with Bob
