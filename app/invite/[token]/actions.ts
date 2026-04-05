'use server'

import { createClient } from '@/lib/supabase/server'
import { validateToken } from '@/lib/invite/validate'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function checkUsernameAction(username: string): Promise<{
  available: boolean; error: string | null
}> {
  const cleaned = username.trim().toLowerCase()

  if (cleaned.length < 3) return { available: false, error: 'Must be at least 3 characters' }
  if (cleaned.length > 20) return { available: false, error: 'Must be 20 characters or less' }

  if (!/^[a-z0-9-]+$/.test(cleaned)) return { available: false, error: 'Only lowercase letters, numbers, and hyphens allowed' }

  const supabase = await createClient()
  const { data, error } = await supabase.from('team_members').select('id').eq('username', cleaned).maybeSingle()
  if (error) return { available: true, error: null }

  if (data) return { available: false, error: 'Username is already taken' }

  return { available: true, error: null }
}

export async function register(token: string, formData: FormData) {
  // Re-validate token (defense against race conditions)
  const validation = await validateToken(token)
  if (!validation.valid) {
    redirect(`/invite/${token}?error=${encodeURIComponent(validation.error)}`)
  }

  const name = formData.get('name') as string
  const username = String(formData.get('username') ?? '').trim().toLowerCase()
  const password = formData.get('password') as string

  if (!name || name.length < 2) {
    redirect(`/invite/${token}?error=${encodeURIComponent('Name must be at least 2 characters')}`)
  }

  if (username.length < 3 || username.length > 20) {
    redirect(`/invite/${token}?error=${encodeURIComponent('Username must be 3-20 characters')}`)
  }

  if (!/^[a-z0-9-]+$/.test(username)) {
    redirect(`/invite/${token}?error=${encodeURIComponent('Username can only contain letters, numbers, and hyphens')}`)
  }

  // Check uniqueness before insert
  const supabase = await createClient()
  const { data: existingUsername } = await supabase
    .from('team_members')
    .select('id')
    .eq('username', username)
    .maybeSingle()
  if (existingUsername) {
    redirect(`/invite/${token}?error=${encodeURIComponent('Username is already taken')}`)
  }

  if (!password || password.length < 8) {
    redirect(`/invite/${token}?error=${encodeURIComponent('Password must be at least 8 characters')}`)
  }

  // Create auth user with team_member role
  // Note: role is set in user metadata; a DB trigger syncs it to app_metadata for RLS
  const { data: authUser, error: authError } = await supabase.auth.signUp({
    email: validation.email,
    password: password,
    options: {
      data: { name, role: 'team_member' },
    },
  })

  if (authError || !authUser.user) {
    redirect(`/invite/${token}?error=${encodeURIComponent('Registration failed. Please try again.')}`)
  }

  // Create team_members row
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({
      id: authUser.user.id,
      email: validation.email,
      name: name,
      username: username,
    })

  if (memberError) {
    redirect(`/invite/${token}?error=${encodeURIComponent('Registration failed. Please try again.')}`)
  }

  // Mark token as used
  await supabase
    .from('invite_tokens')
    .update({ used: true })
    .eq('id', validation.tokenId)

  revalidatePath('/', 'layout')
  redirect('/admin')
}
