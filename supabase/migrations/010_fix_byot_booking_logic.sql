-- Migration 010: Fix BYOT Booking Logic in create_booking_with_payment
-- Updates the stored procedure to handle BYOT differently from regular tents
-- BYOT uses a single virtual tent and quantity represents guests, not tents

CREATE OR REPLACE FUNCTION public.create_booking_with_payment(
  p_booking_number text, 
  p_customer_name text, 
  p_customer_email text, 
  p_customer_phone text, 
  p_check_in date, 
  p_check_out date, 
  p_tent_items jsonb, 
  p_adults integer, 
  p_children integer, 
  p_total_amount numeric, 
  p_special_requests text, 
  p_razorpay_order_id text, 
  p_razorpay_payment_id text, 
  p_razorpay_signature text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
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
  v_is_byot BOOLEAN;
  v_byot_virtual_tent_id UUID;
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

  -- Step 4: Calculate total tents requested (excluding BYOT)
  FOR v_tent_item IN SELECT * FROM jsonb_array_elements(p_tent_items)
  LOOP
    v_tent_type_slug := v_tent_item->>'tentTypeSlug';
    
    -- Check if this is BYOT
    SELECT is_byot INTO v_is_byot
    FROM tent_types
    WHERE slug = v_tent_type_slug AND is_active = true;
    
    -- Only count non-BYOT tents in total requested
    IF NOT COALESCE(v_is_byot, false) THEN
      v_total_tents_requested := v_total_tents_requested + (v_tent_item->>'quantity')::INTEGER;
    END IF;
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
    
    -- Get tent type details including BYOT flag
    SELECT id, is_byot INTO v_tent_type_id, v_is_byot
    FROM tent_types
    WHERE slug = v_tent_type_slug AND is_active = true;

    IF v_tent_type_id IS NULL THEN
      RAISE EXCEPTION 'invalid_tent_type: Tent type % not found or inactive', v_tent_type_slug;
    END IF;

    -- Handle BYOT differently from regular tents
    IF COALESCE(v_is_byot, false) THEN
      -- ===== BYOT HANDLING =====
      -- For BYOT, get the virtual tent (there's only one)
      SELECT id INTO v_byot_virtual_tent_id
      FROM tents
      WHERE tent_type_id = v_tent_type_id
        AND tent_number = 'BYOT-VIRTUAL'
      LIMIT 1;

      IF v_byot_virtual_tent_id IS NULL THEN
        RAISE EXCEPTION 'byot_tent_missing: BYOT virtual tent not found';
      END IF;

      -- Calculate subtotal for BYOT (quantity represents guests, not tents)
      v_subtotal := v_price_per_night * v_nights * v_quantity;

      -- Create a single booking_tent entry for BYOT
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
        v_byot_virtual_tent_id,
        v_tent_type_id,
        v_price_per_night,
        v_nights,
        v_subtotal,
        NOW()
      );
      
      -- Don't increment v_total_tents_assigned for BYOT
      
    ELSE
      -- ===== REGULAR TENT HANDLING =====
      -- Find available tents for this type with row-level locking
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
    END IF;
  END LOOP;

  -- Step 7: Verify all requested regular tents were assigned (BYOT doesn't count)
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
$function$;

-- Made with Bob