'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

const taskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  briefing: z.string().optional(),
  caption: z.string().optional(),
  postingDate: z.string().optional(),
  dueDate: z.string().optional(),
  deadline: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']),
  designFilePath: z.string().optional(),
})

export type TaskFormData = z.infer<typeof taskSchema>

type StatusResult = { success: true } | { success: false; error: string }
type MutationResult = { success: true; taskId?: string } | { success: false; error: string }

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return createServiceRoleClient()
}

async function getProjectRoute(projectId: string) {
  const serviceClient = await requireAdmin()
  const { data: project, error } = await serviceClient
    .from('projects')
    .select('id, client_id')
    .eq('id', projectId)
    .single<{ id: string; client_id: string }>()

  if (error || !project) {
    throw new Error('Project not found')
  }

  return {
    serviceClient,
    project,
    projectPath: `/admin/clients/${project.client_id}/projects/${projectId}`,
  }
}

async function getTaskRoute(taskId: string) {
  const serviceClient = await requireAdmin()
  const { data: task, error } = await serviceClient
    .from('tasks')
    .select('id, project_id, projects(client_id)')
    .eq('id', taskId)
    .single<{ id: string; project_id: string; projects: { client_id: string } | null }>()

  if (error || !task || !task.projects?.client_id) {
    throw new Error('Task not found')
  }

  return {
    serviceClient,
    task,
    projectPath: `/admin/clients/${task.projects.client_id}/projects/${task.project_id}`,
    taskPath: `/admin/clients/${task.projects.client_id}/projects/${task.project_id}/tasks/${taskId}`,
  }
}

async function moveTaskDesignFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  taskId: string,
  designFilePath?: string
) {
  if (!designFilePath || !designFilePath.startsWith(`${projectId}/temp/`)) {
    return designFilePath ?? null
  }

  const fileName = designFilePath.split('/').pop()

  if (!fileName) {
    throw new Error('Uploaded file path is invalid')
  }

  const finalPath = `${projectId}/${taskId}/${fileName}`
  const storage = supabase.storage.from('design-files')

  const { error: copyError } = await storage.copy(designFilePath, finalPath)

  if (copyError) {
    throw new Error(copyError.message)
  }

  const { error: removeError } = await storage.remove([designFilePath])

  if (removeError) {
    throw new Error(removeError.message)
  }

  return finalPath
}

export async function createTaskAction(
  projectId: string,
  data: TaskFormData,
  assignedToTeamMemberId?: string | null
): Promise<MutationResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { serviceClient, projectPath } = await getProjectRoute(projectId)
    const parsed = taskSchema.safeParse(data)

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid task data' }
    }

    // Resolve 'self' to the admin's actual team_member_id
    let resolvedMemberId: string | null = assignedToTeamMemberId ?? null
    if (resolvedMemberId === 'self' || resolvedMemberId === '') {
      const email = user.email || user.user_metadata?.email || null
      const name = user.user_metadata?.full_name
        || user.user_metadata?.name
        || (email ? email.split('@')[0] : 'Admin')

      if (!email) {
        console.error('[createTaskAction] No email found for user')
      } else {
        // Try to find existing team member by email
        const { data: existing } = await serviceClient
          .from('team_members')
          .select('id')
          .eq('email', email)
          .maybeSingle()
        if (existing) {
          resolvedMemberId = existing.id
        } else {
          // Auto-create team member for this user
          const { data: newMember } = await serviceClient
            .from('team_members')
            .insert({ name, email })
            .select('id')
            .single()
          if (newMember) {
            resolvedMemberId = newMember.id
          }
        }
      }
    }

    const { data: task, error: insertError } = await serviceClient
      .from('tasks')
      .insert({
        project_id: projectId,
        title: parsed.data.title,
        briefing: parsed.data.briefing || null,
        caption: parsed.data.caption || null,
        posting_date: parsed.data.postingDate || null,
        due_date: parsed.data.dueDate || null,
        deadline: parsed.data.deadline || null,
        status: parsed.data.status,
        design_file_path: null,
      })
      .select('id')
      .single<{ id: string }>()

    if (insertError || !task) {
      return { success: false, error: insertError?.message ?? 'Unable to create task' }
    }

    try {
      const finalPath = await moveTaskDesignFile(serviceClient, projectId, task.id, parsed.data.designFilePath)

      const { error: updateFileError } = await serviceClient
        .from('tasks')
        .update({ design_file_path: finalPath })
        .eq('id', task.id)

      if (updateFileError) {
        throw new Error(updateFileError.message)
      }

      if (resolvedMemberId) {
        const { error: assignmentError } = await serviceClient.from('task_assignments').insert({
          task_id: task.id,
          team_member_id: resolvedMemberId,
        })

        if (assignmentError) {
          throw new Error(assignmentError.message)
        }
      }
    } catch (error) {
      const serviceRoleClient = createServiceRoleClient()
      await serviceRoleClient.from('tasks').delete().eq('id', task.id)
      return { success: false, error: error instanceof Error ? error.message : 'Unable to finish task setup' }
    }

    revalidatePath(projectPath)
    revalidatePath('/admin')

    return { success: true, taskId: task.id }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unable to create task' }
  }
}

export async function updateTaskAction(taskId: string, data: TaskFormData): Promise<MutationResult> {
  try {
    const { serviceClient, task, projectPath, taskPath } = await getTaskRoute(taskId)
    const parsed = taskSchema.safeParse(data)

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid task data' }
    }

    const nextDesignFilePath = await moveTaskDesignFile(
      serviceClient,
      task.project_id,
      taskId,
      parsed.data.designFilePath
    )

    const { error } = await serviceClient
      .from('tasks')
      .update({
        title: parsed.data.title,
        briefing: parsed.data.briefing || null,
        caption: parsed.data.caption || null,
        posting_date: parsed.data.postingDate || null,
        due_date: parsed.data.dueDate || null,
        deadline: parsed.data.deadline || null,
        status: parsed.data.status,
        design_file_path: nextDesignFilePath,
      })
      .eq('id', taskId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(taskPath)
    revalidatePath(projectPath)
    revalidatePath('/admin')

    return { success: true, taskId }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unable to update task' }
  }
}

export async function deleteTaskAction(
  taskId: string,
  projectId: string,
  designFilePath?: string
): Promise<MutationResult> {
  try {
    const { serviceClient, projectPath } = await getProjectRoute(projectId)

    if (designFilePath) {
      const { error: storageError } = await serviceClient.storage.from('design-files').remove([designFilePath])

      if (storageError) {
        return { success: false, error: storageError.message }
      }
    }

    const serviceRoleClient = createServiceRoleClient()
    const { error } = await serviceRoleClient.from('tasks').delete().eq('id', taskId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(projectPath)
    revalidatePath('/admin')

    return { success: true, taskId }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unable to delete task' }
  }
}

export async function updateTaskStatusAction(taskId: string, newStatus: 'todo' | 'in_progress' | 'done'): Promise<StatusResult> {
  try {
    const { serviceClient, projectPath, taskPath } = await getTaskRoute(taskId)

    const { error } = await serviceClient.from('tasks').update({ status: newStatus }).eq('id', taskId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(projectPath)
    revalidatePath(taskPath)
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unable to update task status' }
  }
}

export async function assignTaskToMemberAction(
  taskId: string,
  teamMemberId: string | null
): Promise<StatusResult> {
  try {
    // Resolve the logged-in user before proceeding
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let resolvedId: string | null = null

    if (teamMemberId === 'self' || teamMemberId === '') {
      const email = user?.email || user?.user_metadata?.email || null

      if (!email) {
        return { success: false, error: 'Could not resolve your team member record (no email found).' }
      }

      const serviceClient = createServiceRoleClient()

      // Try to find existing team member by email
      let selfMember = (await serviceClient
        .from('team_members')
        .select('id')
        .eq('email', email)
        .maybeSingle()).data

      // If not found, auto-create a team member record for this user
      if (!selfMember) {
        const name = user?.user_metadata?.full_name
          || (email.split('@')[0])
          || 'Team Member'

        const { data: newMember, error: createError } = await serviceClient
          .from('team_members')
          .insert({
            name,
            email,
          })
          .select('id')
          .single()

        if (createError || !newMember) {
          return { success: false, error: `Could not create your team member record: ${createError?.message || 'unknown error'}` }
        }
        selfMember = newMember
      }

      resolvedId = selfMember.id
    } else if (teamMemberId) {
      // Real UUID passed through
      resolvedId = teamMemberId
    }

    const { serviceClient, projectPath, taskPath } = await getTaskRoute(taskId)

    const { error: deleteError } = await serviceClient.from('task_assignments').delete().eq('task_id', taskId)

    if (deleteError) {
      return { success: false, error: deleteError.message }
    }

    if (resolvedId) {
      const { error: insertError } = await serviceClient.from('task_assignments').insert({
        task_id: taskId,
        team_member_id: resolvedId,
      })

      if (insertError) {
        return { success: false, error: insertError.message }
      }
    }

    revalidatePath(taskPath)
    revalidatePath(projectPath)
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unable to update assignment' }
  }
}

export async function updateTaskFilePathAction(taskId: string, filePath: string): Promise<StatusResult> {
  try {
    const { serviceClient, projectPath, taskPath } = await getTaskRoute(taskId)

    const { error } = await serviceClient
      .from('tasks')
      .update({ design_file_path: filePath })
      .eq('id', taskId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(taskPath)
    revalidatePath(projectPath)
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unable to update file path' }
  }
}
