// API Types and Constants

export type ApiPermission =
  | 'read:clients'
  | 'write:clients'
  | 'read:projects'
  | 'write:projects'
  | 'read:tasks'
  | 'write:tasks'
  | 'read:team_members'
  | 'read:comments'
  | 'write:comments'
  | 'read:portal'
  | 'admin'

export const ALL_PERMISSIONS: ApiPermission[] = [
  'read:clients',
  'write:clients',
  'read:projects',
  'write:projects',
  'read:tasks',
  'write:tasks',
  'read:team_members',
  'read:comments',
  'write:comments',
  'read:portal',
  'admin',
]

export type ApiKeyRecord = {
  id: string
  name: string
  key_hash: string
  key_prefix: string
  permissions: ApiPermission[]
  is_active: boolean
  last_used_at: string | null
  request_count: number
  created_at: string
  updated_at: string
}

export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'METHOD_NOT_ALLOWED'
