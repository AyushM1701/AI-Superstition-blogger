import type { Metadata } from "next";
import { Marcellus, Cormorant, Rajdhani } from 'next/font/google';
import "./globals.css";
import StarfieldBackground from "../components/StarfieldBackground";
import ParallaxStars from "../components/ParallaxStars";
import ReadingProgressBar from "../components/ReadingProgressBar";
import Header from "../components/Header";
import { SITE_URL } from '../lib/config';
import { buildPollinationsImageUrl } from '../lib/image-style';

export const metadata: Metadata = {
  title: "TONA TOTKA.COM",
  description: "Uncover the world's most fascinating Indian superstitions, myths, and folklore.",
  openGraph: {
    title: "TONA TOTKA.COM",
    description: "Uncover the world's most fascinating Indian superstitions, myths, and folklore.",
    url: SITE_URL,
    siteName: "TONA TOTKA.COM",
    images: [
      {
        url: buildPollinationsImageUrl('Indian superstition mystery dark magic ancient ritual', 1200, 630),
        width: 1200,
        height: 630,
      }
    ],
    locale: 'en_IN',
    type: 'website',
  }
};

const marcellus = Marcellus({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
});

const cormorant = Cormorant({
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-head',
});

const rajdhani = Rajdhani({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-body',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${marcellus.variable} ${cormorant.variable} ${rajdhani.variable}`}>
        <ParallaxStars />
        <StarfieldBackground />
        <ReadingProgressBar />
        <Header />
        {children}
      </body>
    </html>
  );
}
