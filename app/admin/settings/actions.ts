'use server'

import { redirect } from 'next/navigation'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

export type UpdateProfileResult = {
  error?: string
  success?: string
}

export async function updateProfile(_prevState: UpdateProfileResult | null, formData: FormData): Promise<UpdateProfileResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const username = formData.get('username') as string
  const name = formData.get('name') as string
  const currentPassword = formData.get('current_password') as string
  const newPassword = formData.get('new_password') as string
  const confirmPassword = formData.get('confirm_password') as string

  // --- Update username & name in team_members (service role to bypass RLS) ---
  const serviceSupabase = createServiceRoleClient()
  const profileUpdates: { username?: string | null; name?: string } = {}

  const trimmedUsername = username.trim().toLowerCase() || null
  if (trimmedUsername !== null) {
    // Check uniqueness
    const { data: existing } = await serviceSupabase
      .from('team_members')
      .select('id')
      .eq('username', trimmedUsername)
      .neq('id', user.id)
      .maybeSingle()

    if (existing) {
      return { error: 'Username is already taken.' }
    }
    profileUpdates.username = trimmedUsername
  }

  const trimmedName = name?.trim()
  if (trimmedName) {
    profileUpdates.name = trimmedName
  }

  if (Object.keys(profileUpdates).length > 0) {
    const { error: profileError } = await serviceSupabase
      .from('team_members')
      .update(profileUpdates)
      .eq('id', user.id)

    if (profileError) {
      return { error: profileError.message }
    }
  }

  // --- Update email & password via Supabase Auth ---
  const authUpdates: { email?: string; password?: string } = {}

  const newEmail = formData.get('email') as string
  if (newEmail && newEmail !== user.email) {
    authUpdates.email = newEmail
  }

  if (currentPassword && newPassword) {
    if (newPassword.length < 6) {
      return { error: 'New password must be at least 6 characters.' }
    }
    if (newPassword !== confirmPassword) {
      return { error: 'New passwords do not match.' }
    }
    // Reauthenticate before changing password
    const { error: reauthError } = await supabase.auth.reauthenticate()
    if (reauthError) {
      return { error: 'Please log in again before changing your password.' }
    }
    authUpdates.password = newPassword
  }

  if (Object.keys(authUpdates).length > 0) {
    const { error: updateError } = await supabase.auth.updateUser(authUpdates)
    if (updateError) {
      if (updateError.message?.includes('confirm')) {
        return { success: 'Check your new email address to confirm the change.' }
      }
      return { error: updateError.message }
    }
  }

  return { success: 'Profile updated.' }
}
