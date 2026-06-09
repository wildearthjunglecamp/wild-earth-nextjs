import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { AmenityCard } from '../../components/home/amenity-card';
import { Leaf, Utensils, Wifi, Coffee, Fish, Fence, HandPlatter, TowerControl, Tent, PawPrint, ShowerHead, FlameKindling, Sailboat, LandPlot, Camera, Waves, Binoculars, Bike, Footprints, FishSymbol } from 'lucide-react';
import Img1 from '../../../public/landingPageimg1.webp'
const amenities = [
  {
    icon: Fence,
    title: 'Fenced Area',
    description: 'Stay Safe and Secure—Fully Fenced for Your Peace of Mind.',
  },
  {
    icon: Utensils,
    title: 'Gourmet Dining',
    description: 'Fresh, local ingredients prepared by expert chefs',
  },
  {
    icon: TowerControl,
    title: 'Watch Tower',
    description: 'Soak in Panoramic Views from Our Scenic Watch Tower',
  },
  {
    icon: HandPlatter,
    title: 'Dining Area',
    description: 'Savor Every Bite in Our Beautifully Designed Dining Space.',
  },
  {
    icon: Tent,
    title: 'High-Quality Tent',
    description: 'Experience the Outdoors in Premium, All-Weather Tents.',
  },
  {
    icon: PawPrint,
    title: 'Pet Friendly',
    description: 'Bring Your Furry Friends—We’re a Pet-Loving Camp!',
  },
  {
    icon: ShowerHead,
    title: 'Premium Bathrooms',
    description: 'Indulge in Clean, Modern, and Luxurious Restrooms.',
  },
  {
    icon: FlameKindling,
    title: 'Bonfire',
    description: 'Gather, Relax, and Make Memories Around the Bonfire.',
  },
];
const activities = [
  {
    icon: Fish,
    title: 'Fishing',
    description: 'Cast Your Line and Reel in Serenity',
  },
  {
    icon: Sailboat,
    title: 'Boating',
    description: 'Glide Across Calm Waters for the Ultimate Escape.',
  },
  {
    icon: Footprints,
    title: 'Jungle Walk',
    description: 'Trek Through Untamed Trails and Discover the Wild.',
  },
  
  {
    icon: Bike,
    title: 'Cycling',
    description: 'Pedal Through Scenic Routes and Feel the Freedom.',
  },
  {
    icon: Binoculars,
    title: 'Bird-Watching',
    description: 'Spot Rare Birds in Their Natural Habitat.',
  },
  {
    icon: Waves,
    title: 'Swimming',
    description: 'Cool Off and Refresh in Natural Waters.',
  },
  {
    icon: Camera,
    title: 'Photography',
    description: 'Capture Picture-Perfect Moments at Every Turn.',
  },
  {
    icon: LandPlot,
    title: 'Outdoor Sports',
    description: 'Get Active with Fun-Filled Games Under the Open Sky.',
  },{
    icon: FishSymbol,
    title: 'Fish Pedicure',
    description: 'Relax as Tiny Fish Rejuvenate Your Feet Naturally.',
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section h-screen flex items-center justify-center text-white">
        <div className="container text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Wild Earth Jungle Camp
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Experience luxury in the heart of nature
          </p>
          <Link href={`https://wa.me/+919845866505?text=${encodeURIComponent('Hi I am interested in your stay.')}`} >
            <Button size="lg" className="bg-primary hover:bg-primary-dark text-white">
              Book Your Stay
            </Button>
          </Link>
          <Button>
            Test api
          </Button>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title">Welcome to Paradise</h2>
              <p className="text-lg mb-6">
                Nestled in the heart of pristine wilderness, Wild Earth Jungle Camp offers an unparalleled
                blend of luxury and nature. Our jungle camp provides an intimate connection with
                the wild while ensuring world-class comfort and service.
              </p>
              <p className="text-lg mb-8">
                Whether you're seeking adventure, relaxation, or a bit of both, our experienced staff
                and modern amenities ensure an unforgettable stay.
              </p>
              <Link href="/gallery">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  Explore More
                </Button>
              </Link>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <Image
                src={Img1.src}
                alt="Luxury tent in nature"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-20 bg-muted">
        <div className="container">
          <h2 className="section-title text-center">Our Amenities</h2>
          <p className="section-subtitle text-center">
            Experience comfort in the wilderness with our premium amenities
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {amenities.map((amenity, index) => (
              <AmenityCard key={index} {...amenity} />
            ))}
          </div>
        </div>
      </section>
      {/* Activities Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <h2 className="section-title text-center">Our Activities</h2>
          <p className="section-subtitle text-center">
          Adventure Awaits: Dive Into Nature, Play, and Explore.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {activities.map((activity, index) => (
              <AmenityCard key={index} {...activity} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title">Locate us Here</h2>
              <p className="text-lg mb-6">
              Whether you're looking for a peaceful retreat or an adventure-filled vacation, our campsite has something for everyone. We can't wait to have you join us and experience all that the backwaters have to offer.
              </p>
              <p className="text-lg mb-8">
                Nestled in the heart of pristine wilderness, Wild Earth Jungle Camp offers an unparalleled
                blend of luxury and nature. Our eco-friendly resort provides an intimate connection with
                the wild while ensuring world-class comfort and service.
              </p>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden">
            <div className="rounded-2xl z-10 relative overflow-hidden card-border">
           
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d486.9952042559709!2d76.531856!3d12.452276!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3baf7f44a2414d33%3A0x8570e5b538e44c12!2sWild%20Earth%20Jungle%20Camp!5e0!3m2!1sen!2sus!4v1742757630526!5m2!1sen!2sus" 
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className='z-10 relative'
            />
          </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready for an Adventure?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Book your stay now and experience the perfect blend of luxury and nature.
          </p>
          <Link href={`https://wa.me/+919845866505?text=${encodeURIComponent('Hi I am interested in your stay.')}`}>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Book Your Stay
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}