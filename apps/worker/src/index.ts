import { Env, IntakeData, KVRecord } from "./types";
import { checkRateLimit, getClientIP } from "./rateLimit";
import { generateReport } from "./reportGenerator";
import { generatePDF } from "./pdfGenerator";
import { sendReportEmail } from "./email";

function cors(origin?: string | null): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(data: unknown, status = 200, extraHeaders: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...cors(),
      ...extraHeaders,
    },
  });
}

function err(message: string, status = 400): Response {
  return json({ error: message }, status);
}

function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyTurnstile(token: string, secretKey: string, ip: string): Promise<boolean> {
  // Skip in dev if token is "dev-bypass"
  if (token === "dev-bypass") return true;

  const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}&remoteip=${encodeURIComponent(ip)}`,
  });
  const data = await resp.json() as { success: boolean };
  return data.success;
}

function validateIntake(intake: IntakeData): string | null {
  const requiredFields: (keyof IntakeData)[] = [
    "offerName", "price", "offerType", "deliveryFormat",
    "problemStatement", "desiredOutcome", "icpRole",
  ];

  for (const field of requiredFields) {
    if (!intake[field]) return `Missing required field: ${field}`;
  }

  // Size limits
  const textFields: (keyof IntakeData)[] = [
    "problemStatement", "costOfInaction", "desiredOutcome",
    "uniqueMechanism", "mainAlternatives", "proofAssets", "keyDependencies",
  ];

  for (const field of textFields) {
    const val = intake[field] as string;
    if (val && val.length > 1200) return `Field '${field}' exceeds 1200 character limit`;
  }

  const totalChars = textFields.reduce((sum, f) => sum + ((intake[f] as string)?.length || 0), 0);
  if (totalChars > 8000) return "Total text content exceeds 8000 character limit";

  return null;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const ip = getClientIP(request);
    const origin = request.headers.get("Origin");

    // CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(origin) });
    }

    // POST /api/create-checkout
    if (method === "POST" && path === "/api/create-checkout") {
      const rl = await checkRateLimit(env.OFFER_KV, `checkout:${ip}`, 10);
      if (!rl.allowed) return err("Rate limit exceeded. Try again in an hour.", 429);

      let body: { intake: IntakeData; email: string; turnstileToken: string };
      try {
        body = await request.json();
      } catch {
        return err("Invalid JSON");
      }

      const { intake, email, turnstileToken } = body;
      if (!email || !email.includes("@")) return err("Valid email required");
      if (!turnstileToken) return err("Turnstile token required");

      // Verify Turnstile
      const turnstileValid = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET_KEY, ip);
      if (!turnstileValid) return err("Bot verification failed", 403);

      // Validate intake
      const validationError = validateIntake(intake);
      if (validationError) return err(validationError);

      // Create a pre-record with a pending token
      const reportToken = generateToken();

      // Store preliminary record (not paid yet)
      const record: KVRecord = {
        intake,
        email,
        createdAt: new Date().toISOString(),
        paid: false,
        generated: false,
        usageCount: 0,
        stripeSessionId: "",
      };

      // Create Stripe session
      const stripe = await import("stripe");
      const stripeClient = new (stripe.default)(env.STRIPE_SECRET_KEY, {
        httpClient: stripe.default.createFetchHttpClient(),
      });

      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "High Ticket Offer Validation Report",
                description: `Comprehensive validation for: ${intake.offerName}`,
              },
              unit_amount: 4900, // $49.00
            },
            quantity: 1,
          },
        ],
        success_url: `${env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.APP_URL}/start`,
        metadata: {
          reportToken,
          email,
        },
      });

      // Store mapping: sessionId -> reportToken
      record.stripeSessionId = session.id;
      await env.OFFER_KV.put(`report:${reportToken}`, JSON.stringify(record), {
        expirationTtl: 60 * 60 * 24 * 90, // 90 days
      });
      await env.OFFER_KV.put(`session:${session.id}`, reportToken, {
        expirationTtl: 60 * 60 * 24 * 7, // 7 days
      });

      return json({ checkoutUrl: session.url, reportToken });
    }

    // GET /api/complete?session_id=...
    if (method === "GET" && path === "/api/complete") {
      const sessionId = url.searchParams.get("session_id");
      if (!sessionId) return err("session_id required");

      const rl = await checkRateLimit(env.OFFER_KV, `complete:${ip}`, 10);
      if (!rl.allowed) return err("Rate limit exceeded", 429);

      // Look up reportToken
      const reportToken = await env.OFFER_KV.get(`session:${sessionId}`);
      if (!reportToken) return err("Session not found", 404);

      const raw = await env.OFFER_KV.get(`report:${reportToken}`);
      if (!raw) return err("Report record not found", 404);

      const record = JSON.parse(raw) as KVRecord;

      // If already generated, return cached
      if (record.generated && record.reportJson) {
        return json({ reportToken, cached: true });
      }

      // Verify payment with Stripe
      const stripe = await import("stripe");
      const stripeClient = new (stripe.default)(env.STRIPE_SECRET_KEY, {
        httpClient: stripe.default.createFetchHttpClient(),
      });

      const session = await stripeClient.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== "paid") {
        return err("Payment not completed", 402);
      }

      // Mark as paid
      record.paid = true;

      // Generate report
      const useRealAI = env.USE_REAL_AI === "true";
      const reportJson = await generateReport(record.intake, useRealAI, env.OPENAI_API_KEY);

      record.reportJson = reportJson;
      record.generated = true;

      await env.OFFER_KV.put(`report:${reportToken}`, JSON.stringify(record), {
        expirationTtl: 60 * 60 * 24 * 90,
      });

      // Send email (non-blocking)
      ctx.waitUntil(
        sendReportEmail({
          to: record.email,
          offerName: reportJson.meta.offerName,
          reportToken,
          verdict: reportJson.overall.verdict,
          scorePercent: reportJson.overall.scorePercent,
          appUrl: env.APP_URL,
          resendApiKey: env.RESEND_API_KEY,
        })
      );

      return json({ reportToken });
    }

    // GET /api/report/:token
    if (method === "GET" && path.match(/^\/api\/report\/[a-f0-9]+$/)) {
      const token = path.split("/")[3];

      const rl = await checkRateLimit(env.OFFER_KV, `fetch:${token}`, 60);
      if (!rl.allowed) return err("Rate limit exceeded", 429);

      const raw = await env.OFFER_KV.get(`report:${token}`);
      if (!raw) return err("Report not found", 404);

      const record = JSON.parse(raw) as KVRecord;
      if (!record.paid || !record.generated || !record.reportJson) {
        return err("Report not ready", 404);
      }

      // Increment usage
      record.usageCount = (record.usageCount || 0) + 1;
      await env.OFFER_KV.put(`report:${token}`, JSON.stringify(record), {
        expirationTtl: 60 * 60 * 24 * 90,
      });

      return json(record.reportJson);
    }

    // GET /api/report/:token/pdf
    if (method === "GET" && path.match(/^\/api\/report\/[a-f0-9]+\/pdf$/)) {
      const token = path.split("/")[3];

      const rl = await checkRateLimit(env.OFFER_KV, `pdf:${token}`, 20);
      if (!rl.allowed) return err("Rate limit exceeded", 429);

      const raw = await env.OFFER_KV.get(`report:${token}`);
      if (!raw) return err("Report not found", 404);

      const record = JSON.parse(raw) as KVRecord;
      if (!record.paid || !record.generated || !record.reportJson) {
        return err("Report not ready", 404);
      }

      const pdfBytes = generatePDF(record.reportJson);
      const safeName = record.reportJson.meta.offerName.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 40);

      return new Response(pdfBytes, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="offer-integrity-${safeName}.pdf"`,
          ...cors(),
        },
      });
    }

    // POST /api/stripe-webhook
    if (method === "POST" && path === "/api/stripe-webhook") {
      const body = await request.text();
      const sig = request.headers.get("stripe-signature") || "";

      const stripe = await import("stripe");
      const stripeClient = new (stripe.default)(env.STRIPE_SECRET_KEY, {
        httpClient: stripe.default.createFetchHttpClient(),
      });

      let event: any;
      try {
        event = await stripeClient.webhooks.constructEventAsync(
          body,
          sig,
          env.STRIPE_WEBHOOK_SECRET
        );
      } catch (e: any) {
        return err(`Webhook signature verification failed: ${e.message}`, 400);
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;
        if (session.payment_status === "paid") {
          const reportToken = session.metadata?.reportToken;
          if (reportToken) {
            const raw = await env.OFFER_KV.get(`report:${reportToken}`);
            if (raw) {
              const record = JSON.parse(raw) as KVRecord;
              if (!record.paid) {
                record.paid = true;
                await env.OFFER_KV.put(`report:${reportToken}`, JSON.stringify(record), {
                  expirationTtl: 60 * 60 * 24 * 90,
                });
              }
            }
          }
        }
      }

      return json({ received: true });
    }

    return err("Not found", 404);
  },
};
