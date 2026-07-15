# Wild Earth Jungle Camp - Booking Management System

A modern, full-stack campsite booking management system built with Next.js 15, TypeScript, and Supabase.
 
## 🌟 Features

### Public Features
- **Availability Search** - Real-time tent availability checking
- **Online Booking** - Complete booking flow with payment integration
- **Multiple Tent Types** - 4 different tent configurations
- **Add-ons & Activities** - Meals and outdoor activities
- **Secure Payments** - Razorpay payment gateway integration
- **Booking Confirmation** - Email confirmations and receipts

### Admin Features
- **Dashboard** - Overview of bookings, revenue, and occupancy
- **Booking Management** - View, update, and manage all bookings
- **Calendar View** - Visual representation of bookings
- **Inventory Management** - Manage tents and maintenance schedules
- **Expense Tracking** - Track operational expenses
- **Reports** - Revenue, occupancy, and trend reports

## 🏗️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth
- **Payment:** Razorpay
- **Email:** Resend
- **Deployment:** Vercel

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Razorpay account (test/live)
- Resend account (for emails)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd wild-earth-nextjs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create `.env.local` file in the root directory:

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

### 4. Database Setup

#### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Seed database
supabase db seed
```

#### Option B: Manual Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration files in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_complete_schema.sql`
   - `supabase/migrations/003_availability_functions.sql`
4. Run `supabase/seed.sql` to populate initial data

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
wild-earth-nextjs/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (public)/            # Public routes
│   │   │   ├── page.tsx         # Home page
│   │   │   ├── gallery/         # Gallery page
│   │   │   ├── booking/         # Booking flow
│   │   │   └── availability/    # Availability search
│   │   ├── (admin)/             # Admin routes (protected)
│   │   │   ├── dashboard/       # Admin dashboard
│   │   │   ├── bookings/        # Booking management
│   │   │   ├── calendar/        # Calendar view
│   │   │   ├── inventory/       # Tent management
│   │   │   ├── expenses/        # Expense tracking
│   │   │   └── reports/         # Reports
│   │   ├── api/                 # API routes
│   │   │   ├── availability/    # Availability API
│   │   │   ├── bookings/        # Booking API
│   │   │   ├── payment/         # Payment API
│   │   │   └── webhooks/        # Webhook handlers
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Global styles
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── layout/              # Layout components
│   │   ├── booking/             # Booking components
│   │   ├── admin/               # Admin components
│   │   └── gallery/             # Gallery components
│   ├── lib/                     # Utilities and configs
│   │   ├── supabase/            # Supabase client
│   │   ├── payment/             # Payment utilities
│   │   └── utils.ts             # Helper functions
│   ├── services/                # Business logic
│   │   ├── availability.service.ts
│   │   ├── booking.service.ts
│   │   └── email.service.ts
│   ├── repositories/            # Data access layer
│   │   ├── booking.repository.ts
│   │   └── inventory.repository.ts
│   ├── types/                   # TypeScript types
│   │   ├── booking.types.ts
│   │   ├── inventory.types.ts
│   │   └── payment.types.ts
│   ├── validations/             # Zod schemas
│   │   ├── availability.schema.ts
│   │   ├── booking.schema.ts
│   │   └── payment.schema.ts
│   └── hooks/                   # Custom React hooks
│       └── use-toast.ts
├── supabase/                    # Database files
│   ├── migrations/              # SQL migrations
│   └── seed.sql                 # Seed data
├── docs/                        # Documentation
│   ├── DATABASE_SCHEMA.md       # Database documentation
│   ├── AVAILABILITY_ENGINE.md   # Availability logic
│   ├── API_AVAILABILITY.md      # Availability API docs
│   ├── API_PAYMENT.md           # Payment API docs
│   └── IMPLEMENTATION_GUIDE.md  # Implementation guide
├── public/                      # Static assets
├── .env.local                   # Environment variables
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies
```

## 🏕️ Tent Types & Pricing

| Tent Type | Capacity | Price (per night) |
|-----------|----------|-------------------|
| Twin Sharing Small | 2 guests | ₹3,999 |
| Twin Sharing Semi Big | 2 guests | ₹4,999 |
| Three Sharing Jungle | 3 guests | ₹7,500 |
| Four Sharing Jungle | 4 guests | ₹8,000 |

### Add-ons
- **Lunch:** ₹300 per person
- **Dinner:** ₹400 per person

### Activities (Complimentary)
- Bonfire
- Boating
- Fishing
- Bird Watching

## 🔌 API Endpoints

### Public APIs

#### Check Availability
```http
POST /api/availability
Content-Type: application/json

{
  "checkIn": "2024-12-25",
  "checkOut": "2024-12-27",
  "guests": 2
}
```

#### Create Payment Order
```http
POST /api/payment/create-order
Content-Type: application/json

{
  "amount": 3999.00,
  "receipt": "booking_123"
}
```

#### Verify Payment
```http
POST /api/payment/verify
Content-Type: application/json

{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx"
}
```

### Admin APIs (Protected)

- `GET /api/admin/bookings` - List all bookings
- `GET /api/admin/bookings/[id]` - Get booking details
- `PATCH /api/admin/bookings/[id]` - Update booking
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/reports/revenue` - Revenue report

See [API Documentation](docs/) for complete API reference.

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## 📦 Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

Or use Vercel CLI:

```bash
vercel deploy
```

### Environment Variables in Production

Make sure to add all environment variables from `.env.local` to your production environment.

## 📚 Documentation

- [Database Schema](docs/DATABASE_SCHEMA.md) - Complete database structure
- [Availability Engine](docs/AVAILABILITY_ENGINE.md) - How availability checking works
- [API Documentation](docs/API_AVAILABILITY.md) - API endpoints and usage
- [Payment Integration](docs/API_PAYMENT.md) - Payment flow and Razorpay setup
- [Implementation Guide](docs/IMPLEMENTATION_GUIDE.md) - Development roadmap

## 🔐 Security

- ✅ Environment variables for sensitive data
- ✅ Supabase Row Level Security (RLS)
- ✅ Admin route protection with middleware
- ✅ Payment signature verification
- ✅ Webhook signature verification
- ✅ Input validation with Zod
- ✅ SQL injection prevention
- ✅ XSS protection (React default)

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
- Check Supabase credentials in `.env.local`
- Verify project URL and keys are correct

**Payment Not Working**
- Verify Razorpay keys (test vs live)
- Check webhook configuration
- Ensure HTTPS in production

**Build Errors**
- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

## 📝 Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Run linting: `npm run lint`
4. Commit changes: `git commit -m "Add feature"`
5. Push to GitHub: `git push origin feature/your-feature`
6. Create Pull Request

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 👥 Team

- **Developer:** [Your Name]
- **Client:** Wild Earth Jungle Camp
- **Project Manager:** [PM Name]

## 📞 Support

For support, email support@wildearth.com or create an issue in the repository.

## 🗺️ Roadmap

### Current Phase (v1.0)
- [x] Database schema
- [x] Availability engine
- [x] Payment integration
- [ ] Complete booking flow
- [ ] Admin authentication
- [ ] Admin dashboard

### Future Enhancements (v2.0)
- [ ] Mobile app
- [ ] Multi-language support
- [ ] Dynamic pricing
- [ ] Loyalty program
- [ ] Review system
- [ ] Social media integration

## 📊 Project Status

**Version:** 1.0.0 (In Development)  
**Last Updated:** June 8, 2026  
**Status:** 🚧 Active Development

### Progress
- ✅ Project Setup (100%)
- ✅ Database Design (100%)
- ✅ Availability Engine (100%)
- ✅ Payment Integration (100%)
- 🚧 Booking Flow (30%)
- ⏳ Admin Panel (0%)
- ⏳ Email Notifications (0%)

---

Built with ❤️ for Wild Earth Jungle Camp