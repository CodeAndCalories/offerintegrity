/**
 * apps/web/app/success/page.tsx
 *
 * DROP-IN REPLACEMENT for your existing /success page.
 * Keeps the same session_id param logic. Adds clear "what happens next" UX.
 */

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL!;

type Status = "verifying" | "ready" | "pending" | "error";

export default function SuccessPage() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  const [status, setStatus] = useState<Status>("verifying");
  const [reportToken, setReportToken] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setErrorMsg("No session ID found. If you completed payment, check your email — your report link will arrive shortly.");
      return;
    }

    let attempts = 0;
    const maxAttempts = 12; // ~60 s

    async function poll() {
      attempts++;
      try {
        const res = await fetch(`${WORKER_URL}/api/complete?session_id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.token) {
            setReportToken(data.token);
            setStatus("ready");
            return;
          }
        }
        if (attempts >= maxAttempts) {
          setStatus("pending");
          return;
        }
        setTimeout(poll, 5000);
      } catch {
        if (attempts >= maxAttempts) {
          setStatus("error");
          setErrorMsg("Something went wrong verifying your payment. Check your email for your report link, or contact us.");
        } else {
          setTimeout(poll, 5000);
        }
      }
    }

    poll();
  }, [sessionId]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="max-w-lg w-full text-center">

        {status === "verifying" && (
          <>
            <Spinner />
            <h1 className="mt-8 text-2xl font-semibold">Verifying your payment…</h1>
            <p className="mt-3 text-sm opacity-60">This takes a few seconds. Please don't close this tab.</p>
          </>
        )}

        {status === "ready" && reportToken && (
          <>
            <div className="text-gold text-4xl mb-6">✓</div>
            <h1 className="text-2xl font-semibold mb-3">Your report is ready</h1>
            <p className="text-sm opacity-60 mb-8">
              A copy has been sent to your email. The link in that email will always work — bookmark it or save the email.
            </p>
            <Link
              href={`/report/${reportToken}`}
              className="inline-block bg-gold text-charcoal text-sm font-bold uppercase tracking-widest px-8 py-4 rounded hover:opacity-90 transition-opacity"
            >
              View Your Report
            </Link>
          </>
        )}

        {status === "pending" && (
          <>
            <div className="text-gold text-4xl mb-6">⏳</div>
            <h1 className="text-2xl font-semibold mb-3">We're generating your report</h1>
            <p className="text-sm opacity-60 mb-4">
              It's taking a little longer than usual. Your report will be emailed to you within the next few minutes.
            </p>
            <p className="text-xs opacity-40">
              You can close this tab — your report link will arrive by email.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-red-400 text-4xl mb-6">!</div>
            <h1 className="text-2xl font-semibold mb-3">Something went wrong</h1>
            <p className="text-sm opacity-60 mb-6">{errorMsg}</p>
            <a
              href="mailto:hello@offerintegrity.io"
              className="text-gold text-sm underline"
            >
              Contact support
            </a>
          </>
        )}

      </div>
    </main>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center">
      <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );
}
