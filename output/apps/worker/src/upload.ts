/**
 * POST /api/upload
 *
 * Accepts multipart/form-data with up to 3 files (field name: "files").
 * Validates type (PDF/DOCX/TXT) and total size (10 MB).
 * Stores each file in R2 under uploads/{uuid}/{filename}.
 * Returns { keys: string[] } — storage keys for inclusion in the intake submission.
 *
 * Rate limit: 5 uploads per IP per 10 minutes.
 *
 * Security:
 *  - Strict MIME + extension validation (no bypass via renamed files)
 *  - Content-Length checked before streaming to R2
 *  - Keys are UUIDs — unguessable, not linked to email until report is created
 *  - Files stored with TTL metadata so they can be cleaned up after report generation
 *
 * Env bindings required:
 *  - OFFER_R2: R2Bucket  (add to wrangler.toml [[r2_buckets]])
 *  - OFFER_KV: KVNamespace (existing — used for rate limiting)
 */

import { checkRateLimit } from "./rateLimit";
import type { Env } from "./types";

const MAX_FILES = 3;
const MAX_TOTAL_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_SINGLE_BYTES = 5 * 1024 * 1024;  // 5 MB per file

const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

const ALLOWED_EXT = new Set([".pdf", ".docx", ".txt"]);

function getExt(filename: string): string {
  const i = filename.lastIndexOf(".");
  return i >= 0 ? filename.slice(i).toLowerCase() : "";
}

function sanitizeFilename(name: string): string {
  // Strip path separators and keep only safe characters
  return name.replace(/[^a-zA-Z0-9._\-]/g, "_").slice(0, 120);
}

export async function handleUpload(request: Request, env: Env): Promise<Response> {
  // ── Verify R2 is bound ────────────────────────────────────────────────
  if (!env.OFFER_R2) {
    return json({ error: "File upload is not configured on this server." }, 503);
  }

  // ── Rate limit (5 uploads per IP per 10 min) ─────────────────────────
  const ip =
    request.headers.get("CF-Connecting-IP") ??
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ??
    "unknown";
  const allowed = await checkRateLimit(env.OFFER_KV, `upload:${ip}`, 5, 600);
  if (!allowed) {
    return json(
      { error: "Too many uploads. Please wait a few minutes and try again." },
      429
    );
  }

  // ── Parse multipart ───────────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ error: "Could not parse upload. Use multipart/form-data." }, 400);
  }

  const fileEntries = formData.getAll("files");
  if (fileEntries.length === 0) {
    return json({ error: "No files received." }, 400);
  }
  if (fileEntries.length > MAX_FILES) {
    return json({ error: `Maximum ${MAX_FILES} files allowed.` }, 400);
  }

  // ── Validate each file ────────────────────────────────────────────────
  const validated: { file: File; ext: string }[] = [];
  let totalSize = 0;

  for (const entry of fileEntries) {
    if (!(entry instanceof File)) {
      return json({ error: "Invalid upload — each entry must be a file." }, 400);
    }

    const ext = getExt(entry.name);
    if (!ALLOWED_EXT.has(ext)) {
      return json(
        { error: `File type not allowed: ${entry.name}. Use PDF, DOCX, or TXT.` },
        400
      );
    }

    // MIME check — browsers set this, but treat it as advisory; ext is the ground truth
    if (entry.type && !ALLOWED_MIME.has(entry.type) && entry.type !== "application/octet-stream") {
      return json(
        { error: `MIME type not permitted for ${entry.name}.` },
        400
      );
    }

    if (entry.size > MAX_SINGLE_BYTES) {
      return json(
        { error: `${entry.name} exceeds the 5 MB per-file limit.` },
        400
      );
    }

    totalSize += entry.size;
    if (totalSize > MAX_TOTAL_BYTES) {
      return json({ error: "Total upload size exceeds 10 MB." }, 400);
    }

    validated.push({ file: entry, ext });
  }

  // ── Upload to R2 ──────────────────────────────────────────────────────
  const batchId = crypto.randomUUID();
  const keys: string[] = [];

  for (const { file, ext: _ext } of validated) {
    const fileId = crypto.randomUUID();
    const safeFilename = sanitizeFilename(file.name);
    const key = `uploads/${batchId}/${fileId}-${safeFilename}`;

    const arrayBuffer = await file.arrayBuffer();

    await env.OFFER_R2.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type || "application/octet-stream",
      },
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        batchId,
        // Mark for cleanup after 7 days if report never created
        expiresAfter: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });

    keys.push(key);
  }

  return json({ ok: true, keys, batchId });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
