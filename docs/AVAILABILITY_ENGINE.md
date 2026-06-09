# Availability Engine Design

## Overview
This document describes the availability engine for the Wild Earth Jungle Camp booking system, handling tent availability checks with date overlap logic.

## Business Rules

### Check-in/Check-out Times
- **Check-in**: 1:00 PM (13:00)
- **Check-out**: 11:00 AM (11:00)

### Availability Rules
1. A tent cannot be double-booked
2. Tents marked as 'maintenance' or 'out_of_service' are excluded
3. Only confirmed and active bookings block availability
4. Same-day turnover is allowed (checkout at 11 AM, new checkin at 1 PM)

### Date Overlap Logic
A tent is **unavailable** if there exists a booking where:
- Booking status is NOT ('cancelled', 'checked_out')
- AND any of these conditions are true:
  - New check-in falls within existing booking dates
  - New check-out falls within existing booking dates
  - New booking completely encompasses existing booking

## SQL Queries

### 1. Find Available Tents (Individual)

```sql
-- Find all available tents for a specific date range
-- Parameters: p_check_in_date, p_check_out_date, p_guest_count (optional)

SELECT 
  t.id as tent_id,
  t.tent_number,
  tt.id as tent_type_id,
  tt.name as tent_type_name,
  tt.capacity,
  tt.base_price,
  tt.description,
  tt.amenities,
  t.status as tent_status
FROM tents t
INNER JOIN tent_types tt ON t.tent_type_id = tt.id
WHERE 
  -- Tent must be available (not in maintenance or out of service)
  t.status = 'available'
  
  -- Tent type must be active
  AND tt.is_active = true
  
  -- Optional: Filter by guest count capacity
  AND (
    $3::INTEGER IS NULL 
    OR tt.capacity >= $3::INTEGER
  )
  
  -- Tent must not have overlapping bookings
  AND NOT EXISTS (
    SELECT 1 
    FROM bookings b
    WHERE b.tent_id = t.id
    
    -- Only consider active bookings
    AND b.status NOT IN ('cancelled', 'checked_out')
    
    -- Check for date overlap
    AND (
      -- Case 1: New check-in falls within existing booking
      ($1::DATE >= b.check_in_date AND $1::DATE < b.check_out_date)
      
      -- Case 2: New check-out falls within existing booking
      OR ($2::DATE > b.check_in_date AND $2::DATE <= b.check_out_date)
      
      -- Case 3: New booking encompasses existing booking
      OR ($1::DATE <= b.check_in_date AND $2::DATE >= b.check_out_date)
    )
  )
ORDER BY tt.capacity, tt.base_price, t.tent_number;
```

### 2. Available Tents Grouped by Tent Type

```sql
-- Get availability summary grouped by tent type
-- Shows available count and total count per tent type

SELECT 
  tt.id as tent_type_id,
  tt.name as tent_type_name,
  tt.capacity,
  tt.base_price,
  tt.description,
  tt.amenities,
  tt.images,
  
  -- Count of available tents for this type
  COUNT(DISTINCT t.id) as available_count,
  
  -- Total tents of this type
  (
    SELECT COUNT(*) 
    FROM tents 
    WHERE tent_type_id = tt.id 
    AND status = 'available'
  ) as total_count,
  
  -- Array of available tent IDs
  ARRAY_AGG(t.id) as available_tent_ids,
  
  -- Array of available tent numbers
  ARRAY_AGG(t.tent_number ORDER BY t.tent_number) as available_tent_numbers
  
FROM tent_types tt
INNER JOIN tents t ON t.tent_type_id = tt.id
WHERE 
  -- Tent type must be active
  tt.is_active = true
  
  -- Tent must be available
  AND t.status = 'available'
  
  -- Optional: Filter by guest count capacity
  AND (
    $3::INTEGER IS NULL 
    OR tt.capacity >= $3::INTEGER
  )
  
  -- Tent must not have overlapping bookings
  AND NOT EXISTS (
    SELECT 1 
    FROM bookings b
    WHERE b.tent_id = t.id
    AND b.status NOT IN ('cancelled', 'checked_out')
    AND (
      ($1::DATE >= b.check_in_date AND $1::DATE < b.check_out_date)
      OR ($2::DATE > b.check_in_date AND $2::DATE <= b.check_out_date)
      OR ($1::DATE <= b.check_in_date AND $2::DATE >= b.check_out_date)
    )
  )
  
GROUP BY 
  tt.id, 
  tt.name, 
  tt.capacity, 
  tt.base_price, 
  tt.description, 
  tt.amenities,
  tt.images
  
HAVING COUNT(DISTINCT t.id) > 0

ORDER BY tt.capacity, tt.base_price;
```

### 3. Check Specific Tent Availability

```sql
-- Check if a specific tent is available for given dates
-- Returns boolean

SELECT NOT EXISTS (
  SELECT 1 
  FROM bookings b
  WHERE b.tent_id = $1::UUID
  AND b.status NOT IN ('cancelled', 'checked_out')
  AND (
    ($2::DATE >= b.check_in_date AND $2::DATE < b.check_out_date)
    OR ($3::DATE > b.check_in_date AND $3::DATE <= b.check_out_date)
    OR ($2::DATE <= b.check_in_date AND $3::DATE >= b.check_out_date)
  )
) as is_available;
```

### 4. Get Occupancy Calendar

```sql
-- Get occupancy status for all tents over a date range
-- Useful for calendar views

SELECT 
  d.date,
  tt.name as tent_type_name,
  COUNT(DISTINCT t.id) as total_tents,
  COUNT(DISTINCT CASE 
    WHEN EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.tent_id = t.id
      AND b.status NOT IN ('cancelled', 'checked_out')
      AND d.date >= b.check_in_date 
      AND d.date < b.check_out_date
    ) THEN t.id 
  END) as occupied_tents,
  COUNT(DISTINCT t.id) - COUNT(DISTINCT CASE 
    WHEN EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.tent_id = t.id
      AND b.status NOT IN ('cancelled', 'checked_out')
      AND d.date >= b.check_in_date 
      AND d.date < b.check_out_date
    ) THEN t.id 
  END) as available_tents
FROM 
  generate_series(
    $1::DATE, 
    $2::DATE, 
    '1 day'::interval
  ) d(date)
CROSS JOIN tent_types tt
INNER JOIN tents t ON t.tent_type_id = tt.id
WHERE 
  t.status = 'available'
  AND tt.is_active = true
GROUP BY d.date, tt.name
ORDER BY d.date, tt.name;
```

## PostgreSQL Functions

### Function: check_tent_availability

```sql
CREATE OR REPLACE FUNCTION check_tent_availability(
  p_tent_id UUID,
  p_check_in DATE,
  p_check_out DATE
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if tent exists and is available
  IF NOT EXISTS (
    SELECT 1 FROM tents 
    WHERE id = p_tent_id 
    AND status = 'available'
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Check for overlapping bookings
  RETURN NOT EXISTS (
    SELECT 1 FROM bookings
    WHERE tent_id = p_tent_id
    AND status NOT IN ('cancelled', 'checked_out')
    AND (
      (p_check_in >= check_in_date AND p_check_in < check_out_date)
      OR (p_check_out > check_in_date AND p_check_out <= check_out_date)
      OR (p_check_in <= check_in_date AND p_check_out >= check_out_date)
    )
  );
END;
$$ LANGUAGE plpgsql STABLE;
```

### Function: get_available_tents

```sql
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
  amenities JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.tent_number,
    tt.id,
    tt.name,
    tt.capacity,
    tt.base_price,
    tt.description,
    tt.amenities
  FROM tents t
  INNER JOIN tent_types tt ON t.tent_type_id = tt.id
  WHERE 
    t.status = 'available'
    AND tt.is_active = true
    AND (p_guest_count IS NULL OR tt.capacity >= p_guest_count)
    AND check_tent_availability(t.id, p_check_in, p_check_out)
  ORDER BY tt.capacity, tt.base_price, t.tent_number;
END;
$$ LANGUAGE plpgsql STABLE;
```

### Function: get_available_tents_by_type

```sql
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
  RETURN QUERY
  SELECT 
    tt.id,
    tt.name,
    tt.capacity,
    tt.base_price,
    tt.description,
    tt.amenities,
    tt.images,
    COUNT(DISTINCT t.id),
    (SELECT COUNT(*) FROM tents WHERE tent_type_id = tt.id AND status = 'available'),
    ARRAY_AGG(t.id),
    ARRAY_AGG(t.tent_number ORDER BY t.tent_number)
  FROM tent_types tt
  INNER JOIN tents t ON t.tent_type_id = tt.id
  WHERE 
    tt.is_active = true
    AND t.status = 'available'
    AND (p_guest_count IS NULL OR tt.capacity >= p_guest_count)
    AND check_tent_availability(t.id, p_check_in, p_check_out)
  GROUP BY tt.id, tt.name, tt.capacity, tt.base_price, tt.description, tt.amenities, tt.images
  HAVING COUNT(DISTINCT t.id) > 0
  ORDER BY tt.capacity, tt.base_price;
END;
$$ LANGUAGE plpgsql STABLE;
```

## Edge Cases

### 1. Same-Day Turnover
**Scenario**: Guest A checks out at 11 AM, Guest B checks in at 1 PM on the same day.

**Solution**: Use `<` and `>` operators (not `<=` and `>=`) for date comparisons:
- Check-out date is EXCLUSIVE (guest leaves before this date starts)
- Check-in date is INCLUSIVE (guest arrives on this date)

```sql
-- This allows same-day turnover
WHERE (
  (p_check_in >= b.check_in_date AND p_check_in < b.check_out_date)  -- < not <=
  OR (p_check_out > b.check_in_date AND p_check_out <= b.check_out_date)  -- > not >=
  OR (p_check_in <= b.check_in_date AND p_check_out >= b.check_out_date)
)
```

### 2. Invalid Date Range
**Scenario**: Check-out date is before or equal to check-in date.

**Solution**: Add validation at application level and database constraint:

```sql
-- Database constraint
ALTER TABLE bookings 
ADD CONSTRAINT check_dates 
CHECK (check_out_date > check_in_date);
```

### 3. Past Dates
**Scenario**: User tries to book dates in the past.

**Solution**: Validate at application level:

```typescript
if (checkInDate < new Date()) {
  throw new Error('Check-in date cannot be in the past');
}
```

### 4. Tent Status Changes
**Scenario**: Tent goes into maintenance after booking is made.

**Solution**: 
- Don't affect existing bookings
- Only check tent status for NEW bookings
- Existing bookings remain valid even if tent status changes

### 5. Booking Status Transitions
**Scenario**: What happens when booking status changes?

**Status Flow**:
- `pending_payment` → Blocks availability (reserved)
- `confirmed` → Blocks availability
- `checked_in` → Blocks availability
- `checked_out` → Releases availability
- `cancelled` → Releases availability

### 6. Long-Term Bookings
**Scenario**: Booking spans multiple months.

**Solution**: No special handling needed; date overlap logic handles this automatically.

### 7. Concurrent Bookings
**Scenario**: Two users try to book the same tent simultaneously.

**Solution**: Use database transactions with row-level locking:

```sql
BEGIN;
-- Lock the tent row
SELECT * FROM tents WHERE id = $1 FOR UPDATE;
-- Check availability
-- Create booking
COMMIT;
```

### 8. Timezone Considerations
**Scenario**: Server and client in different timezones.

**Solution**: 
- Store all dates in UTC
- Convert to local timezone (Asia/Calcutta) for display
- Use DATE type (not TIMESTAMP) for check-in/check-out

### 9. Partial Availability
**Scenario**: User wants 3 tents but only 2 are available.

**Solution**: Return available count and let user decide:
- Show "2 of 3 available"
- Allow booking available tents
- Suggest alternative dates

### 10. Maintenance Windows
**Scenario**: Tent needs maintenance during existing booking.

**Solution**: 
- Don't allow tent status change if active bookings exist
- Add validation before status update

## Performance Considerations

### 1. Indexing Strategy

```sql
-- Critical indexes for availability queries
CREATE INDEX idx_bookings_tent_dates ON bookings(tent_id, check_in_date, check_out_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates_status ON bookings(check_in_date, check_out_date, status);
CREATE INDEX idx_tents_type_status ON tents(tent_type_id, status);
CREATE INDEX idx_tent_types_active ON tent_types(is_active);
```

### 2. Query Optimization

**Use EXPLAIN ANALYZE** to check query performance:

```sql
EXPLAIN ANALYZE
SELECT * FROM get_available_tents_by_type('2024-06-15', '2024-06-17', 2);
```

**Expected Performance**:
- < 50ms for availability check
- < 100ms for grouped results
- < 200ms for calendar view (30 days)

### 3. Caching Strategy

**Cache at Application Level**:
```typescript
// Cache availability for 5 minutes
const cacheKey = `availability:${checkIn}:${checkOut}:${guestCount}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const result = await getAvailability(...);
await redis.setex(cacheKey, 300, JSON.stringify(result));
```

**Invalidate Cache When**:
- New booking created
- Booking cancelled
- Tent status changed

### 4. Database Connection Pooling

```typescript
// Use connection pooling for better performance
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 5. Pagination

For large result sets:

```sql
-- Add pagination to availability queries
LIMIT $4 OFFSET $5
```

### 6. Materialized Views

For frequently accessed data:

```sql
-- Create materialized view for current availability
CREATE MATERIALIZED VIEW current_availability AS
SELECT * FROM get_available_tents_by_type(
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '90 days',
  NULL
);

-- Refresh periodically
REFRESH MATERIALIZED VIEW current_availability;
```

### 7. Read Replicas

For high-traffic scenarios:
- Use read replicas for availability queries
- Use primary database for bookings
- Implement eventual consistency handling

## Testing Scenarios

### Test Case 1: Basic Availability
```
Check-in: 2024-06-15
Check-out: 2024-06-17
Expected: All available tents returned
```

### Test Case 2: Overlapping Booking
```
Existing: 2024-06-15 to 2024-06-17
New: 2024-06-16 to 2024-06-18
Expected: Tent NOT available
```

### Test Case 3: Same-Day Turnover
```
Existing: 2024-06-15 to 2024-06-17 (checkout 11 AM)
New: 2024-06-17 to 2024-06-19 (checkin 1 PM)
Expected: Tent IS available
```

### Test Case 4: Adjacent Bookings
```
Existing: 2024-06-15 to 2024-06-17
New: 2024-06-17 to 2024-06-19
Expected: Tent IS available (same-day turnover)
```

### Test Case 5: Encompassing Booking
```
Existing: 2024-06-16 to 2024-06-17
New: 2024-06-15 to 2024-06-18
Expected: Tent NOT available
```

### Test Case 6: Cancelled Booking
```
Existing: 2024-06-15 to 2024-06-17 (status: cancelled)
New: 2024-06-16 to 2024-06-18
Expected: Tent IS available
```

### Test Case 7: Maintenance Status
```
Tent status: maintenance
Expected: Tent NOT available
```

### Test Case 8: Guest Count Filter
```
Guest count: 4
Tent capacity: 2
Expected: Tent NOT returned