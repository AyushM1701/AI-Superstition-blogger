import type { Metadata } from "next";
import { Marcellus, Cormorant, Rajdhani } from 'next/font/google';
import "./globals.css";
import StarfieldBackground from "../components/StarfieldBackground";
import ParallaxStars from "../components/ParallaxStars";
import ReadingProgressBar from "../components/ReadingProgressBar";

export const metadata: Metadata = {
  title: "TONA TOTKA.COM",
  description: "Uncover the world's most fascinating Indian superstitions, myths, and folklore.",
  openGraph: {
    title: "TONA TOTKA.COM",
    description: "Uncover the world's most fascinating Indian superstitions, myths, and folklore.",
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-superstition-blogger-4nnb.vercel.app',
    siteName: "TONA TOTKA.COM",
    images: [
      {
        url: "https://image.pollinations.ai/prompt/Indian%20superstition%20mystery%20dark%20magic%20cinematic%208k?width=1200&height=630&nologo=true",
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
        {children}
      </body>
    </html>
  );
}
