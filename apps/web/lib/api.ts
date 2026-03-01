const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || "http://localhost:8787";

export async function createCheckout(params: {
  intake: Record<string, string>;
  email: string;
  turnstileToken: string;
}): Promise<{ checkoutUrl: string; reportToken: string }> {
  const res = await fetch(`${WORKER_URL}/api/create-checkout`, {
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
  const res = await fetch(`${WORKER_URL}/api/complete?session_id=${sessionId}`);
  if (!res.ok) {
    const err = await res.json() as { error: string };
    throw new Error(err.error || "Failed to complete session");
  }
  return res.json();
}

export async function fetchReport(token: string): Promise<any> {
  const res = await fetch(`${WORKER_URL}/api/report/${token}`);
  if (!res.ok) {
    const err = await res.json() as { error: string };
    throw new Error(err.error || "Report not found");
  }
  return res.json();
}

export function getPdfUrl(token: string): string {
  return `${WORKER_URL}/api/report/${token}/pdf`;
}
