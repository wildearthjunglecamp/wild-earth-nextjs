# Implementation Guide

This guide provides step-by-step instructions for implementing the Wild Earth Jungle Camp booking system.

## Phase 1: Database Setup (Week 1)

### 1.1 Supabase Project Setup
1. Create a new Supabase project
2. Note down your project URL and API keys
3. Add them to `.env.local`

### 1.2 Run Migrations
1. Go to Supabase SQL Editor
2. Run `supabase/migrations/001_initial_schema.sql`
3. Verify tables are created

### 1.3 Set Up Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tents ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Public can read tents
CREATE POLICY "Public can view tents" ON tents
  FOR SELECT USING (true);

-- Public can create bookings
CREATE POLICY "Public can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

-- Admin policies (to be implemented with auth)
```

### 1.4 Seed Initial Data
Create sample tents for testing:
```sql
INSERT INTO tents (name, type, capacity, price_per_night, description, amenities, images)
VALUES 
  ('Deluxe Tent 1', 'deluxe', 4, 2500, 'Spacious deluxe tent', '["WiFi", "AC", "Private Bathroom"]', '[]'),
  ('Standard Tent 1', 'standard', 2, 1500, 'Cozy standard tent', '["Shared Bathroom", "Fan"]', '[]');
```

## Phase 2: Authentication (Week 1-2)

### 2.1 Set Up Supabase Auth
1. Enable Email authentication in Supabase
2. Create admin user in Supabase Auth
3. Link to users table

### 2.2 Implement Auth Middleware
File: `src/middleware.ts`
```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Implement auth check for admin routes
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

### 2.3 Implement Auth Components
- Login page: `src/app/(admin)/admin/login/page.tsx`
- Auth context: `src/components/providers/auth-provider.tsx`
- Protected route wrapper

## Phase 3: Public Booking Flow (Week 2-3)

### 3.1 Availability Search
Implement: `src/components/booking/availability-search.tsx`
- Date range picker
- Guest count selector
- Search button
- Display available tents

### 3.2 Booking Form
Implement: `src/components/booking/booking-form.tsx`
- Guest information form
- Tent selection
- Special requests
- Form validation with Zod

### 3.3 Payment Integration
1. Set up Razorpay account
2. Implement: `src/lib/payment/razorpay.ts`
3. Create payment component
4. Handle payment success/failure

### 3.4 Booking Confirmation
- Send confirmation email
- Display booking details
- Generate booking reference

## Phase 4: Admin Dashboard (Week 3-4)

### 4.1 Dashboard Overview
Implement: `src/app/(admin)/admin/dashboard/page.tsx`
- Stats cards (total bookings, revenue, occupancy)
- Revenue chart (using recharts)
- Recent bookings list

### 4.2 Bookings Management
Implement: `src/app/(admin)/admin/bookings/page.tsx`
- Bookings table with filters
- View booking details
- Update booking status
- Cancel bookings

### 4.3 Calendar View
Implement: `src/app/(admin)/admin/calendar/page.tsx`
- Full calendar component
- Display bookings on calendar
- Click to view booking details

### 4.4 Inventory Management
Implement: `src/app/(admin)/admin/inventory/page.tsx`
- List all tents
- Add new tent
- Edit tent details
- Update tent status

## Phase 5: Reports & Analytics (Week 4-5)

### 5.1 Revenue Reports
Implement: `src/services/report.service.ts`
- Calculate total revenue
- Revenue by date range
- Revenue by tent type
- Export to CSV

### 5.2 Occupancy Reports
- Calculate occupancy rate
- Occupancy trends
- Peak seasons analysis

## Phase 6: Notifications (Week 5)

### 6.1 Email Notifications
Implement: `src/lib/email/sender.ts`
- Booking confirmation email
- Booking reminder (1 day before)
- Admin notification for new bookings

### 6.2 WhatsApp Integration
- Booking confirmation via WhatsApp
- Use existing WhatsApp number

## Phase 7: Testing & Optimization (Week 6)

### 7.1 Testing
- Unit tests for services
- Integration tests for API routes
- E2E tests for booking flow

### 7.2 Performance Optimization
- Image optimization
- Code splitting
- Caching strategies
- Database query optimization

### 7.3 SEO Optimization
- Meta tags
- Sitemap
- Structured data

## Phase 8: Deployment (Week 6)

### 8.1 Pre-deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] RLS policies set up
- [ ] Payment gateway tested
- [ ] Email notifications tested
- [ ] Admin access configured

### 8.2 Deploy to Vercel
1. Connect GitHub repository
2. Configure environment variables
3. Deploy
4. Test production deployment

### 8.3 Post-deployment
- Monitor error logs
- Set up analytics
- Configure domain
- SSL certificate

## Key Implementation Files Priority

### High Priority (Implement First)
1. `src/lib/supabase/client.ts` ✅
2. `src/lib/supabase/server.ts` ✅
3. `src/types/booking.types.ts` ✅
4. `src/validations/booking.schema.ts` ✅
5. `src/repositories/booking.repository.ts` ✅
6. `src/services/booking.service.ts` ✅
7. `src/app/api/bookings/route.ts` ✅
8. `src/components/booking/booking-form.tsx` (needs implementation)

### Medium Priority
1. Admin authentication
2. Dashboard components
3. Inventory management
4. Payment integration

### Low Priority
1. Reports
2. Email notifications
3. Advanced analytics

## Development Tips

### 1. Use TypeScript Strictly
- Enable strict mode in tsconfig.json
- Define types for all data structures
- Use Zod for runtime validation

### 2. Follow Clean Architecture
- Keep business logic in services
- Keep data access in repositories
- Keep UI logic in components

### 3. Error Handling
- Use try-catch in all async operations
- Return meaningful error messages
- Log errors for debugging

### 4. Security Best Practices
- Validate all inputs
- Use RLS policies
- Sanitize user data
- Use environment variables for secrets

### 5. Performance
- Use React Server Components where possible
- Implement pagination for large lists
- Optimize images
- Use caching

## Common Issues & Solutions

### Issue: Supabase connection errors
**Solution:** Check environment variables, ensure Supabase project is active

### Issue: TypeScript errors
**Solution:** Run `npm install` to ensure all types are installed

### Issue: Build errors
**Solution:** Check for unused imports, ensure all files are properly typed

### Issue: Authentication not working
**Solution:** Verify Supabase Auth is enabled, check middleware configuration

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Zod Documentation](https://zod.dev)

## Support

For questions or issues during implementation:
1. Check this guide
2. Review the API documentation
3. Check the database schema
4. Create an issue in the repository