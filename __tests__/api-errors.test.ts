import { describe, it, expect } from 'vitest'
import { apiError, apiSuccess, errors } from '@/lib/api/errors'

describe('API Errors', () => {
  describe('apiError', () => {
    it('returns a JSON response with error structure', async () => {
      const response = apiError('NOT_FOUND', 'Task not found', 404)
      expect(response.status).toBe(404)

      const body = await response.json()
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('NOT_FOUND')
      expect(body.error.message).toBe('Task not found')
    })

    it('includes details when provided', async () => {
      const response = apiError('VALIDATION_ERROR', 'Invalid input', 400, { field: 'name' })
      const body = await response.json()
      expect(body.error.details).toEqual({ field: 'name' })
    })
  })

  describe('apiSuccess', () => {
    it('returns a JSON response with data', async () => {
      const response = apiSuccess({ id: '123' })
      expect(response.status).toBe(200)

      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.data).toEqual({ id: '123' })
    })

    it('supports custom status codes', async () => {
      const response = apiSuccess({ created: true }, 201)
      expect(response.status).toBe(201)
    })

    it('includes meta when provided', async () => {
      const response = apiSuccess([], 200, { page: 1, limit: 20, total: 100 })
      const body = await response.json()
      expect(body.meta).toEqual({ page: 1, limit: 20, total: 100 })
    })
  })

  describe('error helpers', () => {
    it('unauthorized returns 401', async () => {
      const response = errors.unauthorized()
      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.error.code).toBe('UNAUTHORIZED')
    })

    it('forbidden returns 403', async () => {
      const response = errors.forbidden()
      expect(response.status).toBe(403)
    })

    it('notFound returns 404', async () => {
      const response = errors.notFound('Client')
      expect(response.status).toBe(404)
      const body = await response.json()
      expect(body.error.message).toBe('Client not found')
    })

    it('rateLimited returns 429', async () => {
      const response = errors.rateLimited()
      expect(response.status).toBe(429)
    })

    it('methodNotAllowed returns 405', async () => {
      const response = errors.methodNotAllowed(['GET', 'POST'])
      expect(response.status).toBe(405)
    })
  })
})
