"use client"
export const runtime = "edge";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import { completeSession } from "@/lib/api";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"processing" | "error" | "done">("processing");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found. Please contact support.");
      setStatus("error");
      return;
    }

    let attempts = 0;
    const maxAttempts = 5;

    async function complete() {
      try {
        const { reportToken } = await completeSession(sessionId!);
        setStatus("done");
        setTimeout(() => {
          router.push(`/report/${reportToken}`);
        }, 800);
      } catch (e: any) {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(complete, 2000);
        } else {
          setError(e.message || "Failed to generate report. Please contact support with your session ID.");
          setStatus("error");
        }
      }
    }

    complete();
  }, [sessionId, router]);

  return (
    <main className="min-h-screen bg-ink text-parchment flex flex-col">
      <Nav />
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          {status === "processing" && (
            <>
              <div className="mb-8 mx-auto w-16 h-16 border border-[#2a2a2a] rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
              </div>
              <p className="mono text-xs text-gold tracking-[0.3em] uppercase mb-4">
                Payment Confirmed
              </p>
              <h1 className="text-3xl font-light mb-4">Generating Your Report</h1>
              <p className="text-parchment-dim text-sm leading-relaxed">
                Our AI is analyzing your offer across all 7 pillars. This takes 15–30 seconds.
              </p>
              <div className="mt-8 flex gap-2 justify-center">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-gold rounded-full shimmer"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                ))}
              </div>
            </>
          )}

          {status === "done" && (
            <>
              <div className="mb-8 mx-auto w-16 h-16 border border-gold/30 rounded-full flex items-center justify-center">
                <span className="text-gold text-2xl">✓</span>
              </div>
              <p className="mono text-xs text-gold tracking-[0.3em] uppercase mb-4">Report Ready</p>
              <h1 className="text-3xl font-light mb-4">Redirecting to your report…</h1>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mb-8 mx-auto w-16 h-16 border border-red-800/30 rounded-full flex items-center justify-center">
                <span className="text-red-400 text-2xl">!</span>
              </div>
              <p className="mono text-xs text-red-400 tracking-[0.3em] uppercase mb-4">Error</p>
              <h1 className="text-2xl font-light mb-4">Something went wrong</h1>
              <p className="text-parchment-dim text-sm leading-relaxed mb-6">{error}</p>
              {sessionId && (
                <p className="mono text-xs text-parchment-muted">
                  Session ID: {sessionId}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-ink flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}
