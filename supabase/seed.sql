-- ============================================================================
-- SEED DATA FOR WILD EARTH JUNGLE CAMP
-- ============================================================================

-- Clear existing data (in correct order due to foreign keys)
TRUNCATE TABLE booking_addons CASCADE;
TRUNCATE TABLE payments CASCADE;
TRUNCATE TABLE bookings CASCADE;
TRUNCATE TABLE customers CASCADE;
TRUNCATE TABLE tents CASCADE;
TRUNCATE TABLE tent_types CASCADE;
TRUNCATE TABLE addons CASCADE;
TRUNCATE TABLE inventory_items CASCADE;
TRUNCATE TABLE expenses CASCADE;
TRUNCATE TABLE users CASCADE;

-- Reset sequences
ALTER SEQUENCE booking_ref_seq RESTART WITH 1;

-- ============================================================================
-- 1. TENT TYPES (4 types with exact pricing)
-- ============================================================================
INSERT INTO tent_types (name, capacity, base_price, description, amenities, is_active) VALUES
(
  'Twin Sharing Small Tent',
  2,
  3999.00,
  'Cozy twin sharing tent perfect for couples. Compact yet comfortable with all essential amenities.',
  '["Comfortable Mattress", "Sleeping Bags", "Pillows", "Blankets", "Lantern", "Shared Bathroom"]'::jsonb,
  true
),
(
  'Twin Sharing Semi Big Tent',
  2,
  4999.00,
  'Spacious twin sharing tent with extra room for luggage and comfort. Ideal for couples seeking more space.',
  '["Premium Mattress", "Sleeping Bags", "Pillows", "Blankets", "Lantern", "Side Table", "Shared Bathroom"]'::jsonb,
  true
),
(
  'Three Sharing Jungle Tent',
  3,
  7500.00,
  'Comfortable jungle tent designed for three guests. Perfect for small families or groups of friends.',
  '["3 Mattresses", "Sleeping Bags", "Pillows", "Blankets", "Lantern", "Storage Space", "Shared Bathroom"]'::jsonb,
  true
),
(
  'Four Sharing Jungle Tent',
  4,
  8000.00,
  'Large family tent accommodating four guests comfortably. Spacious and well-equipped for families.',
  '["4 Mattresses", "Sleeping Bags", "Pillows", "Blankets", "Lantern", "Storage Space", "Seating Area", "Shared Bathroom"]'::jsonb,
  true
);

-- ============================================================================
-- 2. PHYSICAL TENTS (15 individual tents)
-- ============================================================================

-- 5 Twin Sharing Small Tents
INSERT INTO tents (tent_type_id, tent_number, status, notes) VALUES
((SELECT id FROM tent_types WHERE name = 'Twin Sharing Small Tent'), '1', 'available', 'Near entrance, easy access'),
((SELECT id FROM tent_types WHERE name = 'Twin Sharing Small Tent'), '2', 'available', 'Quiet location'),
((SELECT id FROM tent_types WHERE name = 'Twin Sharing Small Tent'), '3', 'available', 'Garden view'),
((SELECT id FROM tent_types WHERE name = 'Twin Sharing Small Tent'), '4', 'available', 'Near dining area'),
((SELECT id FROM tent_types WHERE name = 'Twin Sharing Small Tent'), '5', 'available', 'Riverside location');

-- 5 Twin Sharing Semi Big Tents
INSERT INTO tents (tent_type_id, tent_number, status, notes) VALUES
((SELECT id FROM tent_types WHERE name = 'Twin Sharing Semi Big Tent'), '1', 'available', 'Premium location with forest view'),
((SELECT id FROM tent_types WHERE name = 'Twin Sharing Semi Big Tent'), '2', 'available', 'Secluded spot'),
((SELECT id FROM tent_types WHERE name = 'Twin Sharing Semi Big Tent'), '3', 'available', 'Near bonfire area'),
((SELECT id FROM tent_types WHERE name = 'Twin Sharing Semi Big Tent'), '4', 'available', 'Hilltop view'),
((SELECT id FROM tent_types WHERE name = 'Twin Sharing Semi Big Tent'), '5', 'available', 'Lakeside location');

-- 3 Three Sharing Jungle Tents
INSERT INTO tents (tent_type_id, tent_number, status, notes) VALUES
((SELECT id FROM tent_types WHERE name = 'Three Sharing Jungle Tent'), '1', 'available', 'Family-friendly location'),
((SELECT id FROM tent_types WHERE name = 'Three Sharing Jungle Tent'), '2', 'available', 'Near activity center'),
((SELECT id FROM tent_types WHERE name = 'Three Sharing Jungle Tent'), '3', 'available', 'Jungle view');

-- 2 Four Sharing Jungle Tents
INSERT INTO tents (tent_type_id, tent_number, status, notes) VALUES
((SELECT id FROM tent_types WHERE name = 'Four Sharing Jungle Tent'), '1', 'available', 'Large family tent with extra space'),
((SELECT id FROM tent_types WHERE name = 'Four Sharing Jungle Tent'), '2', 'available', 'Premium family location');

-- ============================================================================
-- 3. ADD-ONS (Meals and Activities)
-- ============================================================================

-- Meals
INSERT INTO addons (name, price, description, category, is_active) VALUES
(
  'Lunch',
  300.00,
  'Delicious lunch featuring local cuisine with vegetarian and non-vegetarian options. Includes main course, rice, bread, and dessert.',
  'meal',
  true
),
(
  'Dinner',
  400.00,
  'Gourmet dinner under the stars with a variety of dishes. Includes appetizer, main course, rice, bread, and dessert.',
  'meal',
  true
),
(
  'Breakfast',
  250.00,
  'Hearty breakfast to start your day. Includes eggs, toast, fruits, tea/coffee, and local specialties.',
  'meal',
  true
);

-- Activities
INSERT INTO addons (name, price, description, category, is_active) VALUES
(
  'Bonfire',
  500.00,
  'Evening bonfire experience with seating arrangements. Perfect for storytelling and stargazing. Includes marshmallows and snacks.',
  'activity',
  true
),
(
  'Boating',
  600.00,
  'Peaceful boating experience on the lake. 1-hour session with life jackets provided. Maximum 4 persons per boat.',
  'activity',
  true
),
(
  'Fishing',
  400.00,
  'Fishing experience with equipment provided. Learn traditional fishing techniques. Catch and release policy.',
  'activity',
  true
),
(
  'Bird Watching',
  500.00,
  'Guided bird watching tour with binoculars provided. Early morning session (6 AM - 8 AM) for best experience.',
  'activity',
  true
),
(
  'Jungle Trek',
  800.00,
  'Guided jungle trek through scenic trails. 2-3 hours duration. Suitable for all fitness levels.',
  'activity',
  true
),
(
  'Cycling',
  350.00,
  'Bicycle rental for exploring the campsite and nearby areas. Helmets provided. 2-hour session.',
  'activity',
  true
);

-- ============================================================================
-- 4. INVENTORY ITEMS (Detailed inventory)
-- ============================================================================

-- Bedding Items
INSERT INTO inventory_items (category, name, quantity, condition, purchase_date, notes) VALUES
('bedding', 'Mattress - Single', 20, 'good', '2024-01-15', 'High-quality foam mattresses'),
('bedding', 'Sleeping Bag - Premium', 25, 'good', '2024-01-15', 'All-season sleeping bags'),
('bedding', 'Pillow - Standard', 30, 'good', '2024-01-15', 'Comfortable pillows with covers'),
('bedding', 'Blanket - Woolen', 30, 'good', '2024-01-15', 'Warm woolen blankets'),
('bedding', 'Bed Sheet Set', 25, 'good', '2024-01-15', 'Cotton bed sheets');

-- Furniture
INSERT INTO inventory_items (category, name, quantity, condition, purchase_date, notes) VALUES
('furniture', 'Dining Table - 6 Seater', 8, 'good', '2024-01-10', 'Wooden dining tables'),
('furniture', 'Dining Chair', 48, 'good', '2024-01-10', 'Comfortable dining chairs'),
('furniture', 'Bench - Outdoor', 12, 'good', '2024-01-10', 'Wooden benches for outdoor seating'),
('furniture', 'Side Table', 15, 'good', '2024-01-10', 'Small tables for tents'),
('furniture', 'Lounge Chair', 10, 'good', '2024-01-10', 'Relaxing chairs for common area');

-- Kitchen Items
INSERT INTO inventory_items (category, name, quantity, condition, purchase_date, notes) VALUES
('kitchen', 'Cooking Pot - Large', 10, 'good', '2024-01-05', 'Stainless steel pots'),
('kitchen', 'Cooking Pot - Medium', 8, 'good', '2024-01-05', 'Stainless steel pots'),
('kitchen', 'Frying Pan', 6, 'good', '2024-01-05', 'Non-stick pans'),
('kitchen', 'Dinner Plates', 60, 'good', '2024-01-05', 'Melamine plates'),
('kitchen', 'Bowls', 60, 'good', '2024-01-05', 'Serving bowls'),
('kitchen', 'Glasses', 60, 'good', '2024-01-05', 'Drinking glasses'),
('kitchen', 'Cutlery Set', 60, 'good', '2024-01-05', 'Spoons, forks, knives'),
('kitchen', 'Serving Trays', 15, 'good', '2024-01-05', 'Large serving trays'),
('kitchen', 'Water Jugs', 20, 'good', '2024-01-05', 'Insulated water jugs');

-- Lighting
INSERT INTO inventory_items (category, name, quantity, condition, purchase_date, notes) VALUES
('lighting', 'LED Lantern', 25, 'good', '2024-01-08', 'Rechargeable LED lanterns'),
('lighting', 'Flashlight', 20, 'good', '2024-01-08', 'High-power flashlights'),
('lighting', 'String Lights', 15, 'good', '2024-01-08', 'Decorative string lights'),
('lighting', 'Emergency Light', 10, 'good', '2024-01-08', 'Backup emergency lights');

-- Safety Equipment
INSERT INTO inventory_items (category, name, quantity, condition, purchase_date, notes) VALUES
('safety', 'First Aid Kit - Complete', 5, 'good', '2024-01-01', 'Fully stocked first aid kits'),
('safety', 'Fire Extinguisher', 10, 'good', '2024-01-01', 'ABC type fire extinguishers'),
('safety', 'Life Jacket', 12, 'good', '2024-01-01', 'For boating activities'),
('safety', 'Emergency Whistle', 20, 'good', '2024-01-01', 'Safety whistles'),
('safety', 'Torch Light', 15, 'good', '2024-01-01', 'High-beam torches');

-- Activity Equipment
INSERT INTO inventory_items (category, name, quantity, condition, purchase_date, notes) VALUES
('activity', 'Bicycle - Adult', 8, 'good', '2024-01-12', 'Mountain bikes'),
('activity', 'Bicycle - Kids', 4, 'good', '2024-01-12', 'Kids bicycles'),
('activity', 'Helmet', 15, 'good', '2024-01-12', 'Safety helmets'),
('activity', 'Fishing Rod', 6, 'good', '2024-01-12', 'Fishing equipment'),
('activity', 'Binoculars', 8, 'good', '2024-01-12', 'For bird watching'),
('activity', 'Boat - 4 Seater', 3, 'good', '2024-01-12', 'Rowing boats'),
('activity', 'Life Jacket - Adult', 12, 'good', '2024-01-12', 'For boating'),
('activity', 'Life Jacket - Kids', 6, 'good', '2024-01-12', 'For boating');

-- Cleaning Supplies
INSERT INTO inventory_items (category, name, quantity, condition, purchase_date, notes) VALUES
('cleaning', 'Broom', 10, 'good', '2024-01-05', 'Cleaning brooms'),
('cleaning', 'Mop', 8, 'good', '2024-01-05', 'Floor mops'),
('cleaning', 'Bucket', 12, 'good', '2024-01-05', 'Cleaning buckets'),
('cleaning', 'Dustbin - Large', 15, 'good', '2024-01-05', 'Waste bins'),
('cleaning', 'Dustbin - Small', 20, 'good', '2024-01-05', 'Small waste bins');

-- ============================================================================
-- 5. ADMIN USERS
-- ============================================================================
INSERT INTO users (email, role, full_name, is_active) VALUES
('admin@wildearthjunglecamp.com', 'admin', 'Admin User', true),
('manager@wildearthjunglecamp.com', 'manager', 'Camp Manager', true),
('staff@wildearthjunglecamp.com', 'staff', 'Camp Staff', true);

-- ============================================================================
-- 6. SAMPLE CUSTOMERS (for testing)
-- ============================================================================
INSERT INTO customers (name, email, phone, city, state, country) VALUES
('Rajesh Kumar', 'rajesh.kumar@example.com', '+919876543210', 'Bangalore', 'Karnataka', 'India'),
('Priya Sharma', 'priya.sharma@example.com', '+919876543211', 'Mumbai', 'Maharashtra', 'India'),
('Amit Patel', 'amit.patel@example.com', '+919876543212', 'Ahmedabad', 'Gujarat', 'India'),
('Sneha Reddy', 'sneha.reddy@example.com', '+919876543213', 'Hyderabad', 'Telangana', 'India'),
('Vikram Singh', 'vikram.singh@example.com', '+919876543214', 'Delhi', 'Delhi', 'India');

-- ============================================================================
-- 7. SAMPLE BOOKINGS (for testing and demonstration)
-- ============================================================================

-- Confirmed booking
INSERT INTO bookings (
  customer_id,
  tent_id,
  check_in_date,
  check_out_date,
  guest_count,
  status,
  total_amount,
  special_requests
) VALUES (
  (SELECT id FROM customers WHERE email = 'rajesh.kumar@example.com'),
  (SELECT id FROM tents WHERE tent_type_id = (SELECT id FROM tent_types WHERE name = 'Twin Sharing Small Tent') AND tent_number = '1'),
  CURRENT_DATE + INTERVAL '7 days',
  CURRENT_DATE + INTERVAL '9 days',
  2,
  'confirmed',
  7998.00,
  'Early check-in if possible'
);

-- Pending payment booking
INSERT INTO bookings (
  customer_id,
  tent_id,
  check_in_date,
  check_out_date,
  guest_count,
  status,
  total_amount,
  special_requests
) VALUES (
  (SELECT id FROM customers WHERE email = 'priya.sharma@example.com'),
  (SELECT id FROM tents WHERE tent_type_id = (SELECT id FROM tent_types WHERE name = 'Four Sharing Jungle Tent') AND tent_number = '1'),
  CURRENT_DATE + INTERVAL '14 days',
  CURRENT_DATE + INTERVAL '16 days',
  4,
  'pending_payment',
  16000.00,
  'Need extra blankets'
);

-- ============================================================================
-- 8. SAMPLE EXPENSES (for demonstration)
-- ============================================================================
INSERT INTO expenses (date, category, amount, description, payment_method, created_by) VALUES
(CURRENT_DATE - INTERVAL '5 days', 'food', 15000.00, 'Monthly grocery supplies', 'cash', (SELECT id FROM users WHERE role = 'admin')),
(CURRENT_DATE - INTERVAL '10 days', 'maintenance', 5000.00, 'Tent repairs and maintenance', 'bank_transfer', (SELECT id FROM users WHERE role = 'admin')),
(CURRENT_DATE - INTERVAL '15 days', 'utilities', 8000.00, 'Electricity bill', 'online', (SELECT id FROM users WHERE role = 'admin')),
(CURRENT_DATE - INTERVAL '20 days', 'supplies', 12000.00, 'Bedding and cleaning supplies', 'cash', (SELECT id FROM users WHERE role = 'manager')),
(CURRENT_DATE - INTERVAL '25 days', 'staff', 45000.00, 'Staff salaries', 'bank_transfer', (SELECT id FROM users WHERE role = 'admin'));

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify tent types
SELECT 'Tent Types:' as info;
SELECT name, capacity, base_price FROM tent_types ORDER BY capacity, base_price;

-- Verify physical tents count
SELECT 'Physical Tents Count:' as info;
SELECT 
  tt.name,
  COUNT(t.id) as tent_count
FROM tent_types tt
LEFT JOIN tents t ON tt.id = t.tent_type_id
GROUP BY tt.name
ORDER BY tt.capacity;

-- Verify add-ons
SELECT 'Add-ons:' as info;
SELECT name, category, price FROM addons ORDER BY category, name;

-- Verify inventory summary
SELECT 'Inventory Summary:' as info;
SELECT 
  category,
  COUNT(*) as item_types,
  SUM(quantity) as total_quantity
FROM inventory_items
GROUP BY category
ORDER BY category;

-- Total counts
SELECT 'Summary:' as info;
SELECT 
  (SELECT COUNT(*) FROM tent_types) as tent_types,
  (SELECT COUNT(*) FROM tents) as physical_tents,
  (SELECT COUNT(*) FROM addons) as addons,
  (SELECT COUNT(*) FROM inventory_items) as inventory_items,
  (SELECT COUNT(*) FROM customers) as customers,
  (SELECT COUNT(*) FROM bookings) as bookings;

-- Made with Bob
