import "server-only";

// Best-effort, in-memory sliding-window rate limiter — the same idea as
// the inline limiter in /api/contact, extracted so new routes can share
// it. IMPORTANT: memory is per serverless instance on Vercel, so this
// slows casual abuse but is NOT a hard limit. Anything that must hold
// across instances needs a Postgres-side guard (see log_chat_query) or a
// shared store. Site-wide shared rate limiting is a known gap.

type Limiter = {
  /** Returns true if the request is allowed (and records it). */
  check: (key: string) => boolean;
};

const MAX_TRACKED_KEYS = 5000;

export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }): Limiter {
  const hits = new Map<string, number[]>();

  return {
    check(key) {
      const now = Date.now();
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return false;
      }
      recent.push(now);
      hits.set(key, recent);

      // Keep memory bounded on long-lived instances.
      if (hits.size > MAX_TRACKED_KEYS) {
        const oldest = hits.keys().next().value;
        if (oldest !== undefined) hits.delete(oldest);
      }
      return true;
    },
  };
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
