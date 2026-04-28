import { describe, it, expect } from 'vitest'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/api/rate-limit'

describe('Rate Limiting', () => {
  // Use unique identifiers per test to avoid interference

  describe('checkRateLimit', () => {
    it('allows requests under the limit', () => {
      const result = checkRateLimit('test-1', 5, 60000)
      expect(result.limited).toBe(false)
      if (!result.limited) {
        expect(result.remaining).toBe(4)
      }
    })

    it('tracks request count', () => {
      const id = 'test-2'
      checkRateLimit(id, 5, 60000)
      checkRateLimit(id, 5, 60000)
      const result = checkRateLimit(id, 5, 60000)
      expect(result.limited).toBe(false)
      if (!result.limited) {
        expect(result.remaining).toBe(2)
      }
    })

    it('blocks requests over the limit', () => {
      const id = 'test-3'
      for (let i = 0; i < 5; i++) {
        checkRateLimit(id, 5, 60000)
      }
      const result = checkRateLimit(id, 5, 60000)
      expect(result.limited).toBe(true)
      if (result.limited) {
        expect(result.retryAfter).toBeGreaterThan(0)
      }
    })

    it('resets after window expires', () => {
      const id = 'test-4'
      checkRateLimit(id, 5, 1) // 1ms window

      // Wait for window to expire
      const start = Date.now()
      while (Date.now() - start < 10) {} // Small busy-wait

      const result = checkRateLimit(id, 5, 1)
      expect(result.limited).toBe(false)
    })
  })

  describe('getRateLimitHeaders', () => {
    it('returns limited headers', () => {
      const result = { limited: true as const, retryAfter: 30 }
      const headers = getRateLimitHeaders(result)
      expect(headers['X-RateLimit-Remaining']).toBe('0')
      expect(headers['Retry-After']).toBe('30')
    })

    it('returns available headers', () => {
      const result = { limited: false as const, remaining: 42, resetAt: Date.now() + 60000 }
      const headers = getRateLimitHeaders(result)
      expect(headers['X-RateLimit-Remaining']).toBe('42')
      expect(headers['X-RateLimit-Reset']).toBeDefined()
    })
  })
})
