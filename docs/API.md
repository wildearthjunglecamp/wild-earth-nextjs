# API Documentation

## Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication
Admin routes require authentication via Supabase session cookies.

## Endpoints

### Bookings

#### GET /api/bookings
Get all bookings with optional filters.

**Query Parameters:**
- `status` - Filter by booking status (pending, confirmed, cancelled, completed)
- `startDate` - Filter bookings from this date
- `endDate` - Filter bookings until this date
- `guestEmail` - Filter by guest email

**Response:**
```json
{
  "bookings": [
    {
      "id": "uuid",
      "guestName": "John Doe",
      "guestEmail": "john@example.com",
      "guestPhone": "+1234567890",
      "checkInDate": "2024-06-15",
      "checkOutDate": "2024-06-17",
      "numberOfGuests": 2,
      "tentId": "uuid",
      "status": "confirmed",
      "paymentStatus": "paid",
      "totalAmount": 5000,
      "specialRequests": "Early check-in",
      "createdAt": "2024-06-01T10:00:00Z",
      "updatedAt": "2024-06-01T10:00:00Z"
    }
  ]
}
```

#### POST /api/bookings
Create a new booking.

**Request Body:**
```json
{
  "guestName": "John Doe",
  "guestEmail": "john@example.com",
  "guestPhone": "+1234567890",
  "checkInDate": "2024-06-15",
  "checkOutDate": "2024-06-17",
  "numberOfGuests": 2,
  "tentId": "uuid",
  "specialRequests": "Early check-in"
}
```

**Response:**
```json
{
  "booking": { /* booking object */ },
  "message": "Booking created successfully"
}
```

#### GET /api/bookings/[id]
Get a specific booking by ID.

#### PATCH /api/bookings/[id]
Update a booking.

#### DELETE /api/bookings/[id]
Cancel a booking.

#### POST /api/bookings/availability
Check availability for a date range.

**Request Body:**
```json
{
  "startDate": "2024-06-15",
  "endDate": "2024-06-17",
  "guestCount": 2
}
```

**Response:**
```json
{
  "available": true,
  "availableTents": [
    {
      "id": "uuid",
      "name": "Deluxe Tent 1",
      "type": "deluxe",
      "capacity": 4,
      "pricePerNight": 2500
    }
  ]
}
```

### Inventory

#### GET /api/inventory
Get all tents/campsites.

#### POST /api/inventory
Create a new tent (Admin only).

#### GET /api/inventory/[id]
Get a specific tent by ID.

#### PATCH /api/inventory/[id]
Update tent details (Admin only).

#### DELETE /api/inventory/[id]
Delete a tent (Admin only).

### Expenses

#### GET /api/expenses
Get all expenses (Admin only).

#### POST /api/expenses
Create a new expense (Admin only).

#### GET /api/expenses/[id]
Get a specific expense by ID (Admin only).

#### PATCH /api/expenses/[id]
Update an expense (Admin only).

#### DELETE /api/expenses/[id]
Delete an expense (Admin only).

### Reports

#### GET /api/reports/revenue
Get revenue report (Admin only).

**Query Parameters:**
- `startDate` - Report start date
- `endDate` - Report end date

#### GET /api/reports/occupancy
Get occupancy report (Admin only).

**Query Parameters:**
- `startDate` - Report start date
- `endDate` - Report end date

### Authentication

#### POST /api/auth/login
Admin login.

#### POST /api/auth/logout
Admin logout.

#### GET /api/auth/session
Check current session.

### Webhooks

#### POST /api/webhooks/payment
Payment gateway webhook for payment confirmations.

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Common Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error