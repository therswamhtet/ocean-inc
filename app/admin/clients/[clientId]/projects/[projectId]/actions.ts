'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

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

  return supabase
}

async function getProjectRoute(projectId: string) {
  const supabase = await requireAdmin()
  const { data: project, error } = await supabase
    .from('projects')
    .select('id, client_id')
    .eq('id', projectId)
    .single<{ id: string; client_id: string }>()

  if (error || !project) {
    throw new Error('Project not found')
  }

  return {
    supabase,
    project,
    projectPath: `/admin/clients/${project.client_id}/projects/${projectId}`,
  }
}

async function getTaskRoute(taskId: string) {
  const supabase = await requireAdmin()
  const { data: task, error } = await supabase
    .from('tasks')
    .select('id, project_id, projects(client_id)')
    .eq('id', taskId)
    .single<{ id: string; project_id: string; projects: { client_id: string } | null }>()

  if (error || !task || !task.projects?.client_id) {
    throw new Error('Task not found')
  }

  return {
    supabase,
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
    const { supabase, projectPath } = await getProjectRoute(projectId)
    const parsed = taskSchema.safeParse(data)

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid task data' }
    }

    const { data: task, error: insertError } = await supabase
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
      const finalPath = await moveTaskDesignFile(supabase, projectId, task.id, parsed.data.designFilePath)

      const { error: updateFileError } = await supabase
        .from('tasks')
        .update({ design_file_path: finalPath })
        .eq('id', task.id)

      if (updateFileError) {
        throw new Error(updateFileError.message)
      }

      if (assignedToTeamMemberId) {
        const { error: assignmentError } = await supabase.from('task_assignments').insert({
          task_id: task.id,
          team_member_id: assignedToTeamMemberId,
        })

        if (assignmentError) {
          throw new Error(assignmentError.message)
        }
      }
    } catch (error) {
      await supabase.from('tasks').delete().eq('id', task.id)
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
    const { supabase, task, projectPath, taskPath } = await getTaskRoute(taskId)
    const parsed = taskSchema.safeParse(data)

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid task data' }
    }

    const nextDesignFilePath = await moveTaskDesignFile(
      supabase,
      task.project_id,
      taskId,
      parsed.data.designFilePath
    )

    const { error } = await supabase
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
    const { supabase, projectPath } = await getProjectRoute(projectId)

    if (designFilePath) {
      const { error: storageError } = await supabase.storage.from('design-files').remove([designFilePath])

      if (storageError) {
        return { success: false, error: storageError.message }
      }
    }

    const { error } = await supabase.from('tasks').delete().eq('id', taskId)

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
    const { supabase, projectPath, taskPath } = await getTaskRoute(taskId)

    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)

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
    const { supabase, projectPath, taskPath } = await getTaskRoute(taskId)

    const { error: deleteError } = await supabase.from('task_assignments').delete().eq('task_id', taskId)

    if (deleteError) {
      return { success: false, error: deleteError.message }
    }

    if (teamMemberId) {
      const { error: insertError } = await supabase.from('task_assignments').insert({
        task_id: taskId,
        team_member_id: teamMemberId,
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
    const { supabase, projectPath, taskPath } = await getTaskRoute(taskId)

    const { error } = await supabase
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
