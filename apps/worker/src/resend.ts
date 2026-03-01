/**
 * POST /api/resend
 * Support-safe endpoint to re-send a report email.
 *
 * Body: { token: string; email?: string }
 *   - token: the report token (required)
 *   - email: override recipient (optional — defaults to the address on the report)
 *
 * Security:
 *   - Requires X-Resend-Token header matching env RESEND_SUPPORT_TOKEN
 *   - Report must already exist in KV (paid + generated)
 *   - Rate limited: 5 resends per token per hour
 *   - The email is always sent to the address stored on the report unless
 *     an override is supplied AND matches the stored address (no fishing).
 */

import { sendReportEmail } from "./email";
import { checkRateLimit } from "./rateLimit";
import type { Env } from "./types";

export async function handleResend(request: Request, env: Env): Promise<Response> {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const supportToken = env.RESEND_SUPPORT_TOKEN;
  if (!supportToken) {
    return json({ error: "Resend support not configured" }, 503);
  }
  const authHeader = request.headers.get("X-Resend-Token") ?? "";
  if (authHeader !== supportToken) {
    return json({ error: "Unauthorized" }, 401);
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: { token?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { token, email: emailOverride } = body;
  if (!token || typeof token !== "string") {
    return json({ error: "token is required" }, 400);
  }

  // ── Rate limit (5 / hour per token) ──────────────────────────────────────
  const allowed = await checkRateLimit(env.OFFER_KV, `resend:${token}`, 5, 3600);
  if (!allowed) {
    return json({ error: "Rate limit exceeded — max 5 resends per token per hour" }, 429);
  }

  // ── Load report ───────────────────────────────────────────────────────────
  const raw = await env.OFFER_KV.get(`report:${token}`);
  if (!raw) {
    return json({ error: "Report not found" }, 404);
  }

  let report: {
    email?: string;
    paid?: boolean;
    generated?: boolean;
    intake?: Record<string, string>;
    reportJson?: unknown;
  };
  try {
    report = JSON.parse(raw);
  } catch {
    return json({ error: "Report data corrupted" }, 500);
  }

  if (!report.paid || !report.generated) {
    return json({ error: "Report is not complete — cannot resend" }, 409);
  }

  const recipient = emailOverride ?? report.email;
  if (!recipient) {
    return json({ error: "No email address available" }, 422);
  }

  // Safety: if override supplied, it must match the stored email
  if (emailOverride && emailOverride.toLowerCase() !== (report.email ?? "").toLowerCase()) {
    return json(
      { error: "Email override does not match the address on file — resend blocked" },
      403
    );
  }

  // ── Send ──────────────────────────────────────────────────────────────────
  try {
    const workerUrl = env.WORKER_URL ?? "";
    await sendReportEmail({
      env,
      to: recipient,
      token,
      intake: report.intake ?? {},
      reportJson: report.reportJson,
      workerUrl,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ error: `Email send failed: ${message}` }, 502);
  }

  return json({ ok: true, recipient });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
