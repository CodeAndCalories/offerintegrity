import { Env } from "./types";

export async function checkRateLimit(
  kv: KVNamespace,
  key: string,
  limit: number,
  windowSeconds: number = 3600
): Promise<{ allowed: boolean; remaining: number }> {
  const kvKey = `rl:${key}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - windowSeconds;

  const raw = await kv.get(kvKey);
  let timestamps: number[] = raw ? JSON.parse(raw) : [];

  // Remove old entries
  timestamps = timestamps.filter((t) => t > windowStart);

  if (timestamps.length >= limit) {
    return { allowed: false, remaining: 0 };
  }

  timestamps.push(now);
  await kv.put(kvKey, JSON.stringify(timestamps), { expirationTtl: windowSeconds });

  return { allowed: true, remaining: limit - timestamps.length };
}

export function getClientIP(request: Request): string {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0] ||
    "unknown"
  );
}
