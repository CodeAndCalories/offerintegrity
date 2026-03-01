import type { Metadata } from "next";
import "./globals.css"; // keep your existing global styles

const SITE_URL = "https://offerintegrity.io";
const TITLE = "OfferIntegrity — High-Ticket Offer Validation";
const DESCRIPTION =
  "Get a structured 7-pillar validation report for your high-ticket coaching or consulting offer. Know exactly what's working, what's broken, and how to fix it — before you launch.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | OfferIntegrity",
  },
  description: DESCRIPTION,
  keywords: [
    "high-ticket offer validation",
    "coaching offer audit",
    "consulting offer review",
    "offer positioning",
    "sales conversion audit",
  ],
  authors: [{ name: "OfferIntegrity" }],
  creator: "OfferIntegrity",
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "OfferIntegrity",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "OfferIntegrity — High-Ticket Offer Validation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const analyticsId = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN;

  return (
    <html lang="en">
      <head>
        {analyticsId && (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: analyticsId })}
          />
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
