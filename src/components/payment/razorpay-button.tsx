'use client';

import { useState } from 'react';
import Script from 'next/script';
import { Button } from '../../components/ui/button';
import { useToast } from '../../hooks/use-toast';

interface RazorpayButtonProps {
  amount: number;
  bookingDetails: {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  onSuccess?: (
    paymentId: string,
    orderId: string,
    signature: string
  ) => void;
  onError?: (error: any) => void;
  disabled?: boolean;
  className?: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function RazorpayButton({
  amount,
  bookingDetails,
  onSuccess,
  onError,
  disabled = false,
  className = '',
}: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { toast } = useToast();

  /**
   * Step 1: Create Razorpay order
   */
  const createOrder = async () => {
    const response = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt: `booking_${bookingDetails.id}`,
        notes: {
          bookingId: bookingDetails.id,
          customerEmail: bookingDetails.customerEmail,
          customerName: bookingDetails.customerName,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create order');
    }

    const result = await response.json();
    return result.data;
  };

  /**
   * Step 2: Verify payment signature
   */
  const verifyPayment = async (response: RazorpayResponse) => {
    const verifyResponse = await fetch('/api/payment/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      }),
    });

    if (!verifyResponse.ok) {
      const error = await verifyResponse.json();
      throw new Error(error.message || 'Payment verification failed');
    }

    const result = await verifyResponse.json();
    return result.data;
  };

  /**
   * Step 3: Handle payment success
   */
  const handlePaymentSuccess = async (response: RazorpayResponse) => {
    try {
      // Verify payment on backend
      const verificationResult = await verifyPayment(response);

      if (verificationResult.verified) {
        toast({
          title: 'Payment Successful',
          description: 'Your payment has been verified successfully.',
        });

        // Call success callback (signature is needed to persist the booking)
        if (onSuccess) {
          onSuccess(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature
          );
        }
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      toast({
        title: 'Verification Failed',
        description: error.message || 'Failed to verify payment',
        variant: 'destructive',
      });

      if (onError) {
        onError(error);
      }
    }
  };

  /**
   * Step 4: Initialize Razorpay checkout
   */
  const initializeRazorpay = (orderData: any) => {
    const options: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Wild Earth Jungle Camp',
      description: 'Campsite Booking Payment',
      order_id: orderData.orderId,
      handler: handlePaymentSuccess,
      prefill: {
        name: bookingDetails.customerName,
        email: bookingDetails.customerEmail,
        contact: bookingDetails.customerPhone,
      },
      theme: {
        color: '#10b981', // Green color
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
          toast({
            title: 'Payment Cancelled',
            description: 'You cancelled the payment process.',
          });
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  /**
   * Main payment handler
   */
  const handlePayment = async () => {
    if (!scriptLoaded) {
      toast({
        title: 'Loading',
        description: 'Payment gateway is loading. Please wait...',
      });
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create order
      const orderData = await createOrder();

      // Step 2: Open Razorpay checkout
      initializeRazorpay(orderData);
    } catch (error: any) {
      console.error('Payment error:', error);
      setLoading(false);

      toast({
        title: 'Payment Failed',
        description: error.message || 'Failed to initiate payment',
        variant: 'destructive',
      });

      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <>
      {/* Load Razorpay script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptLoaded(true)}
        onError={() => {
          toast({
            title: 'Error',
            description: 'Failed to load payment gateway',
            variant: 'destructive',
          });
        }}
      />

      {/* Payment button */}
      <Button
        onClick={handlePayment}
        disabled={disabled || loading || !scriptLoaded}
        className={className}
        size="lg"
      >
        {loading ? (
          <>
            <span className="mr-2">Processing...</span>
            <span className="animate-spin">⏳</span>
          </>
        ) : (
          `Pay ₹${amount.toLocaleString('en-IN')}`
        )}
      </Button>
    </>
  );
}

// Made with Bob
