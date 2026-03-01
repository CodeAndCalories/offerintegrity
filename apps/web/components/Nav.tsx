"use client";
import Link from "next/link";

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1a1a1a] backdrop-blur-sm bg-ink/80">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="mono text-sm text-gold tracking-widest uppercase">
          OfferIntegrity
        </Link>
        <div className="flex items-center gap-8">
          <Link href="/how-it-works" className="text-xs text-parchment-muted hover:text-parchment transition-colors tracking-wider uppercase">
            How It Works
          </Link>
          <Link
            href="/start"
            className="text-xs bg-gold text-ink px-4 py-2 hover:bg-gold-light transition-colors tracking-wider uppercase"
          >
            Validate Your Offer
          </Link>
        </div>
      </div>
    </nav>
  );
}
