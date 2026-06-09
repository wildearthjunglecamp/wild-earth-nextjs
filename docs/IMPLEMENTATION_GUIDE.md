# Wild Earth Jungle Camp - Implementation Guide

## Overview

This guide provides a step-by-step implementation roadmap for the campsite booking management system.

## Project Status

### ✅ Completed

1. **Project Structure**
   - Clean architecture with separation of concerns
   - App Router with public and admin route groups
   - Component organization (UI, features, layouts)
   - Services, repositories, types, validations layers

2. **Database Schema**
   - Complete PostgreSQL schema with 10 tables
   - Tent types and physical tents configured
   - Booking system with payment tracking
   - Add-ons and activities support
   - Inventory management

3. **Availability Engine**
   - Sophisticated date overlap logic
   - Same-day turnover support (Check-in 1 PM, Check-out 11 AM)
   - 7 PostgreSQL functions for availability checking
   - TypeScript service with comprehensive methods
   - Edge case handling (concurrent bookings, maintenance, etc.)

4. **Payment Integration**
   - Razorpay SDK integration
   - Order creation endpoint
   - Payment verification endpoint
   - Webhook handler for real-time notifications
   - Amount conversion (INR ↔ paise)

5. **API Endpoints**
   - POST /api/availability - Check tent availability
   - POST /api/payment/create-order - Create Razorpay order
   - POST /api/payment/verify - Verify payment signature
   - POST /api/webhooks/payment - Handle payment webhooks

6. **Documentation**
   - Database schema with ERD
   - Availability engine documentation
   - API documentation with examples
   - Payment integration guide

### 🚧 In Progress / Pending

1. **Booking Flow**
   - Create booking endpoint (POST /api/bookings)
   - Integrate availability check + payment
   - Handle booking creation after payment
   - Generate booking confirmation

2. **Admin Authentication**
   - Supabase Auth setup
   - Admin middleware
   - Protected admin routes
   - Role-based access control

3. **Admin Dashboard**
   - Dashboard overview with stats
   - Recent bookings list
   - Revenue charts
   - Quick actions

4. **Booking Management**
   - View all bookings
   - Filter and search
   - Update booking status
   - Cancel bookings
   - Refund handling

5. **Calendar View**
   - Monthly calendar with bookings
   - Tent availability visualization
   - Drag-and-drop booking updates
   - Conflict detection

6. **Inventory Management**
   - Tent status management
   - Maintenance scheduling
   - Availability overrides
   - Bulk operations

7. **Expense Tracking**
   - Add/edit expenses
   - Categorization
   - Date range filtering
   - Export reports

8. **Reports**
   - Revenue reports
   - Occupancy reports
   - Booking trends
   - Export to PDF/Excel

9. **Email Notifications**
   - Booking confirmation emails
   - Payment receipts
   - Reminder emails
   - Admin notifications

10. **Frontend Pages**
    - Public booking flow UI
    - Availability search interface
    - Payment integration UI
    - Booking success page
    - Admin dashboard UI

## Implementation Roadmap

### Phase 1: Complete Booking Flow (Week 1-2)

#### 1.1 Create Booking Endpoint

**File:** `src/app/api/bookings/route.ts`

**Requirements:**
- Accept booking details (customer info, dates, tents, add-ons)
- Validate availability before creating booking
- Create Razorpay order
- Store booking with pending_payment status
- Return order details for payment

**Steps:**
1. Create booking validation schema
2. Implement booking repository methods
3. Create booking service with business logic
4. Build API endpoint with error handling
5. Test with various scenarios

#### 1.2 Payment Completion Handler

**File:** `src/app/api/bookings/[id]/confirm/route.ts`

**Requirements:**
- Verify payment signature
- Update booking status to confirmed
- Update payment status to paid
- Send confirmation email
- Return booking confirmation

#### 1.3 Frontend Booking Flow

**Files:**
- `src/app/(public)/booking/page.tsx` - Main booking form
- `src/components/booking/availability-search.tsx` - Search component
- `src/components/booking/tent-selection.tsx` - Tent selection
- `src/components/booking/customer-form.tsx` - Customer details
- `src/components/booking/payment-button.tsx` - Payment integration
- `src/app/(public)/booking/success/page.tsx` - Success page

**Requirements:**
- Multi-step booking form
- Real-time availability checking
- Tent type selection with pricing
- Add-ons selection
- Customer information form
- Razorpay payment integration
- Success page with booking details

### Phase 2: Admin Authentication (Week 2)

#### 2.1 Supabase Auth Setup

**Files:**
- `src/lib/supabase/auth.ts` - Auth utilities
- `src/middleware.ts` - Route protection
- `src/app/(admin)/login/page.tsx` - Admin login

**Requirements:**
- Email/password authentication
- Session management
- Protected admin routes
- Logout functionality

#### 2.2 Admin Middleware

**File:** `src/middleware.ts`

**Requirements:**
- Check authentication for admin routes
- Redirect unauthenticated users to login
- Allow public routes without auth

### Phase 3: Admin Dashboard (Week 3)

#### 3.1 Dashboard Overview

**File:** `src/app/(admin)/dashboard/page.tsx`

**Components:**
- Stats cards (total bookings, revenue, occupancy)
- Revenue chart (last 30 days)
- Recent bookings table
- Quick actions

**API Endpoints:**
- GET /api/admin/stats - Dashboard statistics
- GET /api/admin/bookings/recent - Recent bookings

#### 3.2 Bookings Management

**File:** `src/app/(admin)/bookings/page.tsx`

**Features:**
- List all bookings with pagination
- Filter by status, date range, tent type
- Search by customer name, email, booking ID
- View booking details
- Update booking status
- Cancel bookings

**API Endpoints:**
- GET /api/admin/bookings - List bookings
- GET /api/admin/bookings/[id] - Get booking details
- PATCH /api/admin/bookings/[id] - Update booking
- DELETE /api/admin/bookings/[id] - Cancel booking

### Phase 4: Calendar & Inventory (Week 4)

#### 4.1 Calendar View

**File:** `src/app/(admin)/calendar/page.tsx`

**Features:**
- Monthly calendar view
- Show bookings on calendar
- Color-coded by tent type
- Click to view booking details
- Drag-and-drop to reschedule (optional)

**Libraries:**
- FullCalendar or React Big Calendar

#### 4.2 Inventory Management

**File:** `src/app/(admin)/inventory/page.tsx`

**Features:**
- List all tents with status
- Update tent status (available, maintenance, out_of_service)
- Schedule maintenance periods
- View tent booking history

**API Endpoints:**
- GET /api/admin/inventory - List tents
- PATCH /api/admin/inventory/[id] - Update tent
- POST /api/admin/inventory/maintenance - Schedule maintenance

### Phase 5: Expenses & Reports (Week 5)

#### 5.1 Expense Tracking

**File:** `src/app/(admin)/expenses/page.tsx`

**Features:**
- Add new expenses
- List expenses with filtering
- Edit/delete expenses
- Categorize expenses
- Date range filtering

**API Endpoints:**
- GET /api/admin/expenses - List expenses
- POST /api/admin/expenses - Create expense
- PATCH /api/admin/expenses/[id] - Update expense
- DELETE /api/admin/expenses/[id] - Delete expense

#### 5.2 Reports

**File:** `src/app/(admin)/reports/page.tsx`

**Features:**
- Revenue reports (daily, weekly, monthly)
- Occupancy reports
- Booking trends
- Expense reports
- Export to PDF/Excel

**API Endpoints:**
- GET /api/admin/reports/revenue - Revenue data
- GET /api/admin/reports/occupancy - Occupancy data
- GET /api/admin/reports/trends - Booking trends
- GET /api/admin/reports/export - Export report

### Phase 6: Email Notifications (Week 6)

#### 6.1 Email Service Setup

**File:** `src/services/email.service.ts`

**Provider Options:**
- Resend (recommended)
- SendGrid
- AWS SES
- Nodemailer

#### 6.2 Email Templates

**Files:**
- `src/emails/booking-confirmation.tsx` - Booking confirmation
- `src/emails/payment-receipt.tsx` - Payment receipt
- `src/emails/booking-reminder.tsx` - Reminder (1 day before)
- `src/emails/admin-notification.tsx` - New booking alert

**Requirements:**
- React Email for templates
- Responsive design
- Include booking details
- Include payment information
- Include contact information

#### 6.3 Email Triggers

**Locations:**
- After payment confirmation
- After booking cancellation
- 1 day before check-in (cron job)
- After admin actions

## Technical Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** React hooks, Context API
- **Forms:** React Hook Form + Zod
- **Date Handling:** date-fns

### Backend
- **API:** Next.js API Routes
- **Database:** Supabase PostgreSQL
- **ORM:** Supabase Client
- **Authentication:** Supabase Auth
- **Payment:** Razorpay
- **Email:** Resend (recommended)

### DevOps
- **Hosting:** Vercel (recommended)
- **Database:** Supabase Cloud
- **Environment:** .env.local for development
- **Version Control:** Git

## Environment Variables

Create `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx

# Email (Resend)
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=bookings@wildearth.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL=admin@wildearth.com
```

## Database Setup

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Create new project
3. Copy project URL and keys

### 2. Run Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Or manually run SQL files in Supabase dashboard
```

### 3. Seed Data

Run `supabase/seed.sql` in Supabase SQL Editor to populate:
- Tent types (4 types)
- Physical tents (15 tents)
- Add-ons (Lunch, Dinner)
- Activities (Bonfire, Boating, Fishing, Bird Watching)

## Development Workflow

### 1. Setup

```bash
# Clone repository
git clone <repository-url>
cd wild-earth-nextjs

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

### 2. Database Changes

```bash
# Create new migration
supabase migration new migration_name

# Edit migration file in supabase/migrations/

# Apply migration
supabase db push
```

### 3. Testing

```bash
# Run tests (when implemented)
npm test

# Run type checking
npm run type-check

# Run linting
npm run lint
```

### 4. Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel deploy

# Or push to main branch (auto-deploy)
git push origin main
```

## API Testing

### Using cURL

```bash
# Check availability
curl -X POST http://localhost:3000/api/availability \
  -H "Content-Type: application/json" \
  -d '{
    "checkIn": "2024-12-25",
    "checkOut": "2024-12-27",
    "guests": 2
  }'

# Create payment order
curl -X POST http://localhost:3000/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 3999.00,
    "receipt": "booking_test_123"
  }'
```

### Using Postman

Import the API collection (create one with all endpoints).

## Security Checklist

- [ ] Environment variables properly configured
- [ ] Supabase RLS policies enabled
- [ ] Admin routes protected with middleware
- [ ] Payment signature verification implemented
- [ ] Webhook signature verification implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (using parameterized queries)
- [ ] XSS prevention (React escapes by default)
- [ ] CSRF protection (Next.js handles this)
- [ ] Rate limiting on API routes
- [ ] HTTPS in production
- [ ] Secure session management

## Performance Optimization

- [ ] Database indexes on frequently queried columns
- [ ] API response caching where appropriate
- [ ] Image optimization (Next.js Image component)
- [ ] Code splitting and lazy loading
- [ ] Database connection pooling
- [ ] CDN for static assets
- [ ] Monitoring and logging setup

## Monitoring & Logging

### Recommended Tools

- **Error Tracking:** Sentry
- **Analytics:** Vercel Analytics, Google Analytics
- **Logging:** Vercel Logs, Supabase Logs
- **Uptime Monitoring:** UptimeRobot, Pingdom

### Key Metrics to Track

- API response times
- Error rates
- Payment success/failure rates
- Booking conversion rate
- Database query performance
- User session duration

## Support & Maintenance

### Regular Tasks

- **Daily:** Monitor bookings, check payment status
- **Weekly:** Review error logs, check system health
- **Monthly:** Database backup, performance review
- **Quarterly:** Security audit, dependency updates

### Backup Strategy

- **Database:** Supabase automatic backups (daily)
- **Code:** Git repository (GitHub/GitLab)
- **Environment:** Document all configurations

## Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Razorpay Docs](https://razorpay.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)

### Internal Documentation
- `docs/DATABASE_SCHEMA.md` - Database structure
- `docs/AVAILABILITY_ENGINE.md` - Availability logic
- `docs/API_AVAILABILITY.md` - Availability API
- `docs/API_PAYMENT.md` - Payment API

## Getting Help

### Common Issues

1. **TypeScript errors:** Run `npm run type-check`
2. **Database connection:** Check Supabase credentials
3. **Payment not working:** Verify Razorpay keys
4. **Build errors:** Clear `.next` folder and rebuild

### Contact

- **Developer:** [Your Name]
- **Email:** [Your Email]
- **Repository:** [GitHub URL]

## Next Steps

1. ✅ Review completed work (database, availability, payment)
2. 🚀 Start Phase 1: Complete booking flow
3. 📧 Setup email service
4. 🔐 Implement admin authentication
5. 📊 Build admin dashboard
6. 🧪 Write tests
7. 🚀 Deploy to production

---

**Last Updated:** June 8, 2026
**Version:** 1.0.0
**Status:** In Development