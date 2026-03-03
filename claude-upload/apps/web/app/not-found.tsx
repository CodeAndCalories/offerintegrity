export const runtime = "edge";
import Link from "next/link";
import Nav from "@/components/Nav";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-ink text-parchment flex flex-col">
      <Nav />
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="mono text-xs text-gold tracking-[0.3em] uppercase mb-4">404</p>
          <h1 className="text-4xl font-light mb-4">Report not found</h1>
          <p className="text-parchment-dim mb-8">
            This report link may have expired or doesn't exist.
          </p>
          <Link
            href="/start"
            className="inline-flex items-center gap-2 bg-gold text-ink px-6 py-3 text-sm tracking-widest uppercase hover:bg-gold-light transition-colors"
          >
            Start a New Validation
          </Link>
        </div>
      </div>
    </main>
  );
}
