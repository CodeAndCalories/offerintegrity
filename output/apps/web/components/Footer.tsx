import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-24 py-8 px-6 text-center text-xs opacity-40">
      <div className="flex flex-wrap justify-center gap-6 mb-3">
        <Link href="/privacy" className="hover:opacity-80 transition-opacity">
          Privacy Policy
        </Link>
        <Link href="/terms" className="hover:opacity-80 transition-opacity">
          Terms of Service
        </Link>
        <a href="mailto:hello@offerintegrity.io" className="hover:opacity-80 transition-opacity">
          Contact
        </a>
      </div>
      <p>© {new Date().getFullYear()} OfferIntegrity. All rights reserved.</p>
    </footer>
  );
}
