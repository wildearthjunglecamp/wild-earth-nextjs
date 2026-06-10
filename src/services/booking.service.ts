import { createClient } from '../lib/supabase/server';
import { verifyPaymentSignature } from '../lib/payment/razorpay';
import { pricingRepository } from '../repositories/pricing.repository';
import type {
  CreateBookingInput,
  BookingResponse,
  TentItem,
  TentTypeSummary,
  AssignedTent
} from '../validations/booking.schema';
import {
  calculateTotalTents,
  calculateTentItemsTotal,
  validateTentCapacity
} from '../validations/booking.schema';

/**
 * Booking Service
 * 
 * Handles all booking-related business logic with atomic transactions,
 * payment verification, and support for multiple tent types per booking.
 */

interface BookingResult {
  success: boolean;
  data?: BookingResponse;
  error?: string;
  details?: any;
}

/**
 * Generate unique booking number
 * Format: WE-YYYYMMDD-XXXX (e.g., WE-20241225-0001)
 */
function generateBookingNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `WE-${year}${month}${day}-${random}`;
}

/**
 * Calculate number of nights between two dates
 */
function calculateNights(checkIn: string, checkOut: string): number {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const diffTime = checkOutDate.getTime() - checkInDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Validate availability for all tent types in the booking
 */
export async function validateAvailability(
  tentItems: TentItem[],
  checkIn: string,
  checkOut: string
): Promise<{ available: boolean; message?: string; details?: any }> {
  const supabase = await createClient();

  try {
    for (const item of tentItems) {
      // Check availability for this tent type
      const { data, error } = await supabase.rpc('check_tent_availability', {
        p_tent_type_slug: item.tentTypeSlug,
        p_check_in: checkIn,
        p_check_out: checkOut,
        p_quantity: item.quantity,
      });

      if (error) {
        console.error('Availability check error:', error);
        return {
          available: false,
          message: 'Failed to check availability',
          details: error.message,
        };
      }

      if (!data || data.available_count < item.quantity) {
        return {
          available: false,
          message: `Insufficient tents available for ${item.tentTypeSlug}`,
          details: {
            tentType: item.tentTypeSlug,
            requested: item.quantity,
            available: data?.available_count || 0,
          },
        };
      }
    }

    return { available: true };
  } catch (error: any) {
    console.error('Unexpected error in validateAvailability:', error);
    return {
      available: false,
      message: 'An unexpected error occurred while checking availability',
      details: error.message,
    };
  }
}

/**
 * Calculate total amount for a booking
 * Now uses date-specific pricing for accurate calculations
 */
export async function calculateTotalAmount(
  tentItems: TentItem[],
  checkIn: string,
  checkOut: string,
  addOns?: Array<{ quantity: number; price: number }>
): Promise<number> {
  // Calculate tent items total with date-specific pricing
  let tentTotal = 0;
  
  for (const item of tentItems) {
    // Get tent type ID from slug (you'll need to query this)
    const supabase = await createClient();
    const { data: tentType } = await supabase
      .from('tent_types')
      .select('id')
      .eq('slug', item.tentTypeSlug)
      .single();
    
    if (tentType) {
      const itemTotal = await pricingRepository.calculateTotalForRange(
        tentType.id,
        checkIn,
        checkOut,
        item.quantity
      );
      
      if (itemTotal !== null) {
        tentTotal += itemTotal;
      } else {
        // Fallback to base price calculation
        const nights = calculateNights(checkIn, checkOut);
        tentTotal += item.pricePerNight * item.quantity * nights;
      }
    }
  }
  
  // Calculate add-ons total
  const addOnsTotal = addOns?.reduce((sum, addon) => {
    return sum + (addon.quantity * addon.price);
  }, 0) || 0;
  
  return tentTotal + addOnsTotal;
}

/**
 * Get pricing breakdown for booking with date-specific prices
 */
export async function getBookingPricingBreakdown(
  tentItems: TentItem[],
  checkIn: string,
  checkOut: string
): Promise<{
  tentItems: Array<{
    tentTypeSlug: string;
    quantity: number;
    dailyPrices: Array<{ date: string; price: number; isCustomPrice: boolean }>;
    subtotal: number;
  }>;
  totalTentCost: number;
  nights: number;
}> {
  const supabase = await createClient();
  const nights = calculateNights(checkIn, checkOut);
  const breakdown: any[] = [];
  let totalTentCost = 0;

  for (const item of tentItems) {
    // Get tent type ID from slug
    const { data: tentType } = await supabase
      .from('tent_types')
      .select('id')
      .eq('slug', item.tentTypeSlug)
      .single();

    if (tentType) {
      const dailyPrices = await pricingRepository.getPricesForRange(
        tentType.id,
        checkIn,
        checkOut
      );

      const subtotal = dailyPrices.reduce((sum: number, dp: any) => sum + dp.price, 0) * item.quantity;
      totalTentCost += subtotal;

      breakdown.push({
        tentTypeSlug: item.tentTypeSlug,
        quantity: item.quantity,
        dailyPrices,
        subtotal,
      });
    }
  }

  return {
    tentItems: breakdown,
    totalTentCost,
    nights,
  };
}

/**
 * Create a new booking with payment verification and atomic transaction
 * Supports multiple tent types in a single booking
 * 
 * This function performs the following operations atomically:
 * 1. Verify Razorpay payment signature
 * 2. Validate tent capacity matches guest count
 * 3. Check availability for all tent types
 * 4. Call stored procedure to create booking with multiple tent assignments
 * 5. Fetch complete booking details
 * 
 * All database operations are wrapped in a PostgreSQL transaction.
 * If any step fails, the entire transaction is rolled back.
 */
export async function createBookingWithPayment(
  input: CreateBookingInput
): Promise<BookingResult> {
  const supabase = await createClient();

  try {
    // Step 1: Verify Razorpay payment signature
    console.log('Step 1: Verifying payment signature...');
    const isPaymentValid = verifyPaymentSignature(
      { razorpay_order_id: input.razorpayOrderId,
      razorpay_payment_id: input.razorpayPaymentId,
      razorpay_signature:  input.razorpaySignature}
    );

    if (!isPaymentValid) {
      return {
        success: false,
        error: 'Payment verification failed',
        details: 'Invalid payment signature. Payment may be fraudulent.',
      };
    }

    console.log('Payment signature verified successfully');

    // Step 2: Validate tent capacity matches guest count
    console.log('Step 2: Validating tent capacity...');
    const capacityValidation = validateTentCapacity(
      input.tentItems,
      input.adults,
      input.children
    );

    if (!capacityValidation.valid) {
      return {
        success: false,
        error: 'Capacity validation failed',
        details: capacityValidation.message,
      };
    }

    // Step 3: Pre-validate availability (optional but recommended)
    console.log('Step 3: Pre-validating availability...');
    const availabilityCheck = await validateAvailability(
      input.tentItems,
      input.checkIn,
      input.checkOut
    );

    if (!availabilityCheck.available) {
      return {
        success: false,
        error: 'Insufficient tents available',
        details: availabilityCheck.message,
      };
    }

    // Step 4: Create booking with atomic transaction
    console.log('Step 4: Creating booking with atomic transaction...');

    const bookingNumber = generateBookingNumber();

    // Convert tent items to JSONB format for PostgreSQL
    const tentItemsJson = input.tentItems.map(item => ({
      tentTypeSlug: item.tentTypeSlug,
      quantity: item.quantity,
      pricePerNight: item.pricePerNight,
    }));

    // Call the stored procedure that handles the entire booking creation atomically
    const { data: bookingData, error: bookingError } = await supabase.rpc(
      'create_booking_with_payment',
      {
        p_booking_number: bookingNumber,
        p_customer_name: input.customerName,
        p_customer_email: input.customerEmail,
        p_customer_phone: input.customerPhone,
        p_check_in: input.checkIn,
        p_check_out: input.checkOut,
        p_tent_items: tentItemsJson,
        p_adults: input.adults,
        p_children: input.children,
        p_total_amount: input.totalAmount,
        p_special_requests: input.specialRequests || null,
        p_razorpay_order_id: input.razorpayOrderId,
        p_razorpay_payment_id: input.razorpayPaymentId,
        p_razorpay_signature: input.razorpaySignature,
      }
    );

    if (bookingError) {
      console.error('Booking creation error:', bookingError);
      
      // Parse error message for specific issues
      if (bookingError.message.includes('insufficient_tents')) {
        return {
          success: false,
          error: 'Insufficient tents available',
          details: bookingError.message,
        };
      }

      if (bookingError.message.includes('duplicate_payment')) {
        return {
          success: false,
          error: 'Duplicate payment',
          details: 'This payment has already been processed.',
        };
      }

      if (bookingError.message.includes('invalid_tent_type')) {
        return {
          success: false,
          error: 'Invalid tent type',
          details: bookingError.message,
        };
      }

      return {
        success: false,
        error: 'Booking creation failed',
        details: bookingError.message,
      };
    }

    if (!bookingData) {
      return {
        success: false,
        error: 'Booking creation failed',
        details: 'No data returned from booking creation.',
      };
    }

    console.log('Booking created successfully:', bookingData.booking_id);

    // Step 5: Fetch complete booking details with assigned tents
    const { data: completeBooking, error: fetchError } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_number,
        customer_name,
        customer_email,
        customer_phone,
        check_in,
        check_out,
        adults,
        children,
        total_amount,
        booking_status,
        payment_status,
        created_at,
        booking_tents!inner(
          tent_id,
          price_per_night,
          nights,
          subtotal,
          tents!inner(
            tent_number,
            tent_types!inner(
              name,
              slug
            )
          )
        ),
        payments!inner(
          razorpay_order_id,
          razorpay_payment_id,
          amount,
          status
        )
      `)
      .eq('id', bookingData.booking_id)
      .single();

    if (fetchError || !completeBooking) {
      console.error('Error fetching complete booking:', fetchError);
      // Booking was created but we couldn't fetch details
      return {
        success: true,
        data: {
          id: bookingData.booking_id,
          bookingNumber: bookingNumber,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          checkIn: input.checkIn,
          checkOut: input.checkOut,
          nights: bookingData.nights,
          adults: input.adults,
          children: input.children,
          totalAmount: input.totalAmount,
          bookingStatus: 'confirmed',
          paymentStatus: 'paid',
          tentTypes: [],
          assignedTents: [],
          paymentDetails: {
            razorpayOrderId: input.razorpayOrderId,
            razorpayPaymentId: input.razorpayPaymentId,
            amount: input.totalAmount,
            status: 'paid',
          },
          createdAt: new Date().toISOString(),
        },
      };
    }

    // Step 6: Format response with tent type summaries
    const assignedTents: AssignedTent[] = completeBooking.booking_tents.map((bt: any) => ({
      tentId: bt.tent_id,
      tentNumber: bt.tents.tent_number,
      tentTypeSlug: bt.tents.tent_types.slug,
      tentTypeName: bt.tents.tent_types.name,
      pricePerNight: bt.price_per_night,
      nights: bt.nights,
      subtotal: bt.subtotal,
    }));

    // Group tents by type for summary
    const tentTypesMap = new Map<string, TentTypeSummary>();
    
    assignedTents.forEach(tent => {
      const existing = tentTypesMap.get(tent.tentTypeSlug);
      
      if (existing) {
        existing.quantity += 1;
        existing.subtotal += tent.subtotal;
        existing.assignedTents.push({
          tentId: tent.tentId,
          tentNumber: tent.tentNumber,
        });
      } else {
        tentTypesMap.set(tent.tentTypeSlug, {
          tentTypeSlug: tent.tentTypeSlug,
          tentTypeName: tent.tentTypeName,
          quantity: 1,
          pricePerNight: tent.pricePerNight,
          nights: tent.nights,
          subtotal: tent.subtotal,
          assignedTents: [{
            tentId: tent.tentId,
            tentNumber: tent.tentNumber,
          }],
        });
      }
    });

    const tentTypes = Array.from(tentTypesMap.values());

    const response: BookingResponse = {
      id: completeBooking.id,
      bookingNumber: completeBooking.booking_number,
      customerName: completeBooking.customer_name,
      customerEmail: completeBooking.customer_email,
      customerPhone: completeBooking.customer_phone,
      checkIn: completeBooking.check_in,
      checkOut: completeBooking.check_out,
      nights: completeBooking.booking_tents[0]?.nights || 0,
      adults: completeBooking.adults,
      children: completeBooking.children,
      totalAmount: completeBooking.total_amount,
      bookingStatus: completeBooking.booking_status,
      paymentStatus: completeBooking.payment_status,
      tentTypes,
      assignedTents,
      paymentDetails: {
        razorpayOrderId: completeBooking.payments[0].razorpay_order_id,
        razorpayPaymentId: completeBooking.payments[0].razorpay_payment_id,
        amount: completeBooking.payments[0].amount,
        status: completeBooking.payments[0].status,
      },
      createdAt: completeBooking.created_at,
    };

    console.log('Booking completed successfully with multiple tent types');

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error('Unexpected error in createBookingWithPayment:', error);
    
    return {
      success: false,
      error: 'Internal server error',
      details: error.message || 'An unexpected error occurred while creating the booking.',
    };
  }
}

/**
 * Get booking by ID
 */
export async function getBookingById(bookingId: string): Promise<BookingResult> {
  const supabase = await createClient();

  try {
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_number,
        customer_name,
        customer_email,
        customer_phone,
        check_in,
        check_out,
        adults,
        children,
        total_amount,
        booking_status,
        payment_status,
        created_at,
        booking_tents!inner(
          tent_id,
          price_per_night,
          nights,
          subtotal,
          tents!inner(
            tent_number,
            tent_types!inner(
              name,
              slug
            )
          )
        ),
        payments!inner(
          razorpay_order_id,
          razorpay_payment_id,
          amount,
          status
        )
      `)
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      return {
        success: false,
        error: 'Booking not found',
        details: error?.message || 'No booking found with the provided ID.',
      };
    }

    // Format response (same as in createBookingWithPayment)
    const assignedTents: AssignedTent[] = booking.booking_tents.map((bt: any) => ({
      tentId: bt.tent_id,
      tentNumber: bt.tents.tent_number,
      tentTypeSlug: bt.tents.tent_types.slug,
      tentTypeName: bt.tents.tent_types.name,
      pricePerNight: bt.price_per_night,
      nights: bt.nights,
      subtotal: bt.subtotal,
    }));

    const tentTypesMap = new Map<string, TentTypeSummary>();
    
    assignedTents.forEach(tent => {
      const existing = tentTypesMap.get(tent.tentTypeSlug);
      
      if (existing) {
        existing.quantity += 1;
        existing.subtotal += tent.subtotal;
        existing.assignedTents.push({
          tentId: tent.tentId,
          tentNumber: tent.tentNumber,
        });
      } else {
        tentTypesMap.set(tent.tentTypeSlug, {
          tentTypeSlug: tent.tentTypeSlug,
          tentTypeName: tent.tentTypeName,
          quantity: 1,
          pricePerNight: tent.pricePerNight,
          nights: tent.nights,
          subtotal: tent.subtotal,
          assignedTents: [{
            tentId: tent.tentId,
            tentNumber: tent.tentNumber,
          }],
        });
      }
    });

    const tentTypes = Array.from(tentTypesMap.values());

    const response: BookingResponse = {
      id: booking.id,
      bookingNumber: booking.booking_number,
      customerName: booking.customer_name,
      customerEmail: booking.customer_email,
      customerPhone: booking.customer_phone,
      checkIn: booking.check_in,
      checkOut: booking.check_out,
      nights: booking.booking_tents[0]?.nights || 0,
      adults: booking.adults,
      children: booking.children,
      totalAmount: booking.total_amount,
      bookingStatus: booking.booking_status,
      paymentStatus: booking.payment_status,
      tentTypes,
      assignedTents,
      paymentDetails: {
        razorpayOrderId: booking.payments[0].razorpay_order_id,
        razorpayPaymentId: booking.payments[0].razorpay_payment_id,
        amount: booking.payments[0].amount,
        status: booking.payments[0].status,
      },
      createdAt: booking.created_at,
    };

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error('Error fetching booking:', error);
    
    return {
      success: false,
      error: 'Internal server error',
      details: error.message || 'An unexpected error occurred while fetching the booking.',
    };
  }
}

/**
 * Get booking by booking number
 */
export async function getBookingByNumber(bookingNumber: string): Promise<BookingResult> {
  const supabase = await createClient();

  try {
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_number,
        customer_name,
        customer_email,
        customer_phone,
        check_in,
        check_out,
        adults,
        children,
        total_amount,
        booking_status,
        payment_status,
        created_at,
        booking_tents!inner(
          tent_id,
          price_per_night,
          nights,
          subtotal,
          tents!inner(
            tent_number,
            tent_types!inner(
              name,
              slug
            )
          )
        ),
        payments!inner(
          razorpay_order_id,
          razorpay_payment_id,
          amount,
          status
        )
      `)
      .eq('booking_number', bookingNumber)
      .single();

    if (error || !booking) {
      return {
        success: false,
        error: 'Booking not found',
        details: error?.message || 'No booking found with the provided booking number.',
      };
    }

    // Format response (same as above)
    const assignedTents: AssignedTent[] = booking.booking_tents.map((bt: any) => ({
      tentId: bt.tent_id,
      tentNumber: bt.tents.tent_number,
      tentTypeSlug: bt.tents.tent_types.slug,
      tentTypeName: bt.tents.tent_types.name,
      pricePerNight: bt.price_per_night,
      nights: bt.nights,
      subtotal: bt.subtotal,
    }));

    const tentTypesMap = new Map<string, TentTypeSummary>();
    
    assignedTents.forEach(tent => {
      const existing = tentTypesMap.get(tent.tentTypeSlug);
      
      if (existing) {
        existing.quantity += 1;
        existing.subtotal += tent.subtotal;
        existing.assignedTents.push({
          tentId: tent.tentId,
          tentNumber: tent.tentNumber,
        });
      } else {
        tentTypesMap.set(tent.tentTypeSlug, {
          tentTypeSlug: tent.tentTypeSlug,
          tentTypeName: tent.tentTypeName,
          quantity: 1,
          pricePerNight: tent.pricePerNight,
          nights: tent.nights,
          subtotal: tent.subtotal,
          assignedTents: [{
            tentId: tent.tentId,
            tentNumber: tent.tentNumber,
          }],
        });
      }
    });

    const tentTypes = Array.from(tentTypesMap.values());

    const response: BookingResponse = {
      id: booking.id,
      bookingNumber: booking.booking_number,
      customerName: booking.customer_name,
      customerEmail: booking.customer_email,
      customerPhone: booking.customer_phone,
      checkIn: booking.check_in,
      checkOut: booking.check_out,
      nights: booking.booking_tents[0]?.nights || 0,
      adults: booking.adults,
      children: booking.children,
      totalAmount: booking.total_amount,
      bookingStatus: booking.booking_status,
      paymentStatus: booking.payment_status,
      tentTypes,
      assignedTents,
      paymentDetails: {
        razorpayOrderId: booking.payments[0].razorpay_order_id,
        razorpayPaymentId: booking.payments[0].razorpay_payment_id,
        amount: booking.payments[0].amount,
        status: booking.payments[0].status,
      },
      createdAt: booking.created_at,
    };

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error('Error fetching booking:', error);
    
    return {
      success: false,
      error: 'Internal server error',
      details: error.message || 'An unexpected error occurred while fetching the booking.',
    };
  }
}

// Made with Bob
