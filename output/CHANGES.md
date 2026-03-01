# OfferIntegrity — Release Notes

## Summary of Changes

### 1. Icons & Favicons (`apps/web/app/`)
- `favicon.ico` — multi-size (16/32/48px) generated from `icon.svg`
- `icon.png` — 32×32 PNG for browser tab
- `apple-icon.png` — 180×180 for iOS homescreen
- `apps/web/public/og.png` — 1200×630 OpenGraph image
- `apps/web/public/icon.svg` — source SVG for reference

Next.js App Router auto-discovers `favicon.ico`, `icon.png`, and `apple-icon.png` in the `app/` directory — no `<link>` tags needed.

### 2. Metadata & SEO (`apps/web/app/layout.tsx`)
- Full `Metadata` object with title template, description, canonical, keywords
- OpenGraph `og:type`, `og:image`, `og:site_name`
- Twitter `summary_large_image` card
- Robots: index + follow
- Cloudflare Web Analytics snippet injected behind `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` env var

**Replace** your existing `layout.tsx` with `apps/web/app/layout.tsx`.

### 3. Premium Copy (`apps/web/lib/copy.ts`)
- `HERO`, `HOW_IT_WORKS`, `PILLARS`, `OBJECTIONS` constants
- Risk-reduction, specificity-first tone — no generic AI language
- Import into `page.tsx` and `how-it-works/page.tsx` and use in JSX

### 4. Email Polish (`apps/worker/src/email.ts`)
- Dark premium HTML template (matches brand palette)
- Plain-text fallback with both report URL and direct PDF URL
- PDF link uses `${workerUrl}/api/report/${token}/pdf` — always correct
- `report_token` tag on every send for Resend filtering

**Replace** your existing `email.ts` with this file.

### 5. Resend Report API (`apps/worker/src/resend.ts`)
- New `POST /api/resend` endpoint
- Requires `X-Resend-Token` header matching `RESEND_SUPPORT_TOKEN` secret
- Validates: report exists, is paid + generated, rate limit (5/hour/token)
- Email override must match stored address — prevents fishing
- See `apps/worker/src/index.patch.ts` for the 2-line change to your router

### 6. UX Components
- `WizardProgress.tsx` — step counter + progress bar + dots
- `FieldError.tsx` + `friendlyErrors` helpers — friendly validation copy
- `success/page.tsx` — polling with verifying/ready/pending/error states + "what next" explanation
- `ReportNotFound.tsx` — 404 state with email CTA

### 7. Footer Pages
- `/privacy` — GDPR-aware, covers Stripe/Resend/OpenAI/Cloudflare processors
- `/terms` — payment, refunds, accuracy, IP, limitation of liability
- `Footer.tsx` component — add to your root layout or per-page

### 8. Analytics
- Zero-overhead: snippet only injected if env var is set
- Cloudflare Web Analytics is cookieless — no consent banner needed for EU

---

## Deploy Checklist

### Worker
- [ ] Copy `apps/worker/src/email.ts` → replace existing
- [ ] Copy `apps/worker/src/resend.ts` → new file
- [ ] Edit `apps/worker/src/index.ts`:
  - Add: `import { handleResend } from "./resend";`
  - Add route: `if (method === "POST" && path === "/api/resend") return handleResend(request, env);`
- [ ] `wrangler secret put RESEND_SUPPORT_TOKEN` (generate with `openssl rand -hex 32`)
- [ ] `cd apps/worker && npm run deploy`
- [ ] Smoke test: `curl -X POST https://api.offerintegrity.io/api/resend` → should get `401 Unauthorized`

### Web (Cloudflare Pages)
- [ ] Copy `apps/web/app/favicon.ico`, `icon.png`, `apple-icon.png` → `apps/web/app/`
- [ ] Copy `apps/web/public/og.png`, `icon.svg` → `apps/web/public/`
- [ ] Replace `apps/web/app/layout.tsx` with new version
- [ ] Add new pages: `privacy/page.tsx`, `terms/page.tsx`
- [ ] Add components: `Footer.tsx`, `WizardProgress.tsx`, `FieldError.tsx`, `ReportNotFound.tsx`
- [ ] Add lib: `lib/copy.ts`
- [ ] Replace `app/success/page.tsx` with new version (or merge polling logic)
- [ ] Update your landing page to import from `lib/copy.ts`
- [ ] Add `Footer` component to root layout or per-page
- [ ] Add `ReportNotFound` to `report/[token]/page.tsx` for 404 state
- [ ] In Cloudflare Pages → Settings → Environment Variables:
  - `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` = your token (or leave blank to skip analytics)
- [ ] Trigger re-deploy (git push or manual)

### Verification
- [ ] `https://offerintegrity.io` — check favicon in tab, og:image with og:preview tool
- [ ] `https://offerintegrity.io/privacy` — loads correctly
- [ ] `https://offerintegrity.io/terms` — loads correctly
- [ ] Complete a test purchase → success page shows states correctly
- [ ] Check email delivery — PDF link points to `api.offerintegrity.io/api/report/TOKEN/pdf`
- [ ] Worker resend test:
  ```
  curl -X POST https://api.offerintegrity.io/api/resend \
    -H "X-Resend-Token: YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"token":"YOUR_REPORT_TOKEN"}'
  ```

### No changes needed
- Stripe webhook routes — untouched
- KV namespace bindings — no new bindings
- Turnstile — untouched
- Worker rate limiting — existing system used for resend too
