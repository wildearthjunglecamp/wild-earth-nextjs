import { Leaf, Phone, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';
import logo from '../../../public/logo.png'


export function Footer() {
  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 justify-center gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-6">
            <img src={logo.src} className="h-20 w-24 " alt="Wild Earth Jungle Camp" />
            </div>
            <p className="text-white/80">
              Experience luxury in the heart of nature. Discover the perfect blend of comfort and wilderness.
            </p>
          </div>

          <div className='flex flex-col items-center'>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-white/80 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/booking" className="text-white/80 hover:text-white transition-colors">
                  Book Now
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-white/80 hover:text-white transition-colors">
                  Gallery
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>+91 7204520500</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>wildearthjunglecamp@gmail.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <Link href="https://maps.app.goo.gl/i5S2cTL43ZCZU4sA9" target='_blank'>Antanahalli village, road, Bannangadi, Karnataka 571401, India</Link>
              </li>
            </ul>
          </div>

          {/* <div>
            <h3 className="text-lg font-bold mb-4">Newsletter</h3>
            <p className="text-white/80 mb-4">
              Subscribe to our newsletter for updates and special offers.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 rounded-l-md w-full focus:outline-none text-text"
              />
              <button
                type="submit"
                className="bg-accent hover:bg-accent/90 px-4 py-2 rounded-r-md transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div> */}
        </div>

        <div className="border-t border-white/20 mt-12 pt-8 text-center text-white/60">
          <p>&copy; {new Date().getFullYear()} Wild Earth Jungle Camp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
