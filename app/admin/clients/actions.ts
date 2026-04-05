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
  const color = String(formData.get('color') ?? '#3B82F6').trim()

  if (name.length < MIN_CLIENT_NAME_LENGTH) {
    redirect(`/admin/clients?error=${encodeError('Client name must be at least 2 characters.')}`)
  }

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt += 1) {
    const slug = crypto.randomBytes(8).toString('hex')
    const { error } = await supabase.from('clients').insert({ name, slug, color })

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

type Client = { id: string; name: string; color: string }
type Project = { id: string; name: string; month: string; year: number }
type TeamMember = { id: string; name: string; email: string }

export async function getClientsAction(): Promise<
  { success: true; clients: Client[] } | { success: false; error: string }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('clients')
    .select('id, name, color')
    .order('name', { ascending: true })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, clients: data ?? [] }
}

export async function getProjectsAction(
  clientId: string,
): Promise<{ success: true; projects: Project[] } | { success: false; error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('projects')
    .select('id, name, month, year')
    .eq('client_id', clientId)
    .eq('status', 'active')
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, projects: data ?? [] }
}

export async function getTeamMembersAction(): Promise<
  { success: true; teamMembers: TeamMember[] } | { success: false; error: string }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('team_members')
    .select('id, name, email')
    .order('name', { ascending: true })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, teamMembers: data ?? [] }
}

export async function getAdminDataAction(): Promise<{
  success: true
  clients: Client[]
  projects: Project[]
  teamMembers: TeamMember[]
} | { success: false; error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: clientsData, error: clientsError } = await supabase
    .from('clients')
    .select('id, name, color')
    .order('name', { ascending: true })

  const { data: teamMembersData, error: teamMembersError } = await supabase
    .from('team_members')
    .select('id, name, email')
    .order('name', { ascending: true })

  if (clientsError) {
    return { success: false, error: clientsError.message }
  }

  if (teamMembersError) {
    return { success: false, error: teamMembersError.message }
  }

  return {
    success: true,
    clients: clientsData ?? [],
    teamMembers: teamMembersData ?? [],
    projects: [],
  }
}
