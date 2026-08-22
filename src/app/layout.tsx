import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fit & Scent — occasion-based styling, explained",
  description:
    "Upload a photo, get an explained dress and fragrance recommendation based on your face shape, body build, and the occasion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
      <GoogleAnalytics gaId="G-RQ5VHY9YM3" />
    </html>
  );
}
