import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OfferIntegrity.io — High Ticket Offer Validator",
  description: "Validate your high-ticket offer before you launch. Get a scored report across 7 critical pillars in minutes.",
  openGraph: {
    title: "OfferIntegrity.io",
    description: "Validate your high-ticket offer with a professional scored report.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          async
          defer
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
