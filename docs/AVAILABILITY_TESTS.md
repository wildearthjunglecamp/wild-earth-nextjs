# Availability Engine - Test Cases

## Test Data Setup

```sql
-- Create test tent types
INSERT INTO tent_types (id, name, capacity, base_price) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Test Twin Tent', 2, 3999.00),
  ('22222222-2222-2222-2222-222222222222', 'Test Family Tent', 4, 8000.00);

-- Create test tents
INSERT INTO tents (id, tent_type_id, tent_number, status) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'T1', 'available'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'T2', 'available'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'F1', 'available');

-- Create test customer
INSERT INTO customers (id, name, email, phone) VALUES
  ('99999999-9999-9999-9999-999999999999', 'Test User', 'test@example.com', '+919999999999');
```

## Test Cases

### Test 1: Basic Availability Check
**Scenario**: Check availability for dates with no existing bookings

```sql
-- Test query
SELECT * FROM get_available_tents_by_type('2024-06-15', '2024-06-17', NULL);

-- Expected result
-- Should return all tent types with all tents available
-- Test Twin Tent: available_count = 2, total_count = 2
-- Test Family Tent: available_count = 1, total_count = 1
```

**Expected Behavior**: ✅ All tents should be available

---

### Test 2: Overlapping Booking - Exact Match
**Scenario**: Existing booking exactly matches new booking dates

```sql
-- Create existing booking
INSERT INTO bookings (customer_id, tent_id, check_in_date, check_out_date, guest_count, status, total_amount)
VALUES (
  '99999999-9999-9999-9999-999999999999',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '2024-06-15',
  '2024-06-17',
  2,
  'confirmed',
  7998.00
);

-- Test query
SELECT * FROM check_tent_availability(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '2024-06-15',
  '2024-06-17'
);

-- Expected result: FALSE
```

**Expected Behavior**: ❌ Tent should NOT be available

---

### Test 3: Overlapping Booking - Partial Overlap (Start)
**Scenario**: New booking starts during existing booking

```sql
-- Existing: 2024-06-15 to 2024-06-17
-- New: 2024-06-16 to 2024-06-18

SELECT * FROM check_tent_availability(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '2024-06-16',
  '2024-06-18'
);

-- Expected result: FALSE
```

**Expected Behavior**: ❌ Tent should NOT be available

---

### Test 4: Overlapping Booking - Partial Overlap (End)
**Scenario**: New booking ends during existing booking

```sql
-- Existing: 2024-06-15 to 2024-06-17
-- New: 2024-06-14 to 2024-06-16

SELECT * FROM check_tent_availability(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '2024-06-14',
  '2024-06-16'
);

-- Expected result: FALSE
```

**Expected Behavior**: ❌ Tent should NOT be available

---

### Test 5: Overlapping Booking - Encompasses
**Scenario**: New booking completely encompasses existing booking

```sql
-- Existing: 2024-06-15 to 2024-06-17
-- New: 2024-06-14 to 2024-06-18

SELECT * FROM check_tent_availability(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '2024-06-14',
  '2024-06-18'
);

-- Expected result: FALSE
```

**Expected Behavior**: ❌ Tent should NOT be available

---

### Test 6: Same-Day Turnover (Allowed)
**Scenario**: Guest A checks out, Guest B checks in same day

```sql
-- Existing: 2024-06-15 to 2024-06-17 (checkout 11 AM on 17th)
-- New: 2024-06-17 to 2024-06-19 (checkin 1 PM on 17th)

SELECT * FROM check_tent_availability(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '2024-06-17',
  '2024-06-19'
);

-- Expected result: TRUE
```

**Expected Behavior**: ✅ Tent SHOULD be available (same-day turnover)

---

### Test 7: Adjacent Bookings (Before)
**Scenario**: New booking ends on day existing booking starts

```sql
-- Existing: 2024-06-15 to 2024-06-17
-- New: 2024-06-13 to 2024-06-15

SELECT * FROM check_tent_availability(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '2024-06-13',
  '2024-06-15'
);

-- Expected result: TRUE
```

**Expected Behavior**: ✅ Tent SHOULD be available (no overlap)

---

### Test 8: Adjacent Bookings (After)
**Scenario**: New booking starts on day existing booking ends

```sql
-- Existing: 2024-06-15 to 2024-06-17
-- New: 2024-06-17 to 2024-06-19

SELECT * FROM check_tent_availability(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '2024-06-17',
  '2024-06-19'
);

-- Expected result: TRUE
```

**Expected Behavior**: ✅ Tent SHOULD be available (same-day turnover)

---

### Test 9: Cancelled Booking
**Scenario**: Existing booking is cancelled

```sql
-- Update booking status to cancelled
UPDATE bookings 
SET status = 'cancelled'
WHERE tent_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Test query
SELECT * FROM check_tent_availability(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '2024-06-15',
  '2024-06-17'
);

-- Expected result: TRUE
```

**Expected Behavior**: ✅ Tent SHOULD be available (cancelled bookings don't block)

---

### Test 10: Checked-Out Booking
**Scenario**: Guest has already checked out

```sql
-- Update booking status to checked_out
UPDATE bookings 
SET status = 'checked_out'
WHERE tent_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Test query
SELECT * FROM check_tent_availability(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '2024-06-15',
  '2024-06-17'
);

-- Expected result: TRUE
```

**Expected Behavior**: ✅ Tent SHOULD be available (checked-out bookings don't block)

---

### Test 11: Tent in Maintenance
**Scenario**: Tent status is 'maintenance'

```sql
-- Update tent status
UPDATE tents 
SET status = 'maintenance'
WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Test query
SELECT * FROM check_tent_availability(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '2024-06-15',
  '2024-06-17'
);

-- Expected result: FALSE
```

**Expected Behavior**: ❌ Tent should NOT be available (maintenance status)

---

### Test 12: Guest Count Filter
**Scenario**: Filter by guest count capacity

```sql
-- Reset tent status
UPDATE tents SET status = 'available';
DELETE FROM bookings;

-- Test query - looking for 4 guests
SELECT * FROM get_available_tents_by_type('2024-06-15', '2024-06-17', 4);

-- Expected result
-- Should only return Test Family Tent (capacity 4)
-- Should NOT return Test Twin Tent (capacity 2)
```

**Expected Behavior**: ✅ Only tents with capacity >= 4 should be returned

---

### Test 13: Multiple Bookings Same Tent
**Scenario**: Multiple non-overlapping bookings for same tent

```sql
-- Create multiple bookings
INSERT INTO bookings (customer_id, tent_id, check_in_date, check_out_date, guest_count, status, total_amount)
VALUES 
  ('99999999-9999-9999-9999-999999999999', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-06-10', '2024-06-12', 2, 'confirmed', 7998.00),
  ('99999999-9999-9999-9999-999999999999', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-06-15', '2024-06-17', 2, 'confirmed', 7998.00),
  ('99999999-9999-9999-9999-999999999999', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-06-20', '2024-06-22', 2, 'confirmed', 7998.00);

-- Test query - between bookings
SELECT * FROM check_tent_availability(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '2024-06-12',
  '2024-06-15'
);

-- Expected result: TRUE
```

**Expected Behavior**: ✅ Tent SHOULD be available between bookings

---

### Test 14: Grouped Results
**Scenario**: Get availability grouped by tent type

```sql
-- Create bookings for some tents
INSERT INTO bookings (customer_id, tent_id, check_in_date, check_out_date, guest_count, status, total_amount)
VALUES 
  ('99999999-9999-9999-9999-999999999999', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-06-15', '2024-06-17', 2, 'confirmed', 7998.00);

-- Test query
SELECT * FROM get_available_tents_by_type('2024-06-15', '2024-06-17', NULL);

-- Expected result
-- Test Twin Tent: available_count = 1 (T2 available, T1 booked)
-- Test Family Tent: available_count = 1 (F1 available)
```

**Expected Behavior**: ✅ Should show correct available counts per type

---

### Test 15: Occupancy Rate
**Scenario**: Calculate occupancy for a specific date

```sql
-- Test query
SELECT * FROM get_occupancy_rate('2024-06-16');

-- Expected result
-- total_tents = 3
-- occupied_tents = 1 (T1 is booked)
-- available_tents = 2 (T2, F1)
-- occupancy_rate = 33.33%
```

**Expected Behavior**: ✅ Should calculate correct occupancy percentage

---

### Test 16: Invalid Date Range
**Scenario**: Check-out before check-in

```sql
-- Test query
SELECT * FROM check_tent_availability(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '2024-06-17',
  '2024-06-15'
);

-- Expected result: ERROR
-- Error message: "Check-out date must be after check-in date"
```

**Expected Behavior**: ❌ Should raise an error

---

### Test 17: Pending Payment Status
**Scenario**: Booking with pending_payment status

```sql
-- Create booking with pending_payment
INSERT INTO bookings (customer_id, tent_id, check_in_date, check_out_date, guest_count, status, total_amount)
VALUES (
  '99999999-9999-9999-9999-999999999999',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '2024-06-15',
  '2024-06-17',
  2,
  'pending_payment',
  7998.00
);

-- Test query
SELECT * FROM check_tent_availability(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '2024-06-15',
  '2024-06-17'
);

-- Expected result: FALSE
```

**Expected Behavior**: ❌ Tent should NOT be available (pending_payment blocks availability)

---

### Test 18: Long-Term Booking
**Scenario**: Booking spans multiple weeks

```sql
-- Create long-term booking
INSERT INTO bookings (customer_id, tent_id, check_in_date, check_out_date, guest_count, status, total_amount)
VALUES (
  '99999999-9999-9999-9999-999999999999',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '2024-06-01',
  '2024-06-30',
  4,
  'confirmed',
  240000.00
);

-- Test query - overlaps with long booking
SELECT * FROM check_tent_availability(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '2024-06-15',
  '2024-06-17'
);

-- Expected result: FALSE
```

**Expected Behavior**: ❌ Tent should NOT be available (overlaps with long booking)

---

### Test 19: Next Available Date
**Scenario**: Find next available date after a booked period

```sql
-- Test query
SELECT * FROM get_next_available_date(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '2024-06-15',
  2,
  30
);

-- Expected result: 2024-06-17 (first available date after existing booking)
```

**Expected Behavior**: ✅ Should return first available date

---

### Test 20: Validate Booking Dates
**Scenario**: Comprehensive validation before booking

```sql
-- Test query
SELECT * FROM validate_booking_dates(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '2024-06-20',
  '2024-06-22'
);

-- Expected result
-- is_valid = TRUE
-- error_message = 'Booking dates are valid'
```

**Expected Behavior**: ✅ Should validate successfully

---

## Performance Tests

### Test P1: Query Performance - Individual Tents
```sql
EXPLAIN ANALYZE
SELECT * FROM get_available_tents('2024-06-15', '2024-06-17', NULL);

-- Expected: < 50ms execution time
```

### Test P2: Query Performance - Grouped by Type
```sql
EXPLAIN ANALYZE
SELECT * FROM get_available_tents_by_type('2024-06-15', '2024-06-17', NULL);

-- Expected: < 100ms execution time
```

### Test P3: Query Performance - 30-Day Calendar
```sql
EXPLAIN ANALYZE
SELECT * FROM get_occupancy_rate(CURRENT_DATE + i)
FROM generate_series(0, 29) i;

-- Expected: < 200ms execution time
```

### Test P4: Concurrent Bookings
```sql
-- Simulate concurrent booking attempts
-- Use database transactions with row-level locking
BEGIN;
SELECT * FROM tents WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' FOR UPDATE;
-- Check availability
-- Create booking
COMMIT;

-- Expected: No double bookings even with concurrent requests
```

---

## Cleanup

```sql
-- Clean up test data
DELETE FROM bookings WHERE customer_id = '99999999-9999-9999-9999-999999999999';
DELETE FROM customers WHERE id = '99999999-9999-9999-9999-999999999999';
DELETE FROM tents WHERE id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'cccccccc-cccc-cccc-cccc-cccccccccccc'
);
DELETE FROM tent_types WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);
```

## Test Automation Script

```bash
#!/bin/bash
# Run all availability tests

echo "Running Availability Engine Tests..."

# Run each test
psql -d your_database -f test_01_basic_availability.sql
psql -d your_database -f test_02_exact_overlap.sql
# ... continue for all tests

echo "All tests completed!"