'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import logo from '../../../public/logo.png';

const WA_LINK = `https://wa.me/+919845866505?text=${encodeURIComponent('Hi I am interested in your stay.')}`;

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Book Now', href: WA_LINK, external: true },
  { label: 'Gallery', href: '/gallery' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#ded9d3]/95 backdrop-blur-md shadow-level-1'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <div className="h-16 w-24 bg-[#173746] flex items-center justify-center overflow-hidden">
                <img src={logo.src} className="h-16 w-20 object-contain" alt="Wild Earth Jungle Camp" />
              </div>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center space-x-8">
              {NAV_LINKS.map(({ label, href, external }) => (
                <Link
                  key={label}
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  className={`font-sans font-medium text-sm tracking-wide transition-colors duration-200 ${
                    scrolled
                      ? 'text-on-surface hover:text-primary'
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-md"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu
                className={`h-6 w-6 ${scrolled ? 'text-on-surface' : 'text-white'}`}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Drawer backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-[60] md:hidden transition-opacity duration-300 ${
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-in drawer (right) */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-surface-container-lowest z-[70] md:hidden flex flex-col shadow-level-2 transition-transform duration-300 ease-in-out ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant">
          <div className="flex items-center gap-3">
            <div className="h-10 w-14 bg-[#173746] flex items-center justify-center overflow-hidden">
              <img src={logo.src} className="h-10 w-12 object-contain" alt="Wild Earth" />
            </div>
            <span className="font-display text-base font-bold text-on-surface">Wild Earth</span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-md hover:bg-surface-container transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-on-surface" />
          </button>
        </div>

        {/* Drawer links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAV_LINKS.map(({ label, href, external }) => (
            <Link
              key={label}
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              onClick={() => setDrawerOpen(false)}
              className="flex items-center px-4 py-3 rounded-lg font-sans font-medium text-on-surface hover:bg-surface-container hover:text-primary transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Drawer footer */}
        <div className="px-6 py-4 border-t border-outline-variant">
          <p className="text-xs font-sans text-on-surface-variant">
            Wild Earth Jungle Camp
          </p>
        </div>
      </div>
    </>
  );
}
