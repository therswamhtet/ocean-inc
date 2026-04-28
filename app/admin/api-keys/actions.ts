'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { generateApiKey } from '@/lib/api/auth'
import type { ApiKeyRecord, ApiPermission } from '@/lib/api/types'

export async function createApiKeyAction(
  name: string,
  permissions: ApiPermission[]
): Promise<{ success: true; key: string } | { success: false; error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { fullKey, prefix, hash } = generateApiKey()

  const serviceRoleClient = createServiceRoleClient()
  const { error } = await serviceRoleClient
    .from('api_keys')
    .insert({
      name: name.trim(),
      key_hash: hash,
      key_prefix: prefix,
      permissions,
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/api-keys')
  return { success: true, key: fullKey }
}

export async function revokeApiKeyAction(keyId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const serviceRoleClient = createServiceRoleClient()
  const { error } = await serviceRoleClient
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', keyId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/api-keys')
  return { success: true }
}

export async function deleteApiKeyAction(keyId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const serviceRoleClient = createServiceRoleClient()
  const { error } = await serviceRoleClient
    .from('api_keys')
    .delete()
    .eq('id', keyId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/api-keys')
  return { success: true }
}

export async function getApiKeysAction(): Promise<
  { success: true; keys: ApiKeyRecord[] } | { success: false; error: string }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const serviceRoleClient = createServiceRoleClient()
  const { data, error } = await serviceRoleClient
    .from('api_keys')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<ApiKeyRecord[]>()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, keys: data ?? [] }
}
