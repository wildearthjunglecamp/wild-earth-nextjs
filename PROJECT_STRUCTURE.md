# Wild Earth Jungle Camp - Project Structure

## Complete Folder Structure

```
wild-earth-nextjs/
├── src/
│   ├── app/                                    # Next.js 15 App Router
│   │   ├── (public)/                          # Public routes group
│   │   │   ├── layout.tsx                     # Public layout with navbar/footer
│   │   │   ├── page.tsx                       # Home/Landing page
│   │   │   ├── gallery/
│   │   │   │   └── page.tsx                   # Gallery page
│   │   │   ├── booking/
│   │   │   │   ├── page.tsx                   # Booking search & form
│   │   │   │   └── loading.tsx                # Loading state
│   │   │   ├── booking-success/
│   │   │   │   └── page.tsx                   # Booking confirmation page
│   │   │   └── availability/
│   │   │       └── page.tsx                   # Availability search page
│   │   │
│   │   ├── (admin)/                           # Admin routes group (protected)
│   │   │   ├── layout.tsx                     # Admin layout with sidebar
│   │   │   ├── admin/
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── page.tsx               # Admin dashboard overview
│   │   │   │   │   └── loading.tsx
│   │   │   │   ├── bookings/
│   │   │   │   │   ├── page.tsx               # Bookings list & management
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── page.tsx           # Single booking details
│   │   │   │   │   │   └── edit/
│   │   │   │   │   │       └── page.tsx       # Edit booking
│   │   │   │   │   └── loading.tsx
│   │   │   │   ├── calendar/
│   │   │   │   │   ├── page.tsx               # Calendar view of bookings
│   │   │   │   │   └── loading.tsx
│   │   │   │   ├── inventory/
│   │   │   │   │   ├── page.tsx               # Tent/campsite inventory
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx           # Inventory item details
│   │   │   │   │   └── loading.tsx
│   │   │   │   ├── expenses/
│   │   │   │   │   ├── page.tsx               # Expense tracking
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx           # Expense details
│   │   │   │   │   └── loading.tsx
│   │   │   │   └── reports/
│   │   │   │       ├── page.tsx               # Reports dashboard
│   │   │   │       ├── revenue/
│   │   │   │       │   └── page.tsx           # Revenue reports
│   │   │   │       ├── occupancy/
│   │   │   │       │   └── page.tsx           # Occupancy reports
│   │   │   │       └── loading.tsx
│   │   │
│   │   ├── api/                               # API routes
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   └── route.ts               # Login endpoint
│   │   │   │   ├── logout/
│   │   │   │   │   └── route.ts               # Logout endpoint
│   │   │   │   └── session/
│   │   │   │       └── route.ts               # Session check
│   │   │   ├── bookings/
│   │   │   │   ├── route.ts                   # GET all, POST new booking
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.ts               # GET, PATCH, DELETE booking
│   │   │   │   ├── availability/
│   │   │   │   │   └── route.ts               # Check availability
│   │   │   │   └── confirm/
│   │   │   │       └── route.ts               # Confirm booking
│   │   │   ├── inventory/
│   │   │   │   ├── route.ts                   # GET all, POST new item
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts               # GET, PATCH, DELETE item
│   │   │   ├── expenses/
│   │   │   │   ├── route.ts                   # GET all, POST new expense
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts               # GET, PATCH, DELETE expense
│   │   │   ├── reports/
│   │   │   │   ├── revenue/
│   │   │   │   │   └── route.ts               # Revenue report data
│   │   │   │   └── occupancy/
│   │   │   │       └── route.ts               # Occupancy report data
│   │   │   └── webhooks/
│   │   │       └── payment/
│   │   │           └── route.ts               # Payment webhook handler
│   │   │
│   │   ├── globals.css                        # Global styles
│   │   ├── layout.tsx                         # Root layout
│   │   └── not-found.tsx                      # 404 page
│   │
│   ├── components/                            # React components
│   │   ├── ui/                                # shadcn/ui components (existing)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── calendar.tsx
│   │   │   └── ... (all existing UI components)
│   │   │
│   │   ├── layout/                            # Layout components
│   │   │   ├── navbar.tsx                     # Public navbar
│   │   │   ├── footer.tsx                     # Public footer
│   │   │   ├── admin-sidebar.tsx              # Admin sidebar navigation
│   │   │   └── admin-header.tsx               # Admin header
│   │   │
│   │   ├── home/                              # Home page components
│   │   │   ├── amenity-card.tsx               # Existing amenity card
│   │   │   ├── hero-section.tsx               # Hero section
│   │   │   └── cta-section.tsx                # Call-to-action section
│   │   │
│   │   ├── gallery/                           # Gallery components
│   │   │   ├── image-grid.tsx                 # Existing image grid
│   │   │   └── image-lightbox.tsx             # Existing lightbox
│   │   │
│   │   ├── booking/                           # Booking components
│   │   │   ├── availability-search.tsx        # Search form for availability
│   │   │   ├── booking-form.tsx               # Main booking form
│   │   │   ├── date-range-picker.tsx          # Custom date range picker
│   │   │   ├── guest-selector.tsx             # Guest count selector
│   │   │   ├── tent-selector.tsx              # Tent/campsite selector
│   │   │   ├── booking-summary.tsx            # Booking summary card
│   │   │   └── payment-form.tsx               # Payment integration form
│   │   │
│   │   ├── admin/                             # Admin components
│   │   │   ├── dashboard/
│   │   │   │   ├── stats-card.tsx             # Dashboard stat cards
│   │   │   │   ├── revenue-chart.tsx          # Revenue chart
│   │   │   │   ├── occupancy-chart.tsx        # Occupancy chart
│   │   │   │   └── recent-bookings.tsx        # Recent bookings list
│   │   │   ├── bookings/
│   │   │   │   ├── bookings-table.tsx         # Bookings data table
│   │   │   │   ├── booking-details.tsx        # Booking details view
│   │   │   │   ├── booking-status-badge.tsx   # Status badge component
│   │   │   │   └── booking-actions.tsx        # Action buttons
│   │   │   ├── calendar/
│   │   │   │   ├── calendar-view.tsx          # Full calendar component
│   │   │   │   └── booking-event.tsx          # Calendar event item
│   │   │   ├── inventory/
│   │   │   │   ├── inventory-table.tsx        # Inventory data table
│   │   │   │   ├── inventory-form.tsx         # Add/edit inventory form
│   │   │   │   └── availability-status.tsx    # Availability indicator
│   │   │   ├── expenses/
│   │   │   │   ├── expenses-table.tsx         # Expenses data table
│   │   │   │   └── expense-form.tsx           # Add/edit expense form
│   │   │   └── reports/
│   │   │       ├── report-filters.tsx         # Date/filter controls
│   │   │       ├── revenue-report.tsx         # Revenue report view
│   │   │       └── occupancy-report.tsx       # Occupancy report view
│   │   │
│   │   ├── shared/                            # Shared/common components
│   │   │   ├── loading-spinner.tsx            # Loading indicator
│   │   │   ├── error-boundary.tsx             # Error boundary wrapper
│   │   │   ├── data-table.tsx                 # Reusable data table
│   │   │   ├── date-picker.tsx                # Enhanced date picker
│   │   │   ├── file-upload.tsx                # File upload component
│   │   │   └── confirmation-dialog.tsx        # Confirmation modal
│   │   │
│   │   └── providers/                         # Context providers
│   │       ├── auth-provider.tsx              # Authentication context
│   │       ├── theme-provider.tsx             # Theme context
│   │       └── toast-provider.tsx             # Toast notifications
│   │
│   ├── lib/                                   # Utility libraries
│   │   ├── utils.ts                           # Existing utility functions
│   │   ├── supabase/
│   │   │   ├── client.ts                      # Supabase client (browser)
│   │   │   ├── server.ts                      # Supabase server client
│   │   │   └── middleware.ts                  # Supabase middleware
│   │   ├── auth/
│   │   │   ├── session.ts                     # Session management
│   │   │   └── permissions.ts                 # Permission checks
│   │   ├── payment/
│   │   │   └── razorpay.ts                    # Razorpay integration
│   │   ├── email/
│   │   │   ├── templates.ts                   # Email templates
│   │   │   └── sender.ts                      # Email sending logic
│   │   └── constants.ts                       # App-wide constants
│   │
│   ├── services/                              # Business logic layer
│   │   ├── booking.service.ts                 # Booking business logic
│   │   ├── inventory.service.ts               # Inventory business logic
│   │   ├── expense.service.ts                 # Expense business logic
│   │   ├── report.service.ts                  # Report generation logic
│   │   ├── payment.service.ts                 # Payment processing logic
│   │   ├── notification.service.ts            # Notification logic
│   │   └── availability.service.ts            # Availability calculation
│   │
│   ├── repositories/                          # Data access layer
│   │   ├── booking.repository.ts              # Booking database operations
│   │   ├── inventory.repository.ts            # Inventory database operations
│   │   ├── expense.repository.ts              # Expense database operations
│   │   ├── user.repository.ts                 # User database operations
│   │   └── base.repository.ts                 # Base repository with common methods
│   │
│   ├── types/                                 # TypeScript type definitions
│   │   ├── index.ts                           # Main types export
│   │   ├── booking.types.ts                   # Booking-related types
│   │   ├── inventory.types.ts                 # Inventory-related types
│   │   ├── expense.types.ts                   # Expense-related types
│   │   ├── user.types.ts                      # User-related types
│   │   ├── payment.types.ts                   # Payment-related types
│   │   ├── report.types.ts                    # Report-related types
│   │   ├── api.types.ts                       # API request/response types
│   │   └── database.types.ts                  # Supabase generated types
│   │
│   ├── validations/                           # Zod validation schemas
│   │   ├── booking.schema.ts                  # Booking validation schemas
│   │   ├── inventory.schema.ts                # Inventory validation schemas
│   │   ├── expense.schema.ts                  # Expense validation schemas
│   │   ├── auth.schema.ts                     # Auth validation schemas
│   │   └── common.schema.ts                   # Common/shared schemas
│   │
│   ├── hooks/                                 # Custom React hooks
│   │   ├── use-toast.ts                       # Existing toast hook
│   │   ├── use-auth.ts                        # Authentication hook
│   │   ├── use-bookings.ts                    # Bookings data hook
│   │   ├── use-inventory.ts                   # Inventory data hook
│   │   ├── use-availability.ts                # Availability check hook
│   │   ├── use-debounce.ts                    # Debounce hook
│   │   └── use-media-query.ts                 # Responsive hook
│   │
│   ├── middleware.ts                          # Next.js middleware (auth)
│   │
│   └── data/                                  # Static data
│       ├── gallery-images.ts                  # Existing gallery data
│       └── amenities.ts                       # Amenities data
│
├── public/                                    # Static assets
│   ├── images/                                # Image assets
│   │   ├── hero/
│   │   ├── gallery/
│   │   └── icons/
│   └── ... (existing images)
│
├── supabase/                                  # Supabase configuration
│   ├── migrations/                            # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_bookings_table.sql
│   │   ├── 003_inventory_table.sql
│   │   ├── 004_expenses_table.sql
│   │   └── 005_rls_policies.sql
│   └── seed.sql                               # Seed data
│
├── docs/                                      # Documentation
│   ├── API.md                                 # API documentation
│   ├── DATABASE.md                            # Database schema docs
│   └── DEPLOYMENT.md                          # Deployment guide
│
├── .env.local                                 # Environment variables
├── .env.example                               # Environment template
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

## Folder Responsibilities

### **1. `src/app/` - Next.js App Router**

#### **`(public)/` - Public Routes Group**
- **Responsibility**: Contains all public-facing pages accessible without authentication
- **Layout**: Includes public navbar and footer
- **Pages**:
  - `page.tsx`: Landing/home page with hero, amenities, activities
  - `gallery/`: Photo gallery of the campsite
  - `booking/`: Booking search and form with availability check
  - `booking-success/`: Confirmation page after successful booking
  - `availability/`: Standalone availability search page

#### **`(admin)/` - Admin Routes Group**
- **Responsibility**: Protected admin panel for managing the campsite
- **Layout**: Includes admin sidebar navigation and header
- **Authentication**: All routes require admin authentication
- **Sections**:
  - `dashboard/`: Overview with stats, charts, recent activity
  - `bookings/`: Manage all bookings (list, view, edit, cancel)
  - `calendar/`: Visual calendar view of all bookings
  - `inventory/`: Manage tents/campsites (add, edit, availability)
  - `expenses/`: Track and manage operational expenses
  - `reports/`: Generate revenue and occupancy reports

#### **`api/` - API Routes**
- **Responsibility**: Backend API endpoints for data operations
- **Structure**:
  - `auth/`: Authentication endpoints (login, logout, session)
  - `bookings/`: CRUD operations for bookings
  - `inventory/`: CRUD operations for inventory
  - `expenses/`: CRUD operations for expenses
  - `reports/`: Data endpoints for reports
  - `webhooks/`: External service webhooks (payment confirmations)

---

### **2. `src/components/` - React Components**

#### **`ui/` - UI Components**
- **Responsibility**: Reusable shadcn/ui components (buttons, inputs, cards, etc.)
- **Usage**: Building blocks for all other components

#### **`layout/` - Layout Components**
- **Responsibility**: Page structure components
- **Components**:
  - `navbar.tsx`: Public site navigation
  - `footer.tsx`: Public site footer
  - `admin-sidebar.tsx`: Admin panel navigation
  - `admin-header.tsx`: Admin panel header with user menu

#### **`home/`, `gallery/`, `booking/`, `admin/` - Feature Components**
- **Responsibility**: Feature-specific components organized by domain
- **Principle**: Co-locate related components for better maintainability

#### **`shared/` - Shared Components**
- **Responsibility**: Common components used across multiple features
- **Examples**: Loading spinners, error boundaries, data tables, dialogs

#### **`providers/` - Context Providers**
- **Responsibility**: React context providers for global state
- **Providers**: Authentication, theme, toast notifications

---

### **3. `src/lib/` - Utility Libraries**

#### **Purpose**: Configuration and utility functions
- **`utils.ts`**: General utility functions (classNames, formatters)
- **`supabase/`**: Supabase client configuration for browser and server
- **`auth/`**: Authentication utilities (session management, permissions)
- **`payment/`**: Payment gateway integration (Razorpay)
- **`email/`**: Email templates and sending logic
- **`constants.ts`**: Application-wide constants

---

### **4. `src/services/` - Business Logic Layer**

#### **Purpose**: Encapsulate business logic and orchestrate data operations
- **Responsibility**: 
  - Implement business rules
  - Coordinate between repositories
  - Handle complex operations
  - Transform data for presentation

#### **Services**:
- **`booking.service.ts`**: Booking creation, validation, confirmation logic
- **`inventory.service.ts`**: Inventory management, availability calculation
- **`expense.service.ts`**: Expense tracking and categorization
- **`report.service.ts`**: Report generation and data aggregation
- **`payment.service.ts`**: Payment processing and verification
- **`notification.service.ts`**: Email/SMS notifications
- **`availability.service.ts`**: Complex availability calculations

**Example**: `booking.service.ts` would check availability, validate dates, calculate pricing, create booking record, send confirmation email, and update inventory.

---

### **5. `src/repositories/` - Data Access Layer**

#### **Purpose**: Direct database interactions using Supabase
- **Responsibility**:
  - CRUD operations
  - Database queries
  - Data persistence
  - No business logic

#### **Repositories**:
- **`booking.repository.ts`**: Booking table operations
- **`inventory.repository.ts`**: Inventory table operations
- **`expense.repository.ts`**: Expense table operations
- **`user.repository.ts`**: User table operations
- **`base.repository.ts`**: Common database methods (findById, findAll, create, update, delete)

**Example**: `booking.repository.ts` contains methods like `findById()`, `findByDateRange()`, `create()`, `update()`, `delete()`.

---

### **6. `src/types/` - TypeScript Types**

#### **Purpose**: Centralized type definitions for type safety
- **Responsibility**: Define interfaces, types, and enums

#### **Type Files**:
- **`booking.types.ts`**: Booking, BookingStatus, BookingFilters
- **`inventory.types.ts`**: Tent, TentType, TentStatus
- **`expense.types.ts`**: Expense, ExpenseCategory
- **`user.types.ts`**: User, UserRole, AdminUser
- **`payment.types.ts`**: Payment, PaymentStatus, PaymentMethod
- **`report.types.ts`**: RevenueReport, OccupancyReport
- **`api.types.ts`**: API request/response types
- **`database.types.ts`**: Supabase auto-generated types

---

### **7. `src/validations/` - Zod Schemas**

#### **Purpose**: Input validation using Zod
- **Responsibility**: 
  - Validate API requests
  - Validate form inputs
  - Type-safe validation

#### **Schema Files**:
- **`booking.schema.ts`**: Booking creation/update schemas
- **`inventory.schema.ts`**: Inventory validation schemas
- **`expense.schema.ts`**: Expense validation schemas
- **`auth.schema.ts`**: Login/signup validation
- **`common.schema.ts`**: Shared validation patterns (email, phone, date)

**Example**: `createBookingSchema` validates guest count, dates, contact info, etc.

---

### **8. `src/hooks/` - Custom React Hooks**

#### **Purpose**: Reusable React logic
- **Responsibility**: Encapsulate stateful logic and side effects

#### **Hooks**:
- **`use-auth.ts`**: Authentication state and methods
- **`use-bookings.ts`**: Fetch and manage bookings data
- **`use-inventory.ts`**: Fetch and manage inventory data
- **`use-availability.ts`**: Check availability for date ranges
- **`use-debounce.ts`**: Debounce input values
- **`use-media-query.ts`**: Responsive breakpoint detection

---

### **9. `supabase/` - Database Configuration**

#### **Purpose**: Database schema and migrations
- **`migrations/`**: SQL migration files for version control
- **`seed.sql`**: Initial data for development/testing

---

### **10. `docs/` - Documentation**

#### **Purpose**: Project documentation
- **`API.md`**: API endpoint documentation
- **`DATABASE.md`**: Database schema and relationships
- **`DEPLOYMENT.md`**: Deployment instructions

---

## Architecture Principles

### **Clean Architecture Benefits**:
1. **Separation of Concerns**: Each layer has a single responsibility
2. **Testability**: Business logic isolated from framework code
3. **Maintainability**: Easy to locate and modify code
4. **Scalability**: Add features without affecting existing code
5. **Type Safety**: TypeScript types throughout the stack

### **Data Flow**:
```
UI Component → Hook → Service → Repository → Database
                ↓
            Validation (Zod)
                ↓
            Types (TypeScript)
```

### **Example Flow - Creating a Booking**:
1. User fills `booking-form.tsx` component
2. Form validates with `booking.schema.ts`
3. Component calls `use-bookings.ts` hook
4. Hook calls `booking.service.ts`
5. Service checks availability via `availability.service.ts`
6. Service creates booking via `booking.repository.ts`
7. Repository interacts with Supabase
8. Service sends confirmation via `notification.service.ts`
9. Success response flows back to UI

---

## Next Steps

1. **Set up Supabase**: Create database tables and RLS policies
2. **Implement authentication**: Admin login system
3. **Build booking flow**: Availability → Booking → Payment → Confirmation
4. **Create admin panel**: Dashboard and management interfaces
5. **Add payment integration**: Razorpay for online payments
6. **Implement notifications**: Email confirmations and reminders

This structure provides a solid foundation for a scalable, maintainable campsite booking system.