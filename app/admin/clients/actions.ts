'use server'

import crypto from 'node:crypto'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

const MIN_CLIENT_NAME_LENGTH = 2
const SLUG_BYTES = 8
const MAX_SLUG_ATTEMPTS = 3

function encodeError(message: string) {
  return encodeURIComponent(message)
}

export async function createClientAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const name = String(formData.get('name') ?? '').trim()

  if (name.length < MIN_CLIENT_NAME_LENGTH) {
    redirect(`/admin/clients?error=${encodeError('Client name must be at least 2 characters.')}`)
  }

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt += 1) {
    const slug = crypto.randomBytes(8).toString('hex')
    const { error } = await supabase.from('clients').insert({ name, slug })

    if (!error) {
      revalidatePath('/admin/clients')
      redirect('/admin/clients?created=1')
    }

    if (error.code !== '23505') {
      redirect(`/admin/clients?error=${encodeError(error.message)}`)
    }
  }

  redirect(`/admin/clients?error=${encodeError('Could not generate a unique client slug. Please try again.')}`)
}

export async function deleteClientAction(clientId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase.from('clients').delete().eq('id', clientId)

  if (error) {
    redirect(`/admin/clients?error=${encodeError(error.message)}`)
  }

  revalidatePath('/admin/clients')
  redirect('/admin/clients?deleted=1')
}
