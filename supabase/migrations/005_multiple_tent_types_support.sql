-- Migration 005: Support Multiple Tent Types Per Booking
-- This migration restructures the database to allow multiple tent types in a single booking

-- ============================================================================
-- STEP 1: Create new booking_tents junction table
-- ============================================================================

CREATE TABLE IF NOT EXISTS booking_tents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL,
  tent_id UUID NOT NULL REFERENCES tents(id) ON DELETE RESTRICT,
  tent_type_id UUID NOT NULL REFERENCES tent_types(id) ON DELETE RESTRICT,
  price_per_night DECIMAL(10, 2) NOT NULL,
  nights INTEGER NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT check_price_per_night CHECK (price_per_night >= 0),
  CONSTRAINT check_nights CHECK (nights > 0),
  CONSTRAINT check_subtotal CHECK (subtotal >= 0),
  CONSTRAINT unique_booking_tent UNIQUE (booking_id, tent_id)
);

CREATE INDEX idx_booking_tents_booking ON booking_tents(booking_id);
CREATE INDEX idx_booking_tents_tent ON booking_tents(tent_id);
CREATE INDEX idx_booking_tents_type ON booking_tents(tent_type_id);

-- ============================================================================
-- STEP 2: Modify bookings table to remove single tent_id
-- ============================================================================

-- Add new columns if they don't exist
ALTER TABLE bookings 
  ADD COLUMN IF NOT EXISTS booking_number VARCHAR(50) UNIQUE,
  ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS adults INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS children INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS booking_status VARCHAR(20) DEFAULT 'pending_payment',
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS tent_type_id UUID REFERENCES tent_types(id);

-- Rename columns for consistency
ALTER TABLE bookings 
  RENAME COLUMN check_in_date TO check_in;
  
ALTER TABLE bookings 
  RENAME COLUMN check_out_date TO check_out;

-- Update constraints
ALTER TABLE bookings 
  DROP CONSTRAINT IF EXISTS check_status;

ALTER TABLE bookings 
  ADD CONSTRAINT check_booking_status CHECK (booking_status IN (
    'pending_payment',
    'confirmed',
    'checked_in',
    'checked_out',
    'cancelled',
    'no_show'
  ));

ALTER TABLE bookings 
  ADD CONSTRAINT check_payment_status CHECK (payment_status IN (
    'pending',
    'authorized',
    'paid',
    'failed',
    'refunded',
    'partially_refunded'
  ));

ALTER TABLE bookings 
  ADD CONSTRAINT check_adults CHECK (adults >= 1);

ALTER TABLE bookings 
  ADD CONSTRAINT check_children CHECK (children >= 0);

-- Make customer_id nullable (we'll store customer info directly in bookings)
ALTER TABLE bookings 
  ALTER COLUMN customer_id DROP NOT NULL;

-- Make tent_id nullable (we'll use booking_tents junction table)
ALTER TABLE bookings 
  ALTER COLUMN tent_id DROP NOT NULL;

-- ============================================================================
-- STEP 3: Add foreign key to booking_tents after bookings table is ready
-- ============================================================================

ALTER TABLE booking_tents 
  ADD CONSTRAINT fk_booking_tents_booking 
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;

-- ============================================================================
-- STEP 4: Update payments table structure
-- ============================================================================

ALTER TABLE payments 
  ADD COLUMN IF NOT EXISTS razorpay_signature VARCHAR(255);

ALTER TABLE payments 
  DROP CONSTRAINT IF EXISTS check_status;

ALTER TABLE payments 
  ADD CONSTRAINT check_payment_status CHECK (status IN (
    'pending',
    'authorized',
    'paid',
    'failed',
    'refunded',
    'partially_refunded'
  ));

-- ============================================================================
-- STEP 5: Add slug column to tent_types for easier reference
-- ============================================================================

ALTER TABLE tent_types 
  ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;

-- Update slugs for existing tent types
UPDATE tent_types SET slug = 'twin_sharing_small' WHERE name = 'Twin Sharing Small Tent';
UPDATE tent_types SET slug = 'twin_sharing_semi_big' WHERE name = 'Twin Sharing Semi Big Tent';
UPDATE tent_types SET slug = 'three_sharing_jungle' WHERE name = 'Three Sharing Jungle Tent';
UPDATE tent_types SET slug = 'four_sharing_jungle' WHERE name = 'Four Sharing Jungle Tent';

-- ============================================================================
-- STEP 6: Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_bookings_booking_number ON bookings(booking_number);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in ON bookings(check_in);
CREATE INDEX IF NOT EXISTS idx_bookings_check_out ON bookings(check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);

-- ============================================================================
-- STEP 7: Add comments for documentation
-- ============================================================================

COMMENT ON TABLE booking_tents IS 
'Junction table linking bookings to multiple tents. Supports multiple tent types per booking.';

COMMENT ON COLUMN booking_tents.price_per_night IS 
'Price per night for this specific tent at the time of booking (historical pricing).';

COMMENT ON COLUMN booking_tents.nights IS 
'Number of nights for this tent (calculated from check_in and check_out).';

COMMENT ON COLUMN booking_tents.subtotal IS 
'Subtotal for this tent (price_per_night * nights).';

COMMENT ON COLUMN bookings.booking_number IS 
'Human-readable booking reference number (e.g., WE-20241225-0001).';

COMMENT ON COLUMN bookings.tent_type_id IS 
'Deprecated: Use booking_tents junction table for multiple tent types.';

COMMENT ON COLUMN bookings.tent_id IS 
'Deprecated: Use booking_tents junction table for multiple tent assignments.';

-- Made with Bob
