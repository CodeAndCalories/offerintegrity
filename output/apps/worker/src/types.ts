/**
 * apps/worker/src/types.ts
 *
 * Env interface for Cloudflare Worker bindings.
 *
 * ADD the OFFER_R2 binding to your existing types.ts.
 * The rest of this file should match your existing types.
 */

export interface Env {
  // ── KV ─────────────────────────────────────────────────────────────────
  OFFER_KV: KVNamespace;

  // ── R2 (new — for file uploads) ────────────────────────────────────────
  // Add [[r2_buckets]] binding in wrangler.toml — see R2 binding instructions.
  OFFER_R2: R2Bucket;

  // ── Secrets ────────────────────────────────────────────────────────────
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  OPENAI_API_KEY: string;

  // ── Support tools ──────────────────────────────────────────────────────
  RESEND_SUPPORT_TOKEN: string;

  // ── Config vars (wrangler.toml [vars]) ─────────────────────────────────
  USE_REAL_AI: string;
  WORKER_URL: string;
  APP_URL: string;
}

// ─── Report stored in KV ──────────────────────────────────────────────────────

export interface ReportRecord {
  email: string;
  intake: IntakeAnswers;
  uploadedKeys?: string[];   // R2 keys of uploaded files (optional)
  paid: boolean;
  generated: boolean;
  reportJson?: unknown;
  createdAt: string;
}

export interface IntakeAnswers {
  name: string;
  email: string;
  offerName: string;
  offerDescription: string;
  targetAudience: string;
  pricePoint: string;
  desiredOutcome: string;
  currentProof: string;
  mainObjections: string;
  currentConversion: string;
  biggestGap: string;
  nextLaunchDate?: string;
}
