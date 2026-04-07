'use server'

import crypto from 'node:crypto'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

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

  const serviceRoleClient = createServiceRoleClient()
  const name = String(formData.get('name') ?? '').trim()
  const color = String(formData.get('color') ?? '#3B82F6').trim()
  const descriptionRaw = String(formData.get('description') ?? '').trim()
  const description = descriptionRaw.length > 0 ? descriptionRaw : null

  if (name.length < MIN_CLIENT_NAME_LENGTH) {
    redirect(`/admin/clients?error=${encodeError('Client name must be at least 2 characters.')}`)
  }

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt += 1) {
    const slug = crypto.randomBytes(8).toString('hex')
    const { error } = await serviceRoleClient.from('clients').insert({ name, slug, color, description })

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

  const serviceRoleClient = createServiceRoleClient()
  const { error } = await serviceRoleClient.from('clients').delete().eq('id', clientId)

  if (error) {
    redirect(`/admin/clients?error=${encodeError(error.message)}`)
  }

  revalidatePath('/admin/clients')
  redirect('/admin/clients?deleted=1')
}

type Client = { id: string; name: string; color: string; description: string | null; is_active: boolean }
type Project = { id: string; name: string; month: string; year: number }
type TeamMember = { id: string; name: string; email: string; username: string | null }

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

  const serviceRoleClient = createServiceRoleClient()
  const { data, error } = await serviceRoleClient
    .from('clients')
    .select('id, name, color, description, is_active')
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

  const { data, error } = await createServiceRoleClient()
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

  const { data, error } = await createServiceRoleClient()
    .from('team_members')
    .select('id, name, email, username')
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

  const serviceRoleClient = createServiceRoleClient()
  const { data: clientsData, error: clientsError } = await serviceRoleClient
    .from('clients')
    .select('id, name, color, description, is_active')
    .order('name', { ascending: true })

  const { data: teamMembersData, error: teamMembersError } = await serviceRoleClient
    .from('team_members')
    .select('id, name, email, username')
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

export async function toggleClientStatusAction(clientId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const serviceRoleClient = createServiceRoleClient()

  const { data: current, error: fetchError } = await serviceRoleClient
    .from('clients')
    .select('is_active')
    .eq('id', clientId)
    .maybeSingle()

  if (fetchError || !current) {
    return { success: false, error: 'Client not found' }
  }

  const { error: updateError } = await serviceRoleClient
    .from('clients')
    .update({ is_active: !current.is_active })
    .eq('id', clientId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  revalidatePath('/admin/clients')
  return { success: true }
}

export async function toggleClientStatusActionWrapper(formData: FormData) {
  const clientId = formData.get('clientId') as string
  if (!clientId) {
    return
  }
  await toggleClientStatusAction(clientId)
}

// ---- comment CRUD for admin ----

type CommentActionResult = { success: true } | { success: false; error: string }

export async function adminPostCommentAction(
  taskId: string,
  content: string,
  isRevision: boolean = false
): Promise<CommentActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const trimmed = content.trim()
  if (trimmed.length < 1) {
    return { success: false, error: 'Comment must not be empty' }
  }

  // Verify task exists
  const { data: taskData } = await createServiceRoleClient()
    .from('tasks')
    .select('title, project_id')
    .eq('id', taskId)
    .single()

  if (!taskData) {
    return { success: false, error: 'Task not found' }
  }

  const { error: insertError } = await createServiceRoleClient()
    .from('comments')
    .insert({
      task_id: taskId,
      team_member_id: null,
      content: trimmed,
      is_revision: isRevision,
    })

  if (insertError) {
    return { success: false, error: insertError.message }
  }

  const { data: adminData } = await createServiceRoleClient()
    .from('team_members')
    .select('name')
    .eq('id', user.id)
    .maybeSingle<{ name: string }>()

  await createServiceRoleClient().from('notifications').insert({
    team_member_id: null,
    message: isRevision
      ? `🔴 ${adminData?.name ?? 'Admin'} requested revision on task ${taskData.title}`
      : `💬 ${adminData?.name ?? 'Admin'} commented on task ${taskData.title}`,
    read: false,
  })

  revalidatePath('/admin')
  return { success: true }
}

export async function adminEditCommentAction(
  commentId: string,
  content: string
): Promise<CommentActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const trimmed = content.trim()
  if (trimmed.length < 1) {
    return { success: false, error: 'Comment must not be empty' }
  }

  const { data: comment } = await createServiceRoleClient()
    .from('comments')
    .select('task_id')
    .eq('id', commentId)
    .maybeSingle<{ task_id: string }>()

  if (!comment) {
    return { success: false, error: 'Comment not found' }
  }

  const { error: updateError } = await createServiceRoleClient()
    .from('comments')
    .update({ content: trimmed })
    .eq('id', commentId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function adminDeleteCommentAction(
  commentId: string
): Promise<CommentActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: comment } = await createServiceRoleClient()
    .from('comments')
    .select('task_id')
    .eq('id', commentId)
    .maybeSingle<{ task_id: string }>()

  if (!comment) {
    return { success: false, error: 'Comment not found' }
  }

  const { error: deleteError } = await createServiceRoleClient()
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (deleteError) {
    return { success: false, error: deleteError.message }
  }

  revalidatePath('/admin')
  return { success: true }
}
