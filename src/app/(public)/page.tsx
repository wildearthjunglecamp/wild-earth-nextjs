import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { 
  Fish, 
  Fence, 
  HandPlatter, 
  TowerControl, 
  Tent, 
  PawPrint, 
  ShowerHead, 
  FlameKindling, 
  Sailboat, 
  LandPlot, 
  Camera, 
  Waves, 
  Binoculars, 
  Bike, 
  Footprints, 
  FishSymbol,
  Utensils,
  MapPin,
  Phone,
  Mail,
  Star,
  Check,
  Users,
  Award,
  Heart,
  Shield
} from 'lucide-react';

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
    description: 'Bring Your Furry Friends - We\'re a Pet-Loving Camp!',
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
  },
  {
    icon: FishSymbol,
    title: 'Fish Pedicure',
    description: 'Relax as Tiny Fish Rejuvenate Your Feet Naturally.',
  }
];

const tentTypes = [
  {
    name: 'Twin Sharing Small Tent',
    capacity: 2,
    price: 3999,
    features: ['Cozy Interior', 'Premium Bedding', 'Private Space'],
    image: '/img1.jpeg',
  },
  {
    name: 'Twin Sharing Semi Big Tent',
    capacity: 2,
    price: 4999,
    features: ['Spacious Layout', 'Luxury Amenities', 'Scenic Views'],
    image: '/img2.jpeg',
  },
  {
    name: 'Three Sharing Jungle Tent',
    capacity: 3,
    price: 7499,
    features: ['Family Friendly', 'Extra Space', 'Nature Immersion'],
    image: '/img3.jpeg',
  },
  {
    name: 'Four Sharing Jungle Tent',
    capacity: 4,
    price: 7999,
    features: ['Group Accommodation', 'Premium Comfort', 'Adventure Ready'],
    image: '/img4.jpeg',
  },
];

const whyChooseUs = [
  {
    icon: Shield,
    title: 'Safe & Secure',
    description: 'Fully fenced property with 24/7 security for your peace of mind',
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'High-quality tents and facilities that exceed expectations',
  },
  {
    icon: Users,
    title: 'Expert Staff',
    description: 'Experienced team dedicated to making your stay memorable',
  },
  {
    icon: Heart,
    title: 'Nature Connection',
    description: 'Immerse yourself in pristine wilderness while enjoying modern comforts',
  },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'An absolutely magical experience! The tents were luxurious, the food was incredible, and the staff went above and beyond. Perfect blend of adventure and comfort.',
    image: '/img5.jpeg',
  },
  {
    name: 'Rajesh Kumar',
    location: 'Bangalore',
    rating: 5,
    text: 'Best camping experience ever! The location is stunning, activities are well-organized, and the bonfire nights were unforgettable. Highly recommended for families.',
    image: '/img6.jpeg',
  },
  {
    name: 'Anita Desai',
    location: 'Delhi',
    rating: 5,
    text: 'Wild Earth exceeded all expectations. From the premium bathrooms to the gourmet meals, every detail was perfect. Can\'t wait to return!',
    image: '/img7.jpeg',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/heroBg.jpeg"
            alt="Wild Earth Campsite"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container text-center text-white px-4">
          <Badge className="mb-6 bg-primary-600/90 text-white border-0 px-4 py-2 text-sm font-medium">
            Premium Wilderness Retreat
          </Badge>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            Experience the
            <span className="block text-primary-300">Unexplored</span>
          </h1>
          <p className="font-body text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-gray-200">
            Discover the perfect balance of rugged adventure and uncompromising comfort in our premium wilderness retreat.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/availability">
              <Button size="lg" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-6 text-lg font-semibold shadow-xl">
                Check Availability
              </Button>
            </Link>
            <Link href="#tents">
              <Button size="lg" variant="outline" className="border-2 border-white text-primary-600 hover:bg-white hover:text-primary-900 px-8 py-6 text-lg font-semibold">
                View Tents
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-20 bg-surface-50">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-display font-bold text-primary-900 mb-2">15+</div>
              <p className="font-body text-secondary-600">Premium Tents</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-display font-bold text-primary-900 mb-2">9+</div>
              <p className="font-body text-secondary-600">Activities</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-display font-bold text-primary-900 mb-2">24/7</div>
              <p className="font-body text-secondary-600">Support</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-display font-bold text-primary-900 mb-2">100%</div>
              <p className="font-body text-secondary-600">Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tent Types Section */}
      <section id="tents" className="py-20 bg-white">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-900 mb-4">
              Our Tent Collection
            </h2>
            <p className="font-body text-xl text-secondary-600 max-w-2xl mx-auto">
              Choose from our range of premium tents, each designed to provide comfort and connection with nature
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {tentTypes.map((tent, index) => (
              <Card key={index} className="border-surface-200 shadow-level-2 hover:shadow-level-3 transition-all duration-300 overflow-hidden group">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={tent.image}
                    alt={tent.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary-600 text-white border-0">
                      {tent.capacity} Guests
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-display text-xl font-bold text-primary-900 mb-2">
                    {tent.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="font-display text-3xl font-bold text-primary-600">₹{tent.price}</span>
                    <span className="font-body text-sm text-secondary-600">per night</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {tent.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 font-body text-sm text-secondary-700">
                        <Check className="h-4 w-4 text-primary-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/availability">
                    <Button className="w-full bg-primary-600 text-white hover:bg-primary-700">
                      Book Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/gallery">
              <Button size="lg" variant="outline" className="border-primary-600 text-primary-600 hover:bg-primary-50">
                View Full Gallery
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-20 bg-surface-50">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-900 mb-4">
              Premium Amenities
            </h2>
            <p className="font-body text-xl text-secondary-600 max-w-2xl mx-auto">
              Experience comfort in the wilderness with our carefully curated amenities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {amenities.map((amenity, index) => {
              const Icon = amenity.icon;
              return (
                <Card key={index} className="border-surface-200 shadow-level-1 hover:shadow-level-2 transition-all duration-300 group">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-primary-900 mb-2">
                      {amenity.title}
                    </h3>
                    <p className="font-body text-sm text-secondary-600">
                      {amenity.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-900 mb-4">
              Adventure Awaits
            </h2>
            <p className="font-body text-xl text-secondary-600 max-w-2xl mx-auto">
              Dive into nature, play, and explore with our exciting range of activities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <Card key={index} className="border-surface-200 shadow-level-1 hover:shadow-level-2 transition-all duration-300 group">
                  <CardContent className="p-6 flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-tertiary-100 text-tertiary-700 group-hover:bg-tertiary-700 group-hover:text-white transition-colors duration-300">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-primary-900 mb-1">
                        {activity.title}
                      </h3>
                      <p className="font-body text-sm text-secondary-600">
                        {activity.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-primary-900 text-white">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Why Choose Wild Earth
            </h2>
            <p className="font-body text-xl text-primary-200 max-w-2xl mx-auto">
              We're committed to providing an exceptional wilderness experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-800 text-primary-300 mb-6">
                    <Icon className="h-10 w-10" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-3">
                    {item.title}
                  </h3>
                  <p className="font-body text-primary-200">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-surface-50">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-900 mb-4">
              Guest Experiences
            </h2>
            <p className="font-body text-xl text-secondary-600 max-w-2xl mx-auto">
              Hear what our guests have to say about their Wild Earth adventure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-surface-200 shadow-level-2">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="font-body text-secondary-700 mb-6 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-display font-bold text-primary-900">
                        {testimonial.name}
                      </div>
                      <div className="font-body text-sm text-secondary-600">
                        {testimonial.location}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Map Location Section */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-900 mb-6">
                Find Us in Paradise
              </h2>
              <p className="font-body text-lg text-secondary-700 mb-6">
                Nestled in the heart of pristine wilderness, Wild Earth Jungle Camp offers an unparalleled blend of luxury and nature. Our eco-friendly resort provides an intimate connection with the wild while ensuring world-class comfort and service.
              </p>
              <p className="font-body text-lg text-secondary-700 mb-8">
                Whether you're looking for a peaceful retreat or an adventure-filled vacation, our campsite has something for everyone. We can't wait to have you join us and experience all that the wilderness has to offer.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-display font-semibold text-primary-900 mb-1">Location</div>
                    <div className="font-body text-secondary-700">Forest Ridge, Wilderness Valley, Maharashtra 412345</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-display font-semibold text-primary-900 mb-1">Phone</div>
                    <div className="font-body text-secondary-700">+91 98765 43210</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-display font-semibold text-primary-900 mb-1">Email</div>
                    <div className="font-body text-secondary-700">info@wildearth.com</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-level-2">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d486.9952042559709!2d76.531856!3d12.452276!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3baf7f44a2414d33%3A0x8570e5b538e44c12!2sWild%20Earth%20Jungle%20Camp!5e0!3m2!1sen!2sus!4v1742757630526!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <div className="container px-4 text-center relative z-10">
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-6">
            Ready for an Adventure?
          </h2>
          <p className="font-body text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-primary-100">
            Book your stay now and experience the perfect blend of luxury and nature. Your wilderness adventure awaits!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/availability">
              <Button size="lg" className="bg-white text-primary-900 hover:bg-primary-50 px-10 py-6 text-lg font-semibold shadow-xl">
                Check Availability
              </Button>
            </Link>
            <Link href="tel:+919876543210">
              <Button size="lg" variant="outline" className="border-2 border-white text-primary-900 hover:bg-white hover:text-primary-900 px-10 py-6 text-lg font-semibold">
                Call Us Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Made with Bob