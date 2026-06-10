# Date-Specific Pricing System

## Overview

The date-specific pricing system allows administrators to set custom prices for tent types on specific dates, overriding the default base pricing. This feature is essential for implementing dynamic pricing strategies such as:

- **Holiday Pricing**: Higher rates during peak seasons and holidays
- **Weekend Pricing**: Different rates for weekends vs weekdays
- **Special Events**: Custom pricing for festivals, events, or special occasions
- **Off-Season Discounts**: Lower rates during low-demand periods
- **Last-Minute Deals**: Dynamic pricing based on availability

## Architecture

### Database Schema

The system uses a dedicated `date_specific_pricing` table:

```sql
CREATE TABLE date_specific_pricing (
  id UUID PRIMARY KEY,
  tent_type_id UUID REFERENCES tent_types(id),
  date DATE NOT NULL,
  custom_price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  CONSTRAINT unique_tent_type_date UNIQUE (tent_type_id, date)
);
```

**Key Features:**
- Unique constraint ensures only one custom price per tent type per date
- Cascading delete when tent type is removed
- Optional notes field for documenting pricing decisions
- Audit trail with created_by and timestamps

### Database Functions

#### 1. `get_tent_price_for_date(tent_type_id, date)`
Returns the price for a tent type on a specific date (custom or base).

```sql
SELECT get_tent_price_for_date(
  'tent-type-uuid',
  '2024-12-25'
);
-- Returns: 5999.00 (custom price if set, otherwise base price)
```

#### 2. `get_tent_prices_for_range(tent_type_id, start_date, end_date)`
Returns daily prices across a date range with custom pricing indicators.

```sql
SELECT * FROM get_tent_prices_for_range(
  'tent-type-uuid',
  '2024-12-20',
  '2024-12-27'
);
-- Returns: date, price, is_custom_price for each day
```

#### 3. `calculate_tent_total_for_range(tent_type_id, start_date, end_date, quantity)`
Calculates total cost considering date-specific pricing.

```sql
SELECT calculate_tent_total_for_range(
  'tent-type-uuid',
  '2024-12-20',
  '2024-12-27',
  2  -- quantity
);
-- Returns: 84000.00 (total for 2 tents over 7 nights)
```

#### 4. `upsert_date_specific_pricing(tent_type_id, dates[], custom_price, notes, created_by)`
Bulk insert or update custom prices for multiple dates.

```sql
SELECT upsert_date_specific_pricing(
  'tent-type-uuid',
  ARRAY['2024-12-25', '2024-12-26']::DATE[],
  5999.00,
  'Christmas holiday pricing',
  'admin-user-uuid'
);
-- Returns: { inserted_count: 2, updated_count: 0 }
```

#### 5. `delete_date_specific_pricing_range(tent_type_id, start_date, end_date)`
Delete custom prices for a date range.

```sql
SELECT delete_date_specific_pricing_range(
  'tent-type-uuid',
  '2024-12-20',
  '2024-12-27'
);
-- Returns: 7 (number of records deleted)
```

## API Endpoints

### 1. Get All Pricing
**GET** `/api/pricing`

Query Parameters:
- `tentTypeId` (optional): Filter by tent type
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date
- `hasCustomPrice` (optional): Filter by custom pricing status

```typescript
// Example Request
GET /api/pricing?tentTypeId=uuid&startDate=2024-12-01&endDate=2024-12-31

// Example Response
{
  "success": true,
  "data": [
    {
      "id": "pricing-uuid",
      "tentTypeId": "tent-type-uuid",
      "date": "2024-12-25",
      "customPrice": 5999.00,
      "notes": "Christmas pricing",
      "createdAt": "2024-11-01T10:00:00Z",
      "updatedAt": "2024-11-01T10:00:00Z"
    }
  ],
  "count": 1
}
```

### 2. Create/Bulk Upsert Pricing
**POST** `/api/pricing/create`

```typescript
// Single Date
{
  "tentTypeId": "tent-type-uuid",
  "date": "2024-12-25",
  "customPrice": 5999.00,
  "notes": "Christmas pricing"
}

// Multiple Dates (Bulk)
{
  "tentTypeId": "tent-type-uuid",
  "dates": ["2024-12-25", "2024-12-26", "2024-12-27"],
  "customPrice": 5999.00,
  "notes": "Holiday pricing"
}

// Response
{
  "success": true,
  "data": {
    "insertedCount": 2,
    "updatedCount": 1,
    "totalCount": 3
  },
  "message": "Successfully processed 3 date(s): 2 created, 1 updated"
}
```

### 3. Get Pricing by ID
**GET** `/api/pricing/[id]`

```typescript
// Response
{
  "success": true,
  "data": {
    "id": "pricing-uuid",
    "tentTypeId": "tent-type-uuid",
    "date": "2024-12-25",
    "customPrice": 5999.00,
    "notes": "Christmas pricing"
  }
}
```

### 4. Update Pricing
**PATCH** `/api/pricing/[id]`

```typescript
// Request
{
  "customPrice": 6499.00,
  "notes": "Updated Christmas pricing"
}

// Response
{
  "success": true,
  "data": { /* updated pricing object */ },
  "message": "Pricing updated successfully"
}
```

### 5. Delete Pricing
**DELETE** `/api/pricing/[id]`

```typescript
// Response
{
  "success": true,
  "message": "Pricing deleted successfully"
}
```

### 6. Get Prices for Date Range
**GET** `/api/pricing/range`

Query Parameters:
- `tentTypeId` (required)
- `startDate` (required)
- `endDate` (required)
- `quantity` (optional, default: 1)

```typescript
// Example Request
GET /api/pricing/range?tentTypeId=uuid&startDate=2024-12-20&endDate=2024-12-27&quantity=2

// Example Response
{
  "success": true,
  "data": {
    "tentTypeId": "tent-type-uuid",
    "startDate": "2024-12-20",
    "endDate": "2024-12-27",
    "quantity": 2,
    "dailyPrices": [
      { "date": "2024-12-20", "price": 3999.00, "isCustomPrice": false },
      { "date": "2024-12-21", "price": 3999.00, "isCustomPrice": false },
      { "date": "2024-12-25", "price": 5999.00, "isCustomPrice": true }
    ],
    "totalPrice": 84000.00,
    "nights": 7,
    "averagePrice": 6000.00
  }
}
```

### 7. Delete Pricing Range
**DELETE** `/api/pricing/range`

```typescript
// Request
{
  "tentTypeId": "tent-type-uuid",
  "startDate": "2024-12-20",
  "endDate": "2024-12-27"
}

// Response
{
  "success": true,
  "data": { "deletedCount": 7 },
  "message": "Successfully deleted 7 pricing record(s)"
}
```

### 8. Get Pricing Overview
**GET** `/api/pricing/overview`

Query Parameters:
- `tentTypeId` (optional): Get overview for specific tent type

```typescript
// Example Response
{
  "success": true,
  "data": [
    {
      "tentTypeId": "tent-type-uuid",
      "tentTypeName": "Twin Sharing Small Tent",
      "tentTypeSlug": "twin-small",
      "basePrice": 3999.00,
      "customPriceCount": 15,
      "earliestCustomDate": "2024-12-01",
      "latestCustomDate": "2024-12-31"
    }
  ]
}
```

## TypeScript Types

```typescript
// Date-specific pricing record
interface DateSpecificPricing {
  id: string;
  tentTypeId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  customPrice: number;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Price for a specific date
interface DatePrice {
  date: string;
  price: number;
  isCustomPrice: boolean;
  notes?: string;
}

// Pricing overview
interface PricingOverview {
  tentTypeId: string;
  tentTypeName: string;
  tentTypeSlug: string;
  basePrice: number;
  customPriceCount: number;
  earliestCustomDate?: string;
  latestCustomDate?: string;
}
```

## Usage Examples

### Admin: Setting Holiday Pricing

```typescript
// Set custom pricing for Christmas week
const response = await fetch('/api/pricing/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tentTypeId: 'tent-type-uuid',
    dates: [
      '2024-12-24',
      '2024-12-25',
      '2024-12-26',
      '2024-12-27',
      '2024-12-28',
      '2024-12-29',
      '2024-12-30',
      '2024-12-31'
    ],
    customPrice: 5999.00,
    notes: 'Christmas and New Year holiday pricing'
  })
});
```

### Admin: Weekend Pricing Template

```typescript
// Apply weekend pricing using the pricing service
import { pricingService } from '@/services/pricing.service';

await pricingService.applyPricingTemplate(
  'tent-type-uuid',
  '2024-12-01',
  '2024-12-31',
  'weekends',
  1.2, // 20% markup
  undefined,
  'Weekend pricing - 20% markup',
  'admin-user-uuid'
);
```

### Customer: Viewing Pricing Breakdown

```typescript
// Use the PricingBreakdown component
import { PricingBreakdown } from '@/components/booking/pricing-breakdown';

<PricingBreakdown
  tentItems={[
    { tentTypeSlug: 'twin-small', quantity: 2 }
  ]}
  checkIn="2024-12-24"
  checkOut="2024-12-27"
  showDailyBreakdown={true}
/>
```

### Booking: Calculate Total with Custom Pricing

```typescript
import { calculateTotalAmount } from '@/services/booking.service';

const total = await calculateTotalAmount(
  [
    {
      tentTypeSlug: 'twin-small',
      quantity: 2,
      pricePerNight: 3999.00 // Base price (will be overridden)
    }
  ],
  '2024-12-24',
  '2024-12-27'
);
// Returns actual total considering date-specific pricing
```

## Admin UI Component

The `PricingManagement` component provides a complete interface for managing date-specific pricing:

```typescript
import { PricingManagement } from '@/components/admin/pricing-management';

// In your admin page
<PricingManagement />
```

**Features:**
- View pricing overview for all tent types
- Select tent type to manage
- Create custom pricing for single or multiple dates
- Edit existing custom prices
- Delete custom prices
- Visual calendar for date selection
- Bulk operations support

## Best Practices

### 1. Pricing Strategy
- Set base prices conservatively
- Use custom pricing for peak periods
- Document pricing decisions in notes field
- Review and update pricing regularly

### 2. Performance
- The system uses database functions for efficient calculations
- Pricing is cached at the availability check level
- Bulk operations are optimized for multiple dates

### 3. Data Integrity
- Unique constraint prevents duplicate pricing
- Validation ensures prices are non-negative
- Dates cannot be in the past
- Cascading deletes maintain referential integrity

### 4. User Experience
- Show custom pricing indicators in booking flow
- Display daily breakdown for transparency
- Highlight special pricing with badges
- Provide clear pricing explanations

## Migration Guide

### Running the Migration

```bash
# Apply the date-specific pricing migration
psql -d your_database -f supabase/migrations/007_date_specific_pricing.sql
```

### Verifying Installation

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'date_specific_pricing'
);

-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name LIKE '%pricing%';

-- Check if view exists
SELECT EXISTS (
  SELECT FROM information_schema.views 
  WHERE table_name = 'pricing_overview'
);
```

## Troubleshooting

### Issue: Custom pricing not applying

**Solution:** Verify the pricing record exists and date format is correct:

```sql
SELECT * FROM date_specific_pricing 
WHERE tent_type_id = 'your-tent-type-id' 
AND date = '2024-12-25';
```

### Issue: Bulk upsert failing

**Solution:** Check for date format and ensure dates are not in the past:

```typescript
// Correct format
dates: ['2024-12-25', '2024-12-26'] // YYYY-MM-DD

// Incorrect format
dates: ['12/25/2024', '12-26-2024'] // Wrong format
```

### Issue: Pricing calculation incorrect

**Solution:** Use the database function directly to verify:

```sql
SELECT calculate_tent_total_for_range(
  'tent-type-id',
  '2024-12-24',
  '2024-12-27',
  1
);
```

## Future Enhancements

- **Pricing Templates**: Pre-defined templates for common scenarios
- **Bulk Import**: CSV import for large-scale pricing updates
- **Price History**: Track pricing changes over time
- **Dynamic Pricing**: AI-based pricing recommendations
- **Competitor Analysis**: Integration with market pricing data
- **Seasonal Patterns**: Automatic pricing based on historical data

## Support

For issues or questions:
- Check the API documentation: `/docs/API_PRICING.md`
- Review database schema: `/docs/DATABASE_SCHEMA.md`
- Contact development team

---

**Made with Bob** - Date-Specific Pricing System v1.0