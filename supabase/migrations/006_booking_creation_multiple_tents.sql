-- Migration 006: Atomic booking creation function with multiple tent types support
-- This function handles booking creation with multiple tent types in a single transaction

-- Drop the old function if it exists
DROP FUNCTION IF EXISTS create_booking_with_payment;

-- Create new function with support for multiple tent types
CREATE OR REPLACE FUNCTION create_booking_with_payment(
  p_booking_number TEXT,
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_check_in DATE,
  p_check_out DATE,
  p_tent_items JSONB, -- Array of {tentTypeSlug, quantity, pricePerNight}
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
  v_payment_id UUID;
  v_tent_item JSONB;
  v_tent_type_id UUID;
  v_tent_type_slug TEXT;
  v_quantity INTEGER;
  v_price_per_night DECIMAL(10, 2);
  v_available_tents UUID[];
  v_tent_id UUID;
  v_nights INTEGER;
  v_subtotal DECIMAL(10, 2);
  v_total_tents_assigned INTEGER := 0;
  v_total_tents_requested INTEGER := 0;
BEGIN
  -- Start transaction (implicit in function)
  
  -- Step 1: Check if payment already exists (prevent duplicate processing)
  IF EXISTS (
    SELECT 1 FROM payments 
    WHERE razorpay_payment_id = p_razorpay_payment_id
  ) THEN
    RAISE EXCEPTION 'duplicate_payment: This payment has already been processed';
  END IF;

  -- Step 2: Calculate number of nights
  v_nights := p_check_out - p_check_in;
  
  IF v_nights <= 0 THEN
    RAISE EXCEPTION 'invalid_dates: Check-out must be after check-in';
  END IF;

  -- Step 3: Validate tent items array
  IF p_tent_items IS NULL OR jsonb_array_length(p_tent_items) = 0 THEN
    RAISE EXCEPTION 'invalid_tent_items: At least one tent type must be specified';
  END IF;

  -- Step 4: Calculate total tents requested
  FOR v_tent_item IN SELECT * FROM jsonb_array_elements(p_tent_items)
  LOOP
    v_total_tents_requested := v_total_tents_requested + (v_tent_item->>'quantity')::INTEGER;
  END LOOP;

  -- Step 5: Create booking record
  INSERT INTO bookings (
    booking_number,
    customer_name,
    customer_email,
    customer_phone,
    check_in,
    check_out,
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

  -- Step 6: Process each tent type and assign tents
  FOR v_tent_item IN SELECT * FROM jsonb_array_elements(p_tent_items)
  LOOP
    -- Extract tent item details
    v_tent_type_slug := v_tent_item->>'tentTypeSlug';
    v_quantity := (v_tent_item->>'quantity')::INTEGER;
    v_price_per_night := (v_tent_item->>'pricePerNight')::DECIMAL(10, 2);
    
    -- Validate quantity
    IF v_quantity <= 0 THEN
      RAISE EXCEPTION 'invalid_quantity: Quantity must be positive for tent type %', v_tent_type_slug;
    END IF;
    
    -- Get tent type ID
    SELECT id INTO v_tent_type_id
    FROM tent_types
    WHERE slug = v_tent_type_slug AND is_active = true;

    IF v_tent_type_id IS NULL THEN
      RAISE EXCEPTION 'invalid_tent_type: Tent type % not found or inactive', v_tent_type_slug;
    END IF;

    -- Find available tents for this type with row-level locking
    -- Use CTE to separate locking from aggregation
    WITH locked_tents AS (
      SELECT t.id
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
      LIMIT v_quantity
      FOR UPDATE OF t -- Lock the tent rows
    )
    SELECT ARRAY_AGG(id)
    INTO v_available_tents
    FROM locked_tents;

    -- Validate sufficient tents available for this type
    IF v_available_tents IS NULL OR array_length(v_available_tents, 1) < v_quantity THEN
      -- Rollback will happen automatically
      RAISE EXCEPTION 'insufficient_tents: Only % tents available for type %, but % requested', 
        COALESCE(array_length(v_available_tents, 1), 0),
        v_tent_type_slug,
        v_quantity;
    END IF;

    -- Calculate subtotal for this tent type
    v_subtotal := v_price_per_night * v_nights * v_quantity;

    -- Assign each tent to the booking
    FOREACH v_tent_id IN ARRAY v_available_tents
    LOOP
      INSERT INTO booking_tents (
        booking_id,
        tent_id,
        tent_type_id,
        price_per_night,
        nights,
        subtotal,
        created_at
      ) VALUES (
        v_booking_id,
        v_tent_id,
        v_tent_type_id,
        v_price_per_night,
        v_nights,
        v_price_per_night * v_nights, -- Subtotal per tent
        NOW()
      );
      
      v_total_tents_assigned := v_total_tents_assigned + 1;
    END LOOP;
  END LOOP;

  -- Step 7: Verify all requested tents were assigned
  IF v_total_tents_assigned != v_total_tents_requested THEN
    RAISE EXCEPTION 'tent_assignment_mismatch: Requested % tents but only assigned %',
      v_total_tents_requested,
      v_total_tents_assigned;
  END IF;

  -- Step 8: Create payment record
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

  -- Step 9: Return success response
  RETURN json_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'payment_id', v_payment_id,
    'tents_assigned', v_total_tents_assigned,
    'nights', v_nights,
    'message', 'Booking created successfully with multiple tent types'
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Rollback happens automatically on exception
    -- Re-raise the exception with details
    RAISE EXCEPTION '%', SQLERRM;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_booking_with_payment TO authenticated;
GRANT EXECUTE ON FUNCTION create_booking_with_payment TO anon;

-- Add comment
COMMENT ON FUNCTION create_booking_with_payment IS 
'Atomically creates a booking with multiple tent types and payment verification.
Handles tent assignment with row-level locking to prevent race conditions.
All operations are performed in a single transaction.
Parameters:
- p_tent_items: JSONB array of {tentTypeSlug, quantity, pricePerNight}
Example: [{"tentTypeSlug": "twin_sharing_small", "quantity": 2, "pricePerNight": 3999.00}]';

-- Made with Bob
