/**
 * ReportNotFound — drop this into your report/[token]/page.tsx
 * when the API returns 404.
 *
 * Usage:
 *   if (!report) return <ReportNotFound token={token} />;
 */

import Link from "next/link";

export default function ReportNotFound({ token }: { token?: string }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="max-w-md w-full text-center">
        <div className="text-3xl mb-6 opacity-30">🔍</div>
        <h1 className="text-2xl font-semibold mb-3">Report not found</h1>
        <p className="text-sm opacity-60 mb-6 leading-relaxed">
          We couldn't locate a report for this link. It may have expired, or the URL might be incomplete.
        </p>

        {token && (
          <p className="text-xs opacity-30 mb-8 font-mono">Token: {token}</p>
        )}

        <div className="space-y-3">
          <p className="text-sm opacity-60">
            <strong>Check your email</strong> — your report link was sent immediately after payment.
          </p>
          <p className="text-sm opacity-60">
            If you can't find it, contact us and we'll resend it.
          </p>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="mailto:hello@offerintegrity.io?subject=Report+not+found"
            className="inline-block border border-gold/40 text-gold text-sm uppercase tracking-widest px-6 py-3 rounded hover:bg-gold/10 transition-colors"
          >
            Contact support
          </a>
          <Link
            href="/"
            className="inline-block border border-white/10 text-sm uppercase tracking-widest px-6 py-3 rounded hover:bg-white/5 transition-colors"
          >
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
