/**
 * apps/worker/src/index.ts — ADD THIS ROUTE to your existing router
 *
 * Find your existing route block that looks like:
 *
 *   if (method === "POST" && path === "/api/stripe-webhook") { ... }
 *
 * Add the following block BEFORE the final catch-all 404:
 */

// ─── Resend Report Email (support endpoint) ────────────────────────────────
//
// import { handleResend } from "./resend";   ← add to your imports
//
// if (method === "POST" && path === "/api/resend") {
//   return handleResend(request, env);
// }
//
// That's all. The handler is self-contained in resend.ts.
//
// ─────────────────────────────────────────────────────────────────────────────

// The complete diff for index.ts is minimal — two lines:
//
// Line 1 (top of file, with other imports):
//   import { handleResend } from "./resend";
//
// Line 2 (in the router, before the 404 fallback):
//   if (method === "POST" && path === "/api/resend") return handleResend(request, env);

export {};
