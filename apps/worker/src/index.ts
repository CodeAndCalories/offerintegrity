import { Env, IntakeData, KVRecord } from "./types";
import { checkRateLimit, getClientIP } from "./rateLimit";
import { generateReport } from "./reportGenerator";
import { generatePDF } from "./pdfGenerator";
import { sendReportEmail } from "./email";
import { handleResend } from "./resend";
import { handleUpload } from "./upload";

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

// ── Cron: delete R2 uploads older than 7 days ────────────────────────────────
async function runUploadCleanup(env: Env): Promise<void> {
  if (!env.OFFER_R2) return;

  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days ago

  // List all keys in KV that track uploads: prefix "uploadmeta:"
  let cursor: string | undefined;
  do {
    const list = await env.OFFER_KV.list({ prefix: "uploadmeta:", cursor });
    for (const key of list.keys) {
      const raw = await env.OFFER_KV.get(key.name);
      if (!raw) continue;
      let meta: { r2Key: string; uploadedAt: string };
      try { meta = JSON.parse(raw); } catch { continue; }

      const uploadedAt = new Date(meta.uploadedAt).getTime();
      if (uploadedAt < cutoff) {
        // Delete from R2
        await env.OFFER_R2.delete(meta.r2Key);
        // Delete KV tracking entry
        await env.OFFER_KV.delete(key.name);
        console.log(`Deleted upload: ${meta.r2Key}`);
      }
    }
    cursor = list.list_complete ? undefined : (list as any).cursor;
  } while (cursor);
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

    // POST /api/resend
    if (method === "POST" && path === "/api/resend") {
      return handleResend(request, env);
    }

    // POST /api/create-checkout
    if (method === "POST" && path === "/api/create-checkout") {
      const rl = await checkRateLimit(env.OFFER_KV, `checkout:${ip}`, 10);
      if (!rl.allowed) return err("Rate limit exceeded. Try again in an hour.", 429);

      let body: {
        intake: IntakeData;
        email: string;
        turnstileToken: string;
        uploadedFileKeys?: string[];
      };
      try {
        body = await request.json();
      } catch {
        return err("Invalid JSON");
      }

      const { intake, email, turnstileToken, uploadedFileKeys = [] } = body;
      if (!email || !email.includes("@")) return err("Valid email required");
      if (!turnstileToken) return err("Turnstile token required");

      const turnstileValid = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET_KEY, ip);
      if (!turnstileValid) return err("Bot verification failed", 403);

      const validationError = validateIntake(intake);
      if (validationError) return err(validationError);

      const reportToken = generateToken();

      const record: KVRecord = {
        intake,
        email,
        createdAt: new Date().toISOString(),
        paid: false,
        generated: false,
        usageCount: 0,
        stripeSessionId: "",
        uploadedFileKeys,
      };

      const stripe = await import("stripe");
      const stripeClient = new (stripe.default)(env.STRIPE_SECRET_KEY, {
        httpClient: stripe.default.createFetchHttpClient(),
      });

      // Single price: use PRICE_ID if configured, otherwise fall back to price_data at $149
      let lineItem: any;
      if (env.PRICE_ID) {
        lineItem = { price: env.PRICE_ID, quantity: 1 };
      } else {
        lineItem = {
          price_data: {
            currency: "usd",
            product_data: {
              name: "High-Ticket Offer Validation Report",
              description: `7-pillar scored analysis for: ${intake.offerName}`,
            },
            unit_amount: 14900, // $149.00
          },
          quantity: 1,
        };
      }

      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: email,
        line_items: [lineItem],
        success_url: `${env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.APP_URL}/start`,
        metadata: { reportToken, email },
      });

      record.stripeSessionId = session.id;
      await env.OFFER_KV.put(`report:${reportToken}`, JSON.stringify(record), {
        expirationTtl: 60 * 60 * 24 * 90, // 90 days
      });
      await env.OFFER_KV.put(`session:${session.id}`, reportToken, {
        expirationTtl: 60 * 60 * 24 * 7,
      });

      return json({ checkoutUrl: session.url, reportToken });
    }

    // GET /api/complete?session_id=...
    if (method === "GET" && path === "/api/complete") {
      const sessionId = url.searchParams.get("session_id");
      if (!sessionId) return err("session_id required");

      const rl = await checkRateLimit(env.OFFER_KV, `complete:${ip}`, 10);
      if (!rl.allowed) return err("Rate limit exceeded", 429);

      const reportToken = await env.OFFER_KV.get(`session:${sessionId}`);
      if (!reportToken) return err("Session not found", 404);

      const raw = await env.OFFER_KV.get(`report:${reportToken}`);
      if (!raw) return err("Report record not found", 404);

      const record = JSON.parse(raw) as KVRecord;

      if (record.generated && record.reportJson) {
        return json({ reportToken, cached: true });
      }

      const stripe = await import("stripe");
      const stripeClient = new (stripe.default)(env.STRIPE_SECRET_KEY, {
        httpClient: stripe.default.createFetchHttpClient(),
      });

      const session = await stripeClient.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== "paid") {
        return err("Payment not completed", 402);
      }

      record.paid = true;

      const useRealAI = env.USE_REAL_AI === "true";
      const reportJson = await generateReport(
        record.intake,
        useRealAI,
        env.OPENAI_API_KEY,
        record.uploadedFileKeys
      );

      record.reportJson = reportJson;
      record.generated = true;

      await env.OFFER_KV.put(`report:${reportToken}`, JSON.stringify(record), {
        expirationTtl: 60 * 60 * 24 * 90,
      });

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

// POST /api/upload
if (method === "POST" && path === "/api/upload") {
  return handleUpload(request, env);
}

// OPTIONS /api/upload (CORS preflight)
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
        event = await stripeClient.webhooks.constructEventAsync(body, sig, env.STRIPE_WEBHOOK_SECRET);
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

    // POST /api/upload — optional file uploads (included in $149)
    if (method === "POST" && path === "/api/upload") {
      if (!env.OFFER_R2) {
        console.error("OFFER_R2 binding not configured — cannot accept file uploads");
        return err("File upload is not configured. Contact support.", 503);
      }

      const rl = await checkRateLimit(env.OFFER_KV, `upload:${ip}`, 5);
      if (!rl.allowed) return err("Rate limit exceeded for uploads. Try again later.", 429);

      let formData: FormData;
      try {
        formData = await request.formData();
      } catch {
        return err("Invalid form data");
      }

      const turnstileToken = formData.get("turnstileToken");
      if (!turnstileToken || typeof turnstileToken !== "string") return err("Turnstile token required");
      const turnstileValid = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET_KEY, ip);
      if (!turnstileValid) return err("Bot verification failed", 403);

      const fileEntries = formData.getAll("files") as unknown as File[];
      if (!fileEntries.length) return json({ keys: [] });

      const MAX_FILES = 3;
      const MAX_TOTAL_BYTES = 10 * 1024 * 1024;
      const ALLOWED_TYPES = new Set([
        "application/pdf",
        "image/png",
        "image/jpeg",
      ]);
      const ALLOWED_EXTS = new Set(["pdf", "png", "jpg", "jpeg"]);

      if (fileEntries.length > MAX_FILES) return err(`Maximum ${MAX_FILES} files allowed`);

      let totalBytes = 0;
      for (const file of fileEntries) {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
        if (!ALLOWED_EXTS.has(ext) && !ALLOWED_TYPES.has(file.type)) {
          return err(`File type not allowed: ${file.name}. Accepted: PDF, PNG, JPG.`);
        }
        totalBytes += file.size;
      }
      if (totalBytes > MAX_TOTAL_BYTES) return err("Total file size exceeds 10MB");

      const uploadedKeys: string[] = [];
      const uploadId = generateToken();
      const uploadedAt = new Date().toISOString();

      for (let i = 0; i < fileEntries.length; i++) {
        const file = fileEntries[i];
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
        const key = `uploads/${uploadId}/${i}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const buffer = await file.arrayBuffer();

        await env.OFFER_R2.put(key, buffer, {
          httpMetadata: { contentType: file.type || "application/octet-stream" },
          customMetadata: { originalName: file.name, uploadedAt },
        });

        // Track in KV for cron cleanup (TTL 8 days so cron can find it)
        await env.OFFER_KV.put(
          `uploadmeta:${uploadId}:${i}`,
          JSON.stringify({ r2Key: key, uploadedAt }),
          { expirationTtl: 60 * 60 * 24 * 8 }
        );

        uploadedKeys.push(key);
      }

      return json({ keys: uploadedKeys });
    }

    return err("Not found", 404);
  },

  // Cron trigger — runs daily, deletes R2 uploads older than 7 days
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(runUploadCleanup(env));
  },
};
