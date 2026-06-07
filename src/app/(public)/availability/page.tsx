import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Check Availability | Wild Earth Jungle Camp',
  description: 'Check availability for your preferred dates',
};

export default function AvailabilityPage() {
  return (
    <div className="min-h-screen pt-20">
      <section className="py-20 bg-primary text-white">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Check Availability</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Find the perfect dates for your wilderness adventure
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container max-w-4xl">
          {/* Availability search component will go here */}
          <p className="text-center text-muted-foreground">
            Availability search component to be implemented
          </p>
        </div>
      </section>
    </div>
  );
}

// Made with Bob
