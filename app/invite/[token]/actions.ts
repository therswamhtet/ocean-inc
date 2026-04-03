'use server'

import { createClient } from '@/lib/supabase/server'
import { validateToken } from '@/lib/invite/validate'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function register(token: string, formData: FormData) {
  // Re-validate token (defense against race conditions)
  const validation = await validateToken(token)
  if (!validation.valid) {
    redirect(`/invite/${token}?error=${encodeURIComponent(validation.error)}`)
  }

  const name = formData.get('name') as string
  const password = formData.get('password') as string

  if (!name || name.length < 2) {
    redirect(`/invite/${token}?error=${encodeURIComponent('Name must be at least 2 characters')}`)
  }

  if (!password || password.length < 8) {
    redirect(`/invite/${token}?error=${encodeURIComponent('Password must be at least 8 characters')}`)
  }

  const supabase = await createClient()

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
