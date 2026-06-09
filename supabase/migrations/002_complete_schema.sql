-- Complete Database Schema for Wild Earth Jungle Camp
-- Migration 002: Comprehensive schema with all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. TENT TYPES TABLE
-- ============================================================================
CREATE TABLE tent_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  capacity INTEGER NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  amenities JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT check_capacity CHECK (capacity > 0),
  CONSTRAINT check_base_price CHECK (base_price >= 0)
);

-- Insert tent types
INSERT INTO tent_types (name, capacity, base_price, description) VALUES
  ('Twin Sharing Small Tent', 2, 3999.00, 'Cozy twin sharing tent perfect for couples'),
  ('Twin Sharing Semi Big Tent', 2, 4999.00, 'Spacious twin sharing tent with extra room'),
  ('Three Sharing Jungle Tent', 3, 7499.00, 'Comfortable tent for three guests'),
  ('Four Sharing Jungle Tent', 4, 7999.00, 'Large family tent for four guests');

-- ============================================================================
-- 2. TENTS TABLE (Individual tent instances)
-- ============================================================================
CREATE TABLE tents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tent_type_id UUID NOT NULL REFERENCES tent_types(id) ON DELETE RESTRICT,
  tent_number VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'available',
  notes TEXT,
  last_maintenance_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_tent_number UNIQUE (tent_type_id, tent_number),
  CONSTRAINT check_status CHECK (status IN ('available', 'occupied', 'maintenance', 'out_of_service'))
);

CREATE INDEX idx_tents_type ON tents(tent_type_id);
CREATE INDEX idx_tents_status ON tents(status);

-- Insert sample tents
INSERT INTO tents (tent_type_id, tent_number, status) VALUES
  ((SELECT id FROM tent_types WHERE name = 'Twin Sharing Small Tent'), '1', 'available'),
  ((SELECT id FROM tent_types WHERE name = 'Twin Sharing Small Tent'), '2', 'available'),
  ((SELECT id FROM tent_types WHERE name = 'Twin Sharing Small Tent'), '3', 'available'),
  ((SELECT id FROM tent_types WHERE name = 'Twin Sharing Semi Big Tent'), '1', 'available'),
  ((SELECT id FROM tent_types WHERE name = 'Twin Sharing Semi Big Tent'), '2', 'available'),
  ((SELECT id FROM tent_types WHERE name = 'Three Sharing Jungle Tent'), '1', 'available'),
  ((SELECT id FROM tent_types WHERE name = 'Three Sharing Jungle Tent'), '2', 'available'),
  ((SELECT id FROM tent_types WHERE name = 'Four Sharing Jungle Tent'), '1', 'available'),
  ((SELECT id FROM tent_types WHERE name = 'Four Sharing Jungle Tent'), '2', 'available');

-- ============================================================================
-- 3. CUSTOMERS TABLE
-- ============================================================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT check_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);

-- ============================================================================
-- 4. BOOKINGS TABLE
-- ============================================================================
CREATE SEQUENCE booking_ref_seq START 1;

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference VARCHAR(20) NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  tent_id UUID NOT NULL REFERENCES tents(id) ON DELETE RESTRICT,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  guest_count INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending_payment',
  total_amount DECIMAL(10, 2) NOT NULL,
  special_requests TEXT,
  checked_in_at TIMESTAMP,
  checked_out_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT check_dates CHECK (check_out_date > check_in_date),
  CONSTRAINT check_guest_count CHECK (guest_count > 0),
  CONSTRAINT check_status CHECK (status IN (
    'pending_payment',
    'confirmed',
    'checked_in',
    'checked_out',
    'cancelled'
  )),
  CONSTRAINT check_total_amount CHECK (total_amount >= 0)
);

CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_tent ON bookings(tent_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);

-- Function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
  NEW.booking_reference := 'WE' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('booking_ref_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_booking_reference
  BEFORE INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.booking_reference IS NULL)
  EXECUTE FUNCTION generate_booking_reference();

-- ============================================================================
-- 5. ADDONS TABLE
-- ============================================================================
CREATE TABLE addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT check_price CHECK (price >= 0)
);

CREATE INDEX idx_addons_active ON addons(is_active);

-- Insert default addons
INSERT INTO addons (name, price, description, category) VALUES
  ('Lunch', 300.00, 'Delicious lunch with local cuisine', 'meal'),
  ('Dinner', 400.00, 'Gourmet dinner under the stars', 'meal'),
  ('Breakfast', 250.00, 'Hearty breakfast to start your day', 'meal'),
  ('Bonfire', 500.00, 'Evening bonfire experience', 'activity'),
  ('Guided Trek', 800.00, 'Guided jungle trek', 'activity');

-- ============================================================================
-- 6. BOOKING ADDONS TABLE
-- ============================================================================
CREATE TABLE booking_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  addon_id UUID NOT NULL REFERENCES addons(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT check_quantity CHECK (quantity > 0),
  CONSTRAINT check_addon_price CHECK (price >= 0)
);

CREATE INDEX idx_booking_addons_booking ON booking_addons(booking_id);
CREATE INDEX idx_booking_addons_addon ON booking_addons(addon_id);
CREATE INDEX idx_booking_addons_date ON booking_addons(date);

-- ============================================================================
-- 7. PAYMENTS TABLE (Razorpay Integration)
-- ============================================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  razorpay_order_id VARCHAR(100) UNIQUE,
  razorpay_payment_id VARCHAR(100) UNIQUE,
  razorpay_signature VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status VARCHAR(20) DEFAULT 'pending',
  payment_method VARCHAR(50),
  paid_at TIMESTAMP,
  refund_id VARCHAR(100),
  refund_amount DECIMAL(10, 2),
  refunded_at TIMESTAMP,
  notes JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT check_amount CHECK (amount >= 0),
  CONSTRAINT check_status CHECK (status IN (
    'pending',
    'processing',
    'completed',
    'failed',
    'refunded',
    'partially_refunded'
  ))
);

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_razorpay_order ON payments(razorpay_order_id);
CREATE INDEX idx_payments_razorpay_payment ON payments(razorpay_payment_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================================================
-- 8. INVENTORY ITEMS TABLE
-- ============================================================================
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  condition VARCHAR(20) DEFAULT 'good',
  purchase_date DATE,
  purchase_price DECIMAL(10, 2),
  supplier VARCHAR(255),
  notes TEXT,
  last_checked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT check_quantity CHECK (quantity >= 0),
  CONSTRAINT check_condition CHECK (condition IN ('excellent', 'good', 'fair', 'poor', 'damaged')),
  CONSTRAINT check_purchase_price CHECK (purchase_price >= 0)
);

CREATE INDEX idx_inventory_category ON inventory_items(category);
CREATE INDEX idx_inventory_condition ON inventory_items(condition);

-- Insert sample inventory
INSERT INTO inventory_items (category, name, quantity, condition) VALUES
  ('bedding', 'Mattress', 20, 'good'),
  ('bedding', 'Sleeping Bag', 25, 'good'),
  ('bedding', 'Pillow', 30, 'good'),
  ('bedding', 'Blanket', 30, 'good'),
  ('furniture', 'Table', 10, 'good'),
  ('furniture', 'Chair', 40, 'good'),
  ('furniture', 'Bench', 8, 'good'),
  ('kitchen', 'Cooking Pot', 15, 'good'),
  ('kitchen', 'Plates', 50, 'good'),
  ('kitchen', 'Glasses', 50, 'good'),
  ('kitchen', 'Cutlery Set', 50, 'good'),
  ('lighting', 'Lantern', 20, 'good'),
  ('lighting', 'Flashlight', 15, 'good'),
  ('safety', 'First Aid Kit', 5, 'good'),
  ('safety', 'Fire Extinguisher', 8, 'good');

-- ============================================================================
-- 9. USERS TABLE
-- ============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  full_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT check_role CHECK (role IN ('admin', 'manager', 'staff'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- 10. EXPENSES TABLE
-- ============================================================================
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  payment_method VARCHAR(50),
  receipt_url TEXT,
  vendor VARCHAR(255),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT check_amount CHECK (amount > 0)
);

CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_created_by ON expenses(created_by);

COMMENT ON COLUMN expenses.category IS 'Categories: food, maintenance, utilities, supplies, staff, marketing, transportation, other';

-- ============================================================================
-- TRIGGERS FOR updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tent_types_updated_at BEFORE UPDATE ON tent_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tents_updated_at BEFORE UPDATE ON tents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addons_updated_at BEFORE UPDATE ON addons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- USEFUL VIEWS
-- ============================================================================

-- Available Tents View
CREATE VIEW available_tents_view AS
SELECT 
  t.id,
  t.tent_number,
  tt.name as tent_type_name,
  tt.capacity,
  tt.base_price,
  t.status
FROM tents t
JOIN tent_types tt ON t.tent_type_id = tt.id
WHERE t.status = 'available'
ORDER BY tt.name, t.tent_number;

-- Booking Summary View
CREATE VIEW booking_summary_view AS
SELECT 
  b.id,
  b.booking_reference,
  c.name as customer_name,
  c.email as customer_email,
  c.phone as customer_phone,
  tt.name as tent_type,
  t.tent_number,
  b.check_in_date,
  b.check_out_date,
  b.guest_count,
  b.status,
  b.total_amount,
  p.status as payment_status,
  p.razorpay_payment_id
FROM bookings b
JOIN customers c ON b.customer_id = c.id
JOIN tents t ON b.tent_id = t.id
JOIN tent_types tt ON t.tent_type_id = tt.id
LEFT JOIN payments p ON b.id = p.booking_id
ORDER BY b.created_at DESC;

-- Revenue Summary View
CREATE VIEW revenue_summary_view AS
SELECT 
  DATE_TRUNC('month', b.check_in_date) as month,
  COUNT(*) as total_bookings,
  SUM(b.total_amount) as total_revenue,
  AVG(b.total_amount) as average_booking_value
FROM bookings b
WHERE b.status IN ('confirmed', 'checked_in', 'checked_out')
GROUP BY DATE_TRUNC('month', b.check_in_date)
ORDER BY month DESC;

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Check Tent Availability
CREATE OR REPLACE FUNCTION check_tent_availability(
  p_tent_id UUID,
  p_check_in DATE,
  p_check_out DATE
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM bookings
    WHERE tent_id = p_tent_id
    AND status NOT IN ('cancelled', 'checked_out')
    AND (
      (check_in_date <= p_check_in AND check_out_date > p_check_in)
      OR (check_in_date < p_check_out AND check_out_date >= p_check_out)
      OR (check_in_date >= p_check_in AND check_out_date <= p_check_out)
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Get Available Tents for Date Range
CREATE OR REPLACE FUNCTION get_available_tents(
  p_check_in DATE,
  p_check_out DATE,
  p_guest_count INTEGER DEFAULT NULL
)
RETURNS TABLE (
  tent_id UUID,
  tent_type_name VARCHAR,
  tent_number VARCHAR,
  capacity INTEGER,
  base_price DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    tt.name,
    t.tent_number,
    tt.capacity,
    tt.base_price
  FROM tents t
  JOIN tent_types tt ON t.tent_type_id = tt.id
  WHERE t.status = 'available'
  AND (p_guest_count IS NULL OR tt.capacity >= p_guest_count)
  AND check_tent_availability(t.id, p_check_in, p_check_out)
  ORDER BY tt.capacity, tt.base_price;
END;
$$ LANGUAGE plpgsql;

-- Made with Bob
