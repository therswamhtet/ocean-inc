import { createHash, randomBytes } from 'node:crypto'
import { createServiceRoleClient } from '@/lib/supabase/server'
import type { ApiKeyRecord, ApiPermission } from './types'

const KEY_PREFIX_LENGTH = 8
const KEY_SECRET_LENGTH = 48

export function generateApiKey(): { fullKey: string; prefix: string; hash: string } {
  const secret = randomBytes(KEY_SECRET_LENGTH).toString('hex')
  const prefix = randomBytes(KEY_PREFIX_LENGTH / 2).toString('hex')
  const fullKey = `${prefix}.${secret}`
  const hash = createHash('sha256').update(fullKey).digest('hex')
  return { fullKey, prefix, hash }
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

export async function validateApiKey(
  key: string
): Promise<{ valid: false } | { valid: true; apiKey: ApiKeyRecord }> {
  const hash = hashApiKey(key)
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key_hash', hash)
    .eq('is_active', true)
    .maybeSingle<ApiKeyRecord>()

  if (error || !data) {
    return { valid: false }
  }

  // Update last_used_at and request_count
  await supabase
    .from('api_keys')
    .update({
      last_used_at: new Date().toISOString(),
      request_count: data.request_count + 1,
    })
    .eq('id', data.id)

  return { valid: true, apiKey: data }
}

export function hasPermission(
  apiKey: ApiKeyRecord,
  permission: ApiPermission
): boolean {
  if (apiKey.permissions.includes('admin')) return true
  return apiKey.permissions.includes(permission)
}

export function requirePermission(
  apiKey: ApiKeyRecord,
  permission: ApiPermission
): boolean {
  return hasPermission(apiKey, permission)
}

export function parseBearerToken(header: string | null): string | null {
  if (!header) return null
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match ? match[1] : null
}
