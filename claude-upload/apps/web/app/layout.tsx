import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://offerintegrity.io"),
  title: {
    default: "OfferIntegrity — Know If Your High-Ticket Offer Will Sell",
    template: "%s | OfferIntegrity",
  },
  description:
    "Get a structured 7-pillar validation report for your high-ticket coaching or consulting offer. Scored analysis, identified risks, and a prioritized 30-day action plan. $149, instant delivery.",
  keywords: [
    "high ticket offer validation",
    "offer validation report",
    "coaching offer validator",
    "consulting offer analysis",
    "high ticket coaching",
    "offer integrity",
    "launch readiness",
    "offer scoring",
  ],
  authors: [{ name: "OfferIntegrity" }],
  creator: "OfferIntegrity",
  publisher: "OfferIntegrity",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://offerintegrity.io",
    siteName: "OfferIntegrity",
    title: "Know If Your High-Ticket Offer Will Sell — Before You Launch",
    description:
      "A structured 7-pillar validation report for founders and consultants building high-ticket programs. Stop guessing. Start with clarity.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OfferIntegrity — High Ticket Offer Validation Report",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Know If Your High-Ticket Offer Will Sell — Before You Launch",
    description:
      "A structured 7-pillar validation report for founders and consultants. Scored analysis + 30-day action plan. $149, instant delivery.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://offerintegrity.io",
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
