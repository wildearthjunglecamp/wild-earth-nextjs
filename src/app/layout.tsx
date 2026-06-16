import './globals.css';
import type { Metadata } from 'next';
import { Manrope, Plus_Jakarta_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Wild Earth Jungle Camp',
  description: 'Experience luxury in the heart of nature',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${jakarta.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
