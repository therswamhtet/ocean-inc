'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=Invalid+email+or+password')
  }

  revalidatePath('/', 'layout')

  if (user?.app_metadata.role === 'team_member') {
    redirect('/team')
  }

  redirect('/admin')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
