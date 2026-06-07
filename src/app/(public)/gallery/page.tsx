import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gallery | Wild Earth Jungle Camp',
  description: 'Explore our beautiful campsite through photos',
};

export default function GalleryPage() {
  return (
    <div className="min-h-screen pt-20">
      <section className="py-20 bg-primary text-white">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Gallery</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Explore the beauty of Wild Earth Jungle Camp
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          {/* Gallery component will be migrated here */}
          <p className="text-center text-muted-foreground">
            Gallery to be migrated from src/app/gallery/page.tsx
          </p>
        </div>
      </section>
    </div>
  );
}

// Made with Bob
