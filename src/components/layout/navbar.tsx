'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Leaf } from 'lucide-react';
import logo from '../../../public/logo.png'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[#ded9d3] backdrop-blur-md fixed w-full z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <div className='h-20 w-28 bg-[#173746]'>
          <Link href="/" className="flex justify-center items-center space-x-2">
          <img src={logo.src} className="h-20 w-24 " alt="Wild Earth Jungle Camp" />


            {/* <Leaf className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">Wild Earth</span> */}
          </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-text hover:text-primary transition-colors">
              Home
            </Link>
            <Link href={`https://wa.me/+917204520500?text=${encodeURIComponent('Hi I am interested in your stay.')}`} className="text-text hover:text-primary transition-colors">
              Book Now
            </Link>
            <Link href="/gallery" className="text-text hover:text-primary transition-colors">
              Gallery
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="h-6 w-6 text-primary" />
            ) : (
              <Menu className="h-6 w-6 text-primary" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-6">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-text hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
               href={`https://wa.me/+919845866505?text=${encodeURIComponent('Hi I am interested in your stay.')}`}
                target='_blank' className="text-text z-20 hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Book Now
              </Link>
              <Link
                href="/gallery"
                className="text-text hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Gallery
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
