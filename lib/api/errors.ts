import { NextResponse } from 'next/server'
import type { ApiResponse, ApiErrorCode } from './types'

export function apiError(
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: unknown
): NextResponse {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  }
  return NextResponse.json(response, { status })
}

export const errors = {
  unauthorized: (message = 'Invalid or missing API key') =>
    apiError('UNAUTHORIZED', message, 401),
  forbidden: (message = 'Insufficient permissions') =>
    apiError('FORBIDDEN', message, 403),
  notFound: (resource = 'Resource') =>
    apiError('NOT_FOUND', `${resource} not found`, 404),
  validationError: (message: string, details?: unknown) =>
    apiError('VALIDATION_ERROR', message, 400, details),
  rateLimited: (message = 'Rate limit exceeded') =>
    apiError('RATE_LIMITED', message, 429),
  internalError: (message = 'Internal server error') =>
    apiError('INTERNAL_ERROR', message, 500),
  methodNotAllowed: (allowed: string[]) =>
    apiError('METHOD_NOT_ALLOWED', `Method not allowed. Allowed: ${allowed.join(', ')}`, 405),
}

export function apiSuccess<T>(data: T, status = 200, meta?: ApiResponse<T>['meta']): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  }
  return NextResponse.json(response, { status })
}
