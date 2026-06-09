import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import { CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Booking Confirmed | Wild Earth Jungle Camp',
  description: 'Your booking has been confirmed',
};

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen pt-20">
      <section className="py-20">
        <div className="container max-w-2xl text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Booking Confirmed!</h1>
          <p className="text-xl mb-8 text-muted-foreground">
            Thank you for choosing Wild Earth Jungle Camp. We've sent a confirmation email with all the details.
          </p>
          
          <div className="space-y-4">
            <p className="text-lg">
              Your booking reference number will be sent to your email shortly.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/">
                <Button variant="outline">Return Home</Button>
              </Link>
              <Link href="/gallery">
                <Button>View Gallery</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Made with Bob
