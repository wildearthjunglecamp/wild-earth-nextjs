# Availability API Documentation

## Endpoint

```
POST /api/availability
```

## Description

Check tent availability for a given date range. Returns available tent types with counts and details.

## Request

### Headers

```
Content-Type: application/json
```

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `checkIn` | string | Yes | Check-in date in YYYY-MM-DD format |
| `checkOut` | string | Yes | Check-out date in YYYY-MM-DD format |
| `guestCount` | number | No | Number of guests (filters by tent capacity) |

### Validation Rules

- **checkIn**: 
  - Must be in YYYY-MM-DD format
  - Cannot be in the past
  - Must be a valid date

- **checkOut**: 
  - Must be in YYYY-MM-DD format
  - Must be after checkIn
  - Must be a valid date
  - Maximum 30 nights from checkIn
  - Minimum 1 night from checkIn

- **guestCount** (optional):
  - Must be an integer
  - Minimum: 1
  - Maximum: 10

### Example Request

```json
{
  "checkIn": "2024-06-15",
  "checkOut": "2024-06-17",
  "guestCount": 2
}
```

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "tentTypeId": "uuid",
      "tentTypeName": "Twin Sharing Small Tent",
      "capacity": 2,
      "basePrice": 3999,
      "description": "Cozy twin sharing tent perfect for couples",
      "amenities": [
        "Comfortable Mattress",
        "Sleeping Bags",
        "Pillows",
        "Blankets"
      ],
      "images": [
        "/images/tent1.jpg"
      ],
      "availableCount": 3,
      "totalCount": 5,
      "availableTentIds": [
        "uuid1",
        "uuid2",
        "uuid3"
      ],
      "availableTentNumbers": [
        "1",
        "2",
        "3"
      ]
    },
    {
      "tentTypeId": "uuid",
      "tentTypeName": "Four Sharing Jungle Tent",
      "capacity": 4,
      "basePrice": 8000,
      "description": "Large family tent for four guests",
      "amenities": [
        "4 Mattresses",
        "Sleeping Bags",
        "Storage Space"
      ],
      "images": [
        "/images/tent2.jpg"
      ],
      "availableCount": 1,
      "totalCount": 2,
      "availableTentIds": [
        "uuid4"
      ],
      "availableTentNumbers": [
        "1"
      ]
    }
  ],
  "meta": {
    "checkIn": "2024-06-15",
    "checkOut": "2024-06-17",
    "nights": 2,
    "guestCount": 2,
    "totalAvailable": 4
  }
}
```

### Error Responses

#### Validation Error (400 Bad Request)

```json
{
  "success": false,
  "error": "Validation error",
  "message": "Invalid input data",
  "details": [
    {
      "field": "checkIn",
      "message": "Check-in date cannot be in the past"
    },
    {
      "field": "checkOut",
      "message": "Check-out date must be after check-in date"
    }
  ]
}
```

#### Invalid JSON (400 Bad Request)

```json
{
  "success": false,
  "error": "Invalid JSON",
  "message": "Request body must be valid JSON"
}
```

#### Database Error (500 Internal Server Error)

```json
{
  "success": false,
  "error": "Database error",
  "message": "Failed to fetch availability. Please try again."
}
```

#### Internal Server Error (500)

```json
{
  "success": false,
  "error": "Internal server error",
  "message": "An unexpected error occurred. Please try again later."
}
```

## Usage Examples

### JavaScript/TypeScript (fetch)

```typescript
async function checkAvailability(checkIn: string, checkOut: string, guestCount?: number) {
  try {
    const response = await fetch('/api/availability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkIn,
        checkOut,
        guestCount,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to check availability');
    }

    return data;
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
}

// Usage
const availability = await checkAvailability('2024-06-15', '2024-06-17', 2);
console.log(`Found ${availability.meta.totalAvailable} available tents`);
```

### React Hook

```typescript
import { useState } from 'react';

interface AvailabilityParams {
  checkIn: string;
  checkOut: string;
  guestCount?: number;
}

export function useAvailability() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const checkAvailability = async (params: AvailabilityParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to check availability');
      }

      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    checkAvailability,
    loading,
    error,
    data,
  };
}

// Usage in component
function BookingForm() {
  const { checkAvailability, loading, error, data } = useAvailability();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await checkAvailability({
        checkIn: '2024-06-15',
        checkOut: '2024-06-17',
        guestCount: 2,
      });
      
      console.log('Available tents:', result.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {loading && <p>Checking availability...</p>}
      {error && <p>Error: {error}</p>}
      {data && <p>Found {data.meta.totalAvailable} available tents</p>}
    </form>
  );
}
```

### cURL

```bash
curl -X POST http://localhost:3000/api/availability \
  -H "Content-Type: application/json" \
  -d '{
    "checkIn": "2024-06-15",
    "checkOut": "2024-06-17",
    "guestCount": 2
  }'
```

### Python

```python
import requests
import json

def check_availability(check_in, check_out, guest_count=None):
    url = "http://localhost:3000/api/availability"
    
    payload = {
        "checkIn": check_in,
        "checkOut": check_out
    }
    
    if guest_count:
        payload["guestCount"] = guest_count
    
    headers = {
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Error: {response.json().get('message')}")

# Usage
availability = check_availability("2024-06-15", "2024-06-17", 2)
print(f"Total available: {availability['meta']['totalAvailable']}")
```

## Response Fields Explained

### Tent Type Object

| Field | Type | Description |
|-------|------|-------------|
| `tentTypeId` | string (UUID) | Unique identifier for tent type |
| `tentTypeName` | string | Name of the tent type |
| `capacity` | number | Maximum number of guests |
| `basePrice` | number | Price per night in INR |
| `description` | string | Detailed description |
| `amenities` | string[] | List of amenities |
| `images` | string[] | Array of image URLs |
| `availableCount` | number | Number of available tents of this type |
| `totalCount` | number | Total tents of this type |
| `availableTentIds` | string[] | Array of available tent UUIDs |
| `availableTentNumbers` | string[] | Array of tent numbers (e.g., ["1", "2"]) |

### Meta Object

| Field | Type | Description |
|-------|------|-------------|
| `checkIn` | string | Echo of check-in date |
| `checkOut` | string | Echo of check-out date |
| `nights` | number | Number of nights calculated |
| `guestCount` | number | Echo of guest count (if provided) |
| `totalAvailable` | number | Total available tents across all types |

## Business Logic

### Date Overlap Rules

The API uses the following logic to determine if a tent is available:

1. **Same-day turnover allowed**: A tent checking out at 11 AM can be booked for check-in at 1 PM the same day
2. **Excluded statuses**: Bookings with status `cancelled` or `checked_out` don't block availability
3. **Tent status**: Only tents with status `available` are included
4. **Capacity filtering**: If `guestCount` is provided, only tents with capacity >= guestCount are returned

### Overlap Detection

A tent is **unavailable** if there exists a booking where:
- Booking status is NOT (`cancelled` OR `checked_out`)
- AND any of these conditions are true:
  - New check-in falls within existing booking dates
  - New check-out falls within existing booking dates
  - New booking completely encompasses existing booking

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting for production:

```typescript
// Example with next-rate-limit
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
```

## Caching

Consider implementing caching for better performance:

```typescript
// Example with Redis
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache key format: availability:{checkIn}:{checkOut}:{guestCount}
const cacheKey = `availability:${checkIn}:${checkOut}:${guestCount || 'all'}`;

// Try to get from cache
const cached = await redis.get(cacheKey);
if (cached) {
  return JSON.parse(cached);
}

// Fetch from database
const result = await fetchAvailability();

// Cache for 5 minutes
await redis.setex(cacheKey, 300, JSON.stringify(result));
```

## Testing

### Test Cases

1. **Valid request**: Should return available tents
2. **Past check-in date**: Should return validation error
3. **Check-out before check-in**: Should return validation error
4. **Invalid date format**: Should return validation error
5. **No availability**: Should return empty array
6. **Guest count filter**: Should only return tents with sufficient capacity
7. **Maximum duration exceeded**: Should return validation error

### Example Test (Jest)

```typescript
describe('POST /api/availability', () => {
  it('should return available tents for valid dates', async () => {
    const response = await fetch('/api/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        checkIn: '2024-06-15',
        checkOut: '2024-06-17',
      }),
    });

    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.meta.nights).toBe(2);
  });

  it('should return validation error for past dates', async () => {
    const response = await fetch('/api/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        checkIn: '2020-01-01',
        checkOut: '2020-01-03',
      }),
    });

    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Validation error');
  });
});
```

## Security Considerations

1. **Input Validation**: All inputs are validated with Zod
2. **SQL Injection**: Using Supabase RPC functions (parameterized queries)
3. **Rate Limiting**: Should be implemented for production
4. **CORS**: Configure appropriately for your domain
5. **Error Messages**: Don't expose sensitive information in error messages

## Performance

- **Expected Response Time**: < 100ms for typical queries
- **Database Indexes**: Ensure proper indexes are in place (see migration 003)
- **Caching**: Implement Redis caching for frequently accessed date ranges
- **Connection Pooling**: Supabase handles this automatically

## Monitoring

Consider logging the following metrics:
- Request count
- Response times
- Error rates
- Most queried date ranges
- Cache hit/miss rates