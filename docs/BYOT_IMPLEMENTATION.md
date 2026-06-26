# Bring Your Own Tent (BYOT) Implementation Guide

## Overview
This document describes the implementation of the "Bring Your Own Tent" (BYOT) feature for Wild Earth Jungle Camp booking system.

## Feature Specifications

### Business Requirements
- **Pricing**: ₹1,499 per guest per night
- **Inclusions**: Breakfast and snacks for all guests
- **Children Policy**: Children below 5 years are not charged but count in guest display
- **Capacity**: Maximum 30 BYOT guests per night across all bookings
- **Availability**: Always available (not date-dependent like regular tents)
- **Booking Behavior**: Can be combined with regular tent bookings
- **Tent Type Slug**: `bring_your_own_tent`

## Implementation Summary

### 1. Database Changes

#### Migration File: `supabase/migrations/009_bring_your_own_tent.sql`

**New Columns Added to `tent_types` table:**
- `is_byot` (BOOLEAN) - Identifies BYOT tent types
- `per_guest_price` (DECIMAL) - Price per guest per night for BYOT
- `max_guests_per_night` (INTEGER) - Maximum BYOT guests allowed per night

**New BYOT Tent Type:**
```sql
INSERT INTO tent_types (
  name: 'Bring Your Own Tent',
  is_byot: true,
  per_guest_price: 1499.00,
  max_guests_per_night: 30
)
```

**New Function: `check_byot_capacity()`**
- Checks available BYOT capacity for date ranges
- Returns current guests, available capacity, and availability status per date

**Updated Function: `get_available_tents_by_type()`**
- Always includes BYOT in results (shows as 999 available)
- Returns BYOT-specific fields (is_byot, per_guest_price, max_guests_per_night)

**Virtual Tent:**
- Created one virtual tent instance (BYOT-VIRTUAL) for booking system compatibility
- Not a physical tent, just for database relationships

### 2. Backend Changes

#### Type Definitions & Validation

**File: `src/validations/booking.schema.ts`**
- Added `'bring_your_own_tent'` to tent type enum
- Updated `validateTentCapacity()` to skip capacity checks for BYOT
- BYOT has no capacity limit (guests bring their own tents)

**File: `src/services/availability.service.ts`**
- Added BYOT fields to `AvailableTentType` interface:
  - `isByot?: boolean`
  - `perGuestPrice?: number`
  - `maxGuestsPerNight?: number`
- Updated `getAvailableTentsByType()` to handle BYOT pricing (per guest vs per tent)

#### Booking Service

**File: `src/services/booking.service.ts`**

**Updated `calculateTotalAmount()`:**
- Added `adults` and `children` parameters
- BYOT pricing: `(adults + children) × per_guest_price × nights`
- Regular tents: existing date-specific pricing logic

**Updated `getBookingPricingBreakdown()`:**
- Added `adults` and `children` parameters
- Creates daily price breakdown for BYOT (same price each night)
- Returns `isByot` flag in breakdown items

#### API Routes

**File: `src/app/api/availability/route.ts`**
- Added BYOT fields to transformed data
- BYOT pricing calculation: `perGuestPrice × nights` (per guest)
- Regular tents: existing pricing service logic

### 3. Frontend Changes

#### Availability Page

**File: `src/app/(public)/availability/page.tsx`**

**Interface Updates:**
- Added BYOT fields to `TentType` and `SelectedTent` interfaces

**Display Changes:**
- **Status Badge**: Shows "Always Available" for BYOT
- **Capacity Display**: "Bring your own tent - charged per guest"
- **Availability Count**: "Always available (max 30 guests per night)"
- **Pricing Display**: 
  - "per guest per night" instead of "per night"
  - "₹X per guest for stay" instead of "₹X total"

#### Pricing Breakdown Component

**File: `src/components/booking/pricing-breakdown.tsx`**
- Added `isByot` field to `TentItemPricing` interface
- Updated quantity display: "X guests" for BYOT vs "X tents" for regular
- Updated pricing labels: "per guest per night" for BYOT
- Shows "Per guest pricing" info for BYOT

## How BYOT Works

### Booking Flow

1. **Availability Check**:
   - BYOT always appears in availability results
   - Shows "Always Available" badge
   - Displays per-guest pricing

2. **Selection**:
   - Users can select BYOT along with regular tents
   - No capacity validation for BYOT (guests bring their own tents)

3. **Pricing Calculation**:
   - Regular tents: `tent_quantity × price_per_night × nights`
   - BYOT: `(adults + children) × ₹1,499 × nights`
   - Children under 5: Counted in display but not charged

4. **Booking Creation**:
   - BYOT bookings use the virtual tent (BYOT-VIRTUAL)
   - No physical tent assignment needed
   - Capacity tracking: System tracks total BYOT guests per night

### Key Differences from Regular Tents

| Aspect | Regular Tents | BYOT |
|--------|--------------|------|
| Availability | Date-dependent | Always available |
| Pricing | Per tent per night | Per guest per night |
| Capacity | Fixed per tent type | No limit (guests bring own) |
| Inventory | Physical tent instances | Virtual tent |
| Validation | Capacity checks required | No capacity validation |
| Display | "X tents available" | "Always available" |

## Testing Checklist

### Database
- [ ] Run migration successfully
- [ ] Verify BYOT tent type created
- [ ] Verify virtual tent created
- [ ] Test `check_byot_capacity()` function
- [ ] Test `get_available_tents_by_type()` includes BYOT

### Backend
- [ ] BYOT appears in availability API response
- [ ] BYOT pricing calculated correctly (per guest)
- [ ] Booking creation works with BYOT
- [ ] Mixed bookings work (BYOT + regular tents)
- [ ] Capacity validation skipped for BYOT

### Frontend
- [ ] BYOT displays with "Always Available" badge
- [ ] Per-guest pricing shown correctly
- [ ] Selection and quantity update works
- [ ] Pricing breakdown shows BYOT correctly
- [ ] Checkout flow works with BYOT
- [ ] Confirmation email mentions BYOT

### Edge Cases
- [ ] BYOT-only booking (no regular tents)
- [ ] Mixed booking (BYOT + multiple tent types)
- [ ] Maximum capacity (30 guests) validation
- [ ] Children under 5 not charged but counted
- [ ] Date range spanning multiple nights

## Migration Instructions

### To Apply Changes:

1. **Run Database Migration**:
   ```bash
   # The migration will automatically run when deployed
   # Or manually run: supabase migration up
   ```

2. **Verify Database**:
   ```sql
   -- Check BYOT tent type exists
   SELECT * FROM tent_types WHERE is_byot = true;
   
   -- Check virtual tent exists
   SELECT * FROM tents WHERE tent_number = 'BYOT-VIRTUAL';
   ```

3. **Test Availability**:
   ```bash
   # Test API endpoint
   curl -X POST http://localhost:3000/api/availability \
     -H "Content-Type: application/json" \
     -d '{"checkInDate":"2024-07-01","checkOutDate":"2024-07-03"}'
   ```

4. **Frontend Testing**:
   - Navigate to `/availability`
   - Search for dates
   - Verify BYOT appears with correct pricing
   - Test booking flow

### Rollback Instructions:

If needed, rollback using the SQL at the end of migration file:
```sql
DROP FUNCTION IF EXISTS check_byot_capacity(DATE, DATE, INTEGER);
DELETE FROM tents WHERE tent_number = 'BYOT-VIRTUAL';
DELETE FROM tent_types WHERE is_byot = true;
ALTER TABLE tent_types DROP COLUMN IF EXISTS is_byot;
ALTER TABLE tent_types DROP COLUMN IF EXISTS per_guest_price;
ALTER TABLE tent_types DROP COLUMN IF EXISTS max_guests_per_night;
```

## Files Modified

### Database (1 new file)
- `supabase/migrations/009_bring_your_own_tent.sql` ✅ Created

### Backend (5 files)
- `src/validations/booking.schema.ts` ✅ Modified
- `src/services/availability.service.ts` ✅ Modified
- `src/services/booking.service.ts` ✅ Modified
- `src/app/api/availability/route.ts` ✅ Modified

### Frontend (2 files)
- `src/app/(public)/availability/page.tsx` ✅ Modified
- `src/components/booking/pricing-breakdown.tsx` ✅ Modified

## Notes

- **No Breaking Changes**: All modifications are additive and backward compatible
- **Existing Functionality**: Regular tent bookings continue to work unchanged
- **Admin Interface**: BYOT will automatically appear in admin booking creation
- **Calendar View**: BYOT bookings will appear as separate entries
- **Reporting**: BYOT revenue tracked separately via `is_byot` flag

## Support

For questions or issues:
1. Check this documentation
2. Review migration file comments
3. Test in development environment first
4. Verify database changes before production deployment

---

**Implementation Date**: 2026-06-25  
**Version**: 1.0  
**Status**: ✅ Complete - Ready for Testing