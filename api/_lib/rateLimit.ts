type RateLimitState = {
  count: number;
  resetAt: number;
};

const bucket = new Map<string, RateLimitState>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 12;

export function applyRateLimit(key: string) {
  const now = Date.now();
  const current = bucket.get(key);

  if (!current || current.resetAt <= now) {
    const next = {
      count: 1,
      resetAt: now + WINDOW_MS
    };
    bucket.set(key, next);
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      retryAfterSeconds: Math.ceil(WINDOW_MS / 1000)
    };
  }

  if (current.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000))
    };
  }

  current.count += 1;
  bucket.set(key, current);

  return {
    allowed: true,
    remaining: MAX_REQUESTS - current.count,
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000))
  };
}
