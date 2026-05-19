import type { Metadata, Viewport } from 'next';
import { Instrument_Serif, Manrope, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const display = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-display-loaded',
  display: 'swap'
});

const body = Manrope({
  subsets: ['latin'],
  variable: '--font-body-loaded',
  display: 'swap'
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-loaded',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'WisperTalk — Voice dictation for Windows & Mac. Pay once.',
  description:
    'A precise, fast, voice-to-text app for Windows and macOS. Hold a key, speak, release — clean text appears wherever your cursor is. Free trial, then $50 once. One device at a time.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://wispertalk.com'),
  openGraph: {
    title: 'WisperTalk — Voice dictation for Windows & Mac.',
    description: 'Hold a key, speak, release. Free trial, then $50 once. One device at a time.',
    type: 'website',
    images: [{ url: '/og-icon.png', width: 256, height: 256, alt: 'WisperTalk' }]
  }
};

export const viewport: Viewport = {
  themeColor: '#06070d',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
