import { ImageGrid } from '@/src/components/gallery/image-grid';
import { galleryImages } from '@/src/data/gallery-images';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gallery | Wild Earth Jungle Camp',
  description: 'Explore our beautiful campsite through photos',
};

export default function GalleryPage() {
  return (
    <div className="min-h-screen">
      <section className="pt-28 pb-20 bg-primary text-white">
        <div className="container text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">Gallery</h1>
          <p className="font-sans text-xl max-w-2xl mx-auto">
            Explore the beauty of Wild Earth Jungle Camp
          </p>
        </div>
      </section>

       <section className="py-20">
              <div className="container">
                <ImageGrid images={galleryImages} />
              </div>
            </section>
    </div>
  );
}

// Made with Bob
