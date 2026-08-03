"use client";

import React from 'react';
import Link from 'next/link';

interface SocialFloatingButtonsProps {
  whatsappNumber?: string;
  instagramUsername?: string;
  whatsappMessage?: string;
}

const SocialFloatingButtons: React.FC<SocialFloatingButtonsProps> = ({
  whatsappNumber = "+919845866505", // Replace with your actual WhatsApp number
  instagramUsername = "wildearthjunglecamp", // Replace with your Instagram username
  whatsappMessage = "Hi I'm interested in your stay."
}) => {
  // Encode the WhatsApp message for URL
  const encodedMessage = encodeURIComponent(whatsappMessage);
  
  // Generate the WhatsApp link - works for both mobile and desktop
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
  
  // Generate the Instagram link
  const instagramLink = `https://instagram.com/${instagramUsername}`;

  return (
    <>
      {/* WhatsApp Button */}
      <Link 
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 left-8 z-50 flex items-center justify-center p-3 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400"
        aria-label="Chat with us on WhatsApp"
      >
        
        <svg _ngcontent-aiw-c32="" xmlns="http://www.w3.org/2000/svg" aria-label="WhatsApp" role="img" viewBox="0 0 512 512"  className="w-6 h-6"><rect _ngcontent-aiw-c32="" width="512" height="512" rx="15%" fill="#25d366"></rect><path _ngcontent-aiw-c32="" fill="#25d366" stroke="#fff" strokeWidth="26" d="M123 393l14-65a138 138 0 1150 47z"></path><path  fill="#fff" d="M308 273c-3-2-6-3-9 1l-12 16c-3 2-5 3-9 1-15-8-36-17-54-47-1-4 1-6 3-8l9-14c2-2 1-4 0-6l-12-29c-3-8-6-7-9-7h-8c-2 0-6 1-10 5-22 22-13 53 3 73 3 4 23 40 66 59 32 14 39 12 48 10 11-1 22-10 27-19 1-3 6-16 2-18"></path></svg>
      </Link>

      {/* Instagram Button */}
      <Link 
        href={instagramLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 flex items-center justify-center p-3 bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-500 text-white rounded-full shadow-lg hover:from-yellow-600 hover:via-pink-600 hover:to-purple-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
        aria-label="Follow us on Instagram"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-6 h-6"
        >
          <path 
            d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
          />
        </svg>
      </Link>
    </>
  );
};

export default SocialFloatingButtons;
