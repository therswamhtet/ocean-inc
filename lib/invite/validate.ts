import { createClient } from '@/lib/supabase/server'

export type TokenValidation =
  | { valid: true; email: string; tokenId: string }
  | { valid: false; error: string }

export async function validateToken(token: string): Promise<TokenValidation> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('invite_tokens')
    .select('id, email, used, expires_at')
    .eq('token', token)
    .single()

  if (error || !data) {
    return { valid: false, error: 'Invalid invite link. Please contact your admin for a new one.' }
  }

  if (data.used) {
    return { valid: false, error: 'This invite link has already been used. Please contact your admin for a new one.' }
  }

  if (new Date(data.expires_at) < new Date()) {
    return { valid: false, error: 'This invite link has expired. Please contact your admin for a new one.' }
  }

  return { valid: true, email: data.email, tokenId: data.id }
}
