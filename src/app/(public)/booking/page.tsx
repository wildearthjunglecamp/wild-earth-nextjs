import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book Your Stay | Wild Earth Jungle Camp',
  description: 'Book your luxury camping experience',
};

export default function BookingPage() {
  return (
    <div className="min-h-screen pt-20">
      <section className="py-20 bg-primary text-white">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Book Your Stay</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Experience luxury in the wilderness with our premium accommodations
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container max-w-4xl">
          {/* Booking form component will go here */}
          <p className="text-center text-muted-foreground">
            Booking form to be migrated from src/app/booking/page.tsx
          </p>
        </div>
      </section>
    </div>
  );
}

// Made with Bob
