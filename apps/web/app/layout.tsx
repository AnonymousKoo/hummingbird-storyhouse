import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import type { ReactNode } from 'react';
import { AmbientMotion } from '../components/ambient-motion';
import './globals.css';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  display: 'swap'
});

const sans = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://hummingbirdstoryhouse.com'),
  title: 'Hummingbird Storyhouse — Media + marketing built to move',
  description:
    'Hummingbird Storyhouse connects strategy, creative, production, distribution, growth marketing, and intelligence to move people and business.',
  applicationName: 'Hummingbird Storyhouse',
  keywords: ['media and marketing company', 'brand and audience strategy', 'growth marketing', 'multimedia production', 'campaign distribution'],
  authors: [{ name: 'Hummingbird Storyhouse' }],
  creator: 'Hummingbird Storyhouse',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Hummingbird Storyhouse',
    title: 'Stories don’t sit still. Neither do we.',
    description: 'Stories, campaigns, media systems, and growth loops designed to move people and business.'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stories don’t sit still. Neither do we.',
    description: 'Stories, campaigns, media systems, and growth loops designed to move people and business.'
  },
  alternates: { canonical: '/' }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#080B14',
  colorScheme: 'dark'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className={`${display.variable} ${sans.variable}`} lang="en">
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <AmbientMotion />
        {children}
      </body>
    </html>
  );
}
