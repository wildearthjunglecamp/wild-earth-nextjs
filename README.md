# Wild Earth Jungle Camp - Booking Management System

A comprehensive campsite booking management system built with Next.js 15, TypeScript, and Supabase.

## Features

### Public Features
- 🏕️ Browse campsite amenities and activities
- 📸 Photo gallery
- 🔍 Check availability for dates
- 📝 Complete booking flow with payment integration
- ✅ Booking confirmation

### Admin Features
- 📊 Dashboard with analytics
- 📅 Booking management
- 🗓️ Calendar view of all bookings
- 🏕️ Tent/campsite inventory management
- 💰 Expense tracking
- 📈 Revenue and occupancy reports

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **UI Components:** shadcn/ui
- **Payment:** Razorpay
- **Validation:** Zod
- **Forms:** React Hook Form

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public routes
│   ├── (admin)/           # Admin routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   ├── booking/          # Booking components
│   ├── admin/            # Admin components
│   └── shared/           # Shared components
├── lib/                   # Utilities and configurations
├── services/              # Business logic layer
├── repositories/          # Data access layer
├── types/                 # TypeScript type definitions
├── validations/           # Zod validation schemas
└── hooks/                 # Custom React hooks
```

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed documentation.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wild-earth-nextjs
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
- Supabase URL and keys
- Razorpay credentials
- Other configuration

4. Set up the database:
```bash
# Run migrations in your Supabase project
# See supabase/migrations/ folder
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

1. Create a new Supabase project
2. Run the migration files in order:
   - `001_initial_schema.sql` - Creates tables and indexes
   - Additional migrations as needed

See [docs/DATABASE.md](docs/DATABASE.md) for schema documentation.

## API Documentation

See [docs/API.md](docs/API.md) for complete API documentation.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Architecture

The project follows clean architecture principles:

1. **Presentation Layer** (`components/`, `app/`)
   - UI components and pages
   
2. **Business Logic Layer** (`services/`)
   - Business rules and orchestration
   
3. **Data Access Layer** (`repositories/`)
   - Database operations
   
4. **Cross-cutting Concerns** (`lib/`, `hooks/`, `types/`, `validations/`)
   - Utilities, custom hooks, types, and validation

### Adding New Features

1. Define types in `src/types/`
2. Create validation schemas in `src/validations/`
3. Implement repository in `src/repositories/`
4. Implement service in `src/services/`
5. Create API routes in `src/app/api/`
6. Build UI components in `src/components/`
7. Create pages in `src/app/`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Self-hosted

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Your License Here]

## Support

For support, email support@wildearthjunglecamp.com or create an issue in the repository.

## Roadmap

- [ ] Implement complete booking flow
- [ ] Add payment integration
- [ ] Build admin dashboard
- [ ] Add email notifications
- [ ] Implement calendar view
- [ ] Add reporting features
- [ ] Mobile app (future)

## Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- shadcn for the beautiful UI components