# OfferIntegrity — Product Simplification Release
## Single-Tier $149 · Optional Uploads Included

---

## What changed

This release removes all tier logic and consolidates to a single $149 product.
Uploads are now included in the base price — they are optional and do not affect pricing.

### Removed / simplified
- All tier selection UI (`TierSelector`, `deepValidation` flags, tier branching)
- `PRICE_ID_DEEP` — never referenced
- Any conditional logic that showed different prices based on upload choice

### Added / updated
- Homepage rewrite with premium positioning (`app/page.tsx`)
- Long-form SEO page at `/high-ticket-offer-validation`
- `sitemap.ts` + `robots.ts`
- Updated OG image (1200×630) — new headline
- Updated `layout.tsx` metadata — refined description and keywords
- Upload step in wizard (Step 6 of 7) — optional, no price impact
- Worker `upload.ts` — new `POST /api/upload` endpoint
- R2 binding (`OFFER_R2`) — stores uploaded files

---

## File-by-file patch list

### NEW files — copy to your repo

| Source (this zip) | Destination in your repo | Action |
|---|---|---|
| `apps/web/app/page.tsx` | `apps/web/app/page.tsx` | **Replace** |
| `apps/web/app/layout.tsx` | `apps/web/app/layout.tsx` | **Replace** |
| `apps/web/app/sitemap.ts` | `apps/web/app/sitemap.ts` | **New file** |
| `apps/web/app/robots.ts` | `apps/web/app/robots.ts` | **New file** |
| `apps/web/app/start/page.tsx` | `apps/web/app/start/page.tsx` | **Replace** |
| `apps/web/app/high-ticket-offer-validation/page.tsx` | `apps/web/app/high-ticket-offer-validation/page.tsx` | **New file** |
| `apps/web/components/FieldError.tsx` | `apps/web/components/FieldError.tsx` | **Replace** |
| `apps/web/public/og.png` | `apps/web/public/og.png` | **Replace** |
| `apps/worker/src/upload.ts` | `apps/worker/src/upload.ts` | **New file** |
| `apps/worker/src/types.ts` | `apps/worker/src/types.ts` | **Replace** (adds `OFFER_R2`) |

### Patch files — read and apply manually

| File | What to do |
|---|---|
| `apps/worker/src/index.upload.patch.ts` | Read this file and apply the 4 changes to your `index.ts` |
| `apps/worker/wrangler.r2.addition.toml` | Append `[[r2_buckets]]` block to your `wrangler.toml` |

### Carry over from previous release (unchanged)

These files from the previous release are still valid and do not need to change:

- `apps/worker/src/email.ts`
- `apps/worker/src/resend.ts`
- `apps/web/components/WizardProgress.tsx`
- `apps/web/components/Footer.tsx`
- `apps/web/components/ReportNotFound.tsx`
- `apps/web/app/success/page.tsx`
- `apps/web/app/privacy/page.tsx`
- `apps/web/app/terms/page.tsx`
- All favicon / icon files (`favicon.ico`, `icon.png`, `apple-icon.png`, `icon.svg`)

---

## New environment variables

None required for this release.

R2 access is provided via the `wrangler.toml` binding — not a secret key.

---

## R2 binding instructions

### 1. Create the bucket

```bash
wrangler r2 bucket create offerintegrity-uploads
```

### 2. Add to `apps/worker/wrangler.toml`

```toml
[[r2_buckets]]
binding = "OFFER_R2"
bucket_name = "offerintegrity-uploads"
```

### 3. Add `OFFER_R2` to your `Env` interface

Replace `apps/worker/src/types.ts` with the version in this zip.
It adds `OFFER_R2: R2Bucket` alongside your existing bindings.

### 4. Deploy

```bash
cd apps/worker && npm run deploy
```

### 5. Verify

```bash
wrangler r2 object list offerintegrity-uploads
# Should return empty list (no error)
```

---

## Applying the index.ts patch

Open `apps/worker/src/index.ts` and make these 4 changes:

**Change 1 — Add import at top:**
```typescript
import { handleUpload } from "./upload";
```

**Change 2 — Add CORS preflight (with your other OPTIONS handlers):**
```typescript
if (method === "OPTIONS" && path === "/api/upload") {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": env.APP_URL ?? "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
```

**Change 3 — Add upload route (before 404 fallback):**
```typescript
if (method === "POST" && path === "/api/upload") {
  return handleUpload(request, env);
}
```

**Change 4 — In your `/api/checkout` handler, accept `uploadedKeys`:**

When reading the POST body:
```typescript
const { ..., uploadedKeys = [] } = await request.json();
```

When writing to KV before creating the Stripe session:
```typescript
await env.OFFER_KV.put(`report:${token}`, JSON.stringify({
  email,
  intake: { name, email, offerName, ... },
  uploadedKeys,   // ← add this line only
  paid: false,
  generated: false,
  createdAt: new Date().toISOString(),
}));
```

**⚠ Do NOT change any Stripe or pricing logic. The checkout session always uses the single $149 price.**

---

## Applying the report generator patch

In your `reportGenerator.ts` (or wherever you call OpenAI), after loading the report from KV:

```typescript
// Load uploaded files from R2 (if any)
let uploadedContent = "";
if (report.uploadedKeys?.length) {
  const fileTexts: string[] = [];
  for (const key of report.uploadedKeys) {
    try {
      const obj = await env.OFFER_R2.get(key);
      if (obj) {
        const text = await obj.text();
        const filename = key.split("/").pop() ?? key;
        fileTexts.push(`--- FILE: ${filename} ---\n${text.slice(0, 8000)}`);
      }
    } catch {
      // Non-fatal — skip unreadable files
    }
  }
  if (fileTexts.length > 0) {
    uploadedContent = `\n\n## SUPPORTING ASSETS PROVIDED BY CLIENT\n${fileTexts.join("\n\n")}`;
  }
}

// Append to your prompt
const prompt = buildPrompt(report.intake) + uploadedContent;
```

And add a "Supporting Assets Reviewed" section to your report JSON output:

```typescript
if (report.uploadedKeys?.length) {
  reportJson.supportingAssetsReviewed = report.uploadedKeys.map(
    (k) => k.split("/").pop() ?? k
  );
}
```

This adds the section to the report only if files were uploaded. If no files, the section is absent and the report is identical to before.

---

## Test checklist

### Smoke tests (no Stripe)

- [ ] `GET /` — homepage loads with new headline "Validate Your $5K–$50K Offer Before You Scale"
- [ ] `GET /high-ticket-offer-validation` — SEO page loads and renders correctly
- [ ] `GET /sitemap.xml` — returns valid XML with 5 URLs
- [ ] `GET /robots.txt` — returns correct disallow rules
- [ ] `/start` — wizard opens at Step 1 (About you)
- [ ] Navigate wizard: Step 1 → Step 7, verify progress bar advances
- [ ] Step 6 — upload a PDF (≤ 5 MB): file appears, removal works
- [ ] Step 6 — attempt upload of `.exe` file: rejected with error
- [ ] Step 6 — attempt upload of 4 files: rejected at 3-file limit
- [ ] Step 6 — skip uploads entirely: proceed to Step 7 without error
- [ ] Step 7 — review shows all answers correctly; "Files: N file(s) attached" appears if files uploaded

### Worker tests

- [ ] `POST /api/upload` with valid PDF → `{ ok: true, keys: [...] }` — 200
- [ ] `POST /api/upload` with `.exe` file → 400 error
- [ ] `POST /api/upload` with 4 files → 400 error
- [ ] `POST /api/upload` 6 times from same IP in 10 min → 429 on 6th
- [ ] `POST /api/upload` when OFFER_R2 not bound → 503 with clear message

### Stripe flow (full integration)

- [ ] Complete wizard with files → checkout session created → Stripe checkout opens
- [ ] Complete wizard WITHOUT files → checkout session created → Stripe checkout opens
- [ ] Checkout session is always for $149 regardless of file presence
- [ ] Stripe webhook fires → report generated → "Supporting Assets Reviewed" section present in report if files were uploaded
- [ ] Report delivered by email → PDF opens correctly

### What to verify is NOT changed

- [ ] No `PRICE_ID_DEEP` referenced anywhere
- [ ] No tier selection UI visible at any point in the flow
- [ ] Price displayed everywhere is $149
- [ ] Stripe session price is unchanged
- [ ] `POST /api/resend` still works (from previous release)

---

## Pricing constraint summary

**Unchanged from your existing implementation:**
- Stripe `PRICE_ID` — same single price
- Checkout session creation — no branching
- Webhook handler — no tier logic
- Report generation — same 7-pillar output (file content appended to prompt if uploaded)

**The only additions are:**
- `uploadedKeys` stored in KV with the report record
- Files retrieved from R2 before OpenAI call
- "Supporting Assets Reviewed" section in report output (conditional)
