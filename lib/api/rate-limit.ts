// Simple in-memory rate limiter
// For production with multiple instances, use Redis or Upstash

type RateLimitEntry = {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Cleanup every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)

export type RateLimitResult =
  | { limited: false; remaining: number; resetAt: number }
  | { limited: true; retryAfter: number }

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60 * 1000 // 1 minute
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(identifier)

  if (!entry || entry.resetAt < now) {
    // New window
    const resetAt = now + windowMs
    store.set(identifier, { count: 1, resetAt })
    return { limited: false, remaining: maxRequests - 1, resetAt }
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return { limited: true, retryAfter }
  }

  entry.count++
  return { limited: false, remaining: maxRequests - entry.count, resetAt: entry.resetAt }
}

export function getRateLimitHeaders(
  result: RateLimitResult
): Record<string, string> {
  if (result.limited) {
    return {
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': '0',
      'Retry-After': String(result.retryAfter),
    }
  }
  return {
    'X-RateLimit-Limit': '100',
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  }
}
