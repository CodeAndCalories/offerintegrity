# OfferIntegrity.io

**High Ticket Offer Validator** — A structured 7-pillar validation report for founders and consultants building high-ticket programs.

## Architecture

```
offerintegrity/
├── apps/
│   ├── web/                     # Next.js 14 app → Cloudflare Pages
│   │   ├── app/
│   │   │   ├── page.tsx         # / landing
│   │   │   ├── how-it-works/    # /how-it-works
│   │   │   ├── start/           # /start wizard
│   │   │   ├── success/         # /success?session_id=...
│   │   │   └── report/[token]/  # /report/:token
│   │   ├── components/
│   │   │   └── Nav.tsx
│   │   └── lib/
│   │       └── api.ts           # Worker API client
│   └── worker/                  # Cloudflare Worker → API
│       └── src/
│           ├── index.ts         # Route handler
│           ├── types.ts
│           ├── rateLimit.ts
│           ├── reportGenerator.ts
│           ├── pdfGenerator.ts
│           └── email.ts
├── .env.example
└── README.md
```

## API Routes (Worker)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/create-checkout` | Validates intake, creates Stripe Checkout session |
| GET | `/api/complete?session_id=` | Verifies payment, generates + stores report, sends email |
| GET | `/api/report/:token` | Returns report JSON |
| GET | `/api/report/:token/pdf` | Returns PDF binary |
| POST | `/api/stripe-webhook` | Stripe webhook (reliability fallback) |

## Local Development

### Prerequisites
- Node.js 18+
- Wrangler CLI: `npm i -g wrangler`
- Stripe CLI (for webhook testing)

### 1. Clone and install
```bash
git clone <repo>
cd offerintegrity
npm install
```

### 2. Set up Worker environment
```bash
cd apps/worker
cp ../../.env.example .env
# Edit wrangler.toml with your KV namespace IDs
```

Create a KV namespace:
```bash
wrangler kv:namespace create "OFFER_KV"
wrangler kv:namespace create "OFFER_KV" --preview
# Copy the IDs into wrangler.toml
```

Set secrets:
```bash
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put RESEND_API_KEY
wrangler secret put TURNSTILE_SECRET_KEY
# Optional: wrangler secret put OPENAI_API_KEY
```

### 3. Start Worker dev server
```bash
cd apps/worker
npm run dev
# Runs on http://localhost:8787
```

### 4. Set up Web app
```bash
cd apps/web
cat > .env.local << EOF
NEXT_PUBLIC_WORKER_URL=http://localhost:8787
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
EOF
npm run dev
# Runs on http://localhost:3000
```

### 5. Test end-to-end with mocked AI

With `USE_REAL_AI=false` in wrangler.toml (default), the report generator returns a realistic mock report. No OpenAI key needed.

To bypass Stripe in local testing, set `STRIPE_SECRET_KEY=sk_test_...` (test key) and use Stripe test card `4242 4242 4242 4242`.

### 6. Test Stripe webhooks locally
```bash
stripe listen --forward-to localhost:8787/api/stripe-webhook
```

## Deployment

### Deploy Worker
```bash
cd apps/worker
npm run deploy
```

Note the Worker URL (e.g. `https://offerintegrity-worker.<account>.workers.dev`).

### Deploy Web App to Cloudflare Pages

1. Connect your repo to Cloudflare Pages
2. Set build settings:
   - Framework: Next.js
   - Build command: `cd apps/web && npm run build`
   - Output directory: `apps/web/.next`
3. Add environment variables in Pages dashboard:
   ```
   NEXT_PUBLIC_WORKER_URL=https://your-worker.workers.dev
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key
   ```

Or use the `@cloudflare/next-on-pages` adapter:
```bash
cd apps/web
npm run build
npx wrangler pages deploy .next
```

## Cloudflare Bindings

### KV Namespace
In Cloudflare Dashboard → Workers → Your Worker → Settings → Variables → KV Namespace Bindings:
- Binding name: `OFFER_KV`
- KV Namespace: Select your created namespace

### Environment Variables (Worker)
Set these in Dashboard or via `wrangler secret put`:
```
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET  
RESEND_API_KEY
TURNSTILE_SECRET_KEY
OPENAI_API_KEY        (if USE_REAL_AI=true)
USE_REAL_AI           (true/false, set in wrangler.toml [vars])
WORKER_URL            (your worker's public URL)
APP_URL               (your Pages URL)
```

## Stripe Webhook Setup

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-worker.workers.dev/api/stripe-webhook`
3. Select events: `checkout.session.completed`
4. Copy the signing secret → set as `STRIPE_WEBHOOK_SECRET`

## Cloudflare Turnstile Setup

1. Go to https://dash.cloudflare.com → Turnstile
2. Create a new site
3. Copy **Site Key** → set as `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in Pages
4. Copy **Secret Key** → set as `TURNSTILE_SECRET_KEY` in Worker

For local testing, use Turnstile test keys:
- Site key: `1x00000000000000000000AA` (always passes)
- Secret key: `1x0000000000000000000000000000000AA` (always passes)

The Worker also accepts the token `"dev-bypass"` to skip verification during development.

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| POST /api/create-checkout | 10/hour per IP |
| GET /api/complete | 10/hour per IP |
| GET /api/report/:token | 60/hour per token |
| GET /api/report/:token/pdf | 20/hour per token |

## Enabling Real AI

1. Set `OPENAI_API_KEY` via `wrangler secret put OPENAI_API_KEY`
2. In `wrangler.toml`, set `USE_REAL_AI = "true"`
3. Re-deploy the Worker

The AI uses `gpt-4o-mini` with JSON response mode for structured output. Input is capped at 8000 chars total. Output is capped at 3000 tokens.

## KV Data Schema

Key: `report:{token}`
```json
{
  "intake": { ...intakeFields },
  "reportJson": { ...reportSchema },
  "createdAt": "ISO date",
  "email": "user@example.com",
  "paid": true,
  "generated": true,
  "usageCount": 3,
  "stripeSessionId": "cs_..."
}
```

Key: `session:{stripeSessionId}` → `reportToken` (7 day TTL)

Key: `rl:{endpoint}:{identifier}` → `[timestamp, ...]` (rate limit tracking)
