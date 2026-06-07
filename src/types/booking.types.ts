/**
 * Booking Type Definitions
 */

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

export interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  tentId: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingInput {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  tentId: string;
  specialRequests?: string;
}

export interface BookingFilters {
  status?: BookingStatus;
  startDate?: Date;
  endDate?: Date;
  guestEmail?: string;
}

// Made with Bob
