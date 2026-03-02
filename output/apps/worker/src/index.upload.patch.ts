/**
 * apps/worker/src/index.ts — PATCH INSTRUCTIONS
 *
 * Add the upload route and update the checkout handler to accept uploadedKeys.
 * This file shows the minimal changes needed. Do NOT replace your full index.ts.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CHANGE 1 — Add import at the top of the file
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   import { handleUpload } from "./upload";
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CHANGE 2 — Add route in your router, BEFORE the 404 fallback
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   if (method === "POST" && path === "/api/upload") {
 *     return handleUpload(request, env);
 *   }
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CHANGE 3 — CORS preflight for /api/upload (add alongside your other OPTIONS handlers)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   if (method === "OPTIONS" && path === "/api/upload") {
 *     return new Response(null, {
 *       status: 204,
 *       headers: {
 *         "Access-Control-Allow-Origin": env.APP_URL ?? "*",
 *         "Access-Control-Allow-Methods": "POST, OPTIONS",
 *         "Access-Control-Allow-Headers": "Content-Type",
 *       },
 *     });
 *   }
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CHANGE 4 — In your /api/checkout handler, accept uploadedKeys
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * When you read the POST body in /api/checkout, extract uploadedKeys:
 *
 *   const { ..., uploadedKeys = [] } = await request.json();
 *
 * Then when you write the initial report record to KV before creating the
 * Stripe session, include uploadedKeys:
 *
 *   await env.OFFER_KV.put(`report:${token}`, JSON.stringify({
 *     email,
 *     intake: { name, email, offerName, ... },
 *     uploadedKeys,          // ← add this line
 *     paid: false,
 *     generated: false,
 *     createdAt: new Date().toISOString(),
 *   }));
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CHANGE 5 — In your report generator, read uploaded files from R2
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * In reportGenerator.ts (or wherever you call OpenAI), load the uploaded files
 * and append them to the prompt. See the REPORT_GENERATOR_PATCH below.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PRICING NOTE — NO CHANGES TO STRIPE LOGIC
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Uploads do NOT affect pricing. The checkout session is always created with
 * PRICE_ID (the single $149 price). Do NOT check uploadedKeys.length or
 * branch on it in any pricing logic.
 *
 * The only effect of uploadedKeys is:
 *  1. Files are retrieved from R2 before report generation
 *  2. A "Supporting Assets Reviewed" section is added to the report if files exist
 *
 */

export {};

// ─── REPORT_GENERATOR_PATCH ──────────────────────────────────────────────────
//
// In your reportGenerator.ts, after loading the report record from KV,
// add this block to retrieve uploaded file content:
//
// ```typescript
// // Load uploaded files from R2 (if any)
// let uploadedContent = "";
// if (report.uploadedKeys?.length) {
//   const fileTexts: string[] = [];
//   for (const key of report.uploadedKeys) {
//     try {
//       const obj = await env.OFFER_R2.get(key);
//       if (obj) {
//         const text = await obj.text();
//         const filename = key.split("/").pop() ?? key;
//         fileTexts.push(`--- FILE: ${filename} ---\n${text.slice(0, 8000)}`);
//       }
//     } catch {
//       // Non-fatal — skip unreadable files
//     }
//   }
//   if (fileTexts.length > 0) {
//     uploadedContent = `\n\n## SUPPORTING ASSETS PROVIDED BY CLIENT\n${fileTexts.join("\n\n")}`;
//   }
// }
// ```
//
// Then append `uploadedContent` to your OpenAI prompt:
//
// ```typescript
// const prompt = buildPrompt(report.intake) + uploadedContent;
// ```
//
// And include a "Supporting Assets Reviewed" section in the report if files were present:
//
// ```typescript
// // In the report output, after the 7-pillar sections:
// if (report.uploadedKeys?.length) {
//   reportOutput.supportingAssetsReviewed = report.uploadedKeys.map(k => k.split("/").pop());
// }
// ```
