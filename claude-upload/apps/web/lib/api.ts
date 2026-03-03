// Resolve Worker URL at call-time (not module load time) so that
// missing env vars surface as actionable errors instead of silent
// fallbacks to localhost in production.
function getWorkerUrl(): string {
  const url = process.env.NEXT_PUBLIC_WORKER_URL;

  // In development (NODE_ENV !== "production") fall back to localhost
  // so `pnpm dev` works without setting the env var.
  if (!url) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Configuration error: NEXT_PUBLIC_WORKER_URL is not set. " +
          "Add it to your Cloudflare Pages environment variables."
      );
    }
    return "http://localhost:8787";
  }

  return url;
}

export async function createCheckout(params: {
  intake: Record<string, string>;
  email: string;
  turnstileToken: string;
  uploadedFileKeys?: string[];
}): Promise<{ checkoutUrl: string; reportToken: string }> {
  const res = await fetch(`${getWorkerUrl()}/api/create-checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json() as { error: string };
    throw new Error(err.error || "Failed to create checkout");
  }
  return res.json();
}

export async function completeSession(sessionId: string): Promise<{ reportToken: string }> {
  const res = await fetch(`${getWorkerUrl()}/api/complete?session_id=${sessionId}`);
  if (!res.ok) {
    const err = await res.json() as { error: string };
    throw new Error(err.error || "Failed to complete session");
  }
  return res.json();
}

export async function fetchReport(token: string): Promise<any> {
  const res = await fetch(`${getWorkerUrl()}/api/report/${token}`);
  if (!res.ok) {
    const err = await res.json() as { error: string };
    throw new Error(err.error || "Report not found");
  }
  return res.json();
}

export function getPdfUrl(token: string): string {
  return `${getWorkerUrl()}/api/report/${token}/pdf`;
}
