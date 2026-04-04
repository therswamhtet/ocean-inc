'use server'

import crypto from 'node:crypto'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

export type GenerateInviteTokenResult =
  | { error: string }
  | { success: true; inviteUrl: string; token: string }

export async function generateInviteTokenAction(email: string): Promise<GenerateInviteTokenResult> {
  const normalizedEmail = String(email ?? '').trim().toLowerCase()

  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { error: 'A valid email address is required' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: existingMembers, error: existingMemberError } = await supabase
    .from('team_members')
    .select('id')
    .ilike('email', normalizedEmail)
    .limit(1)

  if (existingMemberError) {
    return { error: existingMemberError.message }
  }

  if ((existingMembers ?? []).length > 0) {
    return { error: 'This email already belongs to a team member' }
  }

  const token = crypto.randomBytes(16).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase.from('invite_tokens').insert({
    token,
    email: normalizedEmail,
    expires_at: expiresAt,
  })

  if (error) {
    return { error: error.message }
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
  const inviteUrl = `${siteUrl}/invite/${token}`

  revalidatePath('/admin/team')

  return {
    success: true,
    inviteUrl,
    token,
  }
}
