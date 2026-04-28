import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, parseBearerToken, hasPermission } from './auth'
import { checkRateLimit, getRateLimitHeaders } from './rate-limit'
import { errors } from './errors'
import type { ApiPermission } from './types'

export type ApiContext = {
  apiKeyId: string
  permissions: ApiPermission[]
}

// Next.js App Router dynamic route context
export type RouteContext<T = Record<string, string>> = {
  params: Promise<T>
}

export type ApiHandler<T = Record<string, string>> = (
  request: NextRequest,
  context: ApiContext,
  routeContext: RouteContext<T>
) => Promise<NextResponse> | NextResponse

export function withApiAuth<T = Record<string, string>>(
  handler: ApiHandler<T>,
  requiredPermission?: ApiPermission
) {
  return async (
    request: NextRequest,
    routeContext: RouteContext<T>
  ): Promise<NextResponse> => {
    // Rate limiting by IP + path
    const ip = request.headers.get('x-forwarded-for') ??
               request.headers.get('x-real-ip') ??
               'unknown'
    const rateLimitKey = `${ip}:${request.nextUrl.pathname}`
    const rateLimitResult = checkRateLimit(rateLimitKey, 100, 60 * 1000)

    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult)

    if (rateLimitResult.limited) {
      return errors.rateLimited(`Rate limit exceeded. Retry after ${rateLimitResult.retryAfter}s`)
    }

    // API Key authentication
    const authHeader = request.headers.get('authorization')
    const token = parseBearerToken(authHeader)

    if (!token) {
      const response = errors.unauthorized('Missing API key. Use: Authorization: Bearer <key>')
      applyHeaders(response, rateLimitHeaders)
      return response
    }

    const validation = await validateApiKey(token)

    if (!validation.valid) {
      const response = errors.unauthorized('Invalid or revoked API key')
      applyHeaders(response, rateLimitHeaders)
      return response
    }

    const apiKey = validation.apiKey

    // Permission check
    if (requiredPermission && !hasPermission(apiKey, requiredPermission)) {
      const response = errors.forbidden(
        `This endpoint requires '${requiredPermission}' permission`
      )
      applyHeaders(response, rateLimitHeaders)
      return response
    }

    const context: ApiContext = {
      apiKeyId: apiKey.id,
      permissions: apiKey.permissions,
    }

    try {
      const response = await handler(request, context, routeContext)
      applyHeaders(response, rateLimitHeaders)
      return response
    } catch (err) {
      console.error('[API Error]', err)
      const response = errors.internalError(
        err instanceof Error ? err.message : 'Internal server error'
      )
      applyHeaders(response, rateLimitHeaders)
      return response
    }
  }
}

function applyHeaders(response: NextResponse, headers: Record<string, string>) {
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value)
  }
}

// Helper to extract pagination from URL
export function getPagination(request: NextRequest): { page: number; limit: number; offset: number } {
  const url = new URL(request.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20', 10)))
  const offset = (page - 1) * limit
  return { page, limit, offset }
}
