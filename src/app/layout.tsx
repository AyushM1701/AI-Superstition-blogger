import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
