import type { Metadata, Viewport } from "next";
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
  title: "Navratri Celebration RSVP",
  description: "RSVP for Day 1 of Navratri - Bhajan, Bhojan & Garba Night! Hosted by Kevin, Niti & Hriyaan",
  openGraph: {
    title: "Day 1 of Navratri — Bhajan, Bhojan & Garba Night!",
    description:
      "Join us Sunday, October 11, 2026 • 5:30 PM onwards • 4867 Coco Palm Dr, Fremont, CA. Hosted with love by Kevin, Niti & Hriyaan. Please RSVP by tapping here!",
    images: [
      {
        // Served from Cloudflare R2 so WhatsApp/iMessage can fetch the
        // preview thumbnail even before the app's own origin is deployed.
        url: "https://pub-a9cd5deb9a674cf781fe4e56075c4c4d.r2.dev/navaratri.jpeg",
        width: 893,
        height: 1600,
        alt: "Navratri Celebration Invitation",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
