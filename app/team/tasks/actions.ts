'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

const statusSchema = z.enum(['todo', 'in_progress', 'done'])

const teamTaskContentSchema = z.object({
  caption: z.string(),
  status: statusSchema,
})

type ActionResult = { success: true } | { success: false; error: string }

type OwnedTaskRecord = {
  id: string
  project_id: string
}

async function getOwnedTask(taskId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  if (user.app_metadata.role !== 'team_member') {
    throw new Error('Forbidden')
  }

  const { data: assignment, error } = await supabase
    .from('task_assignments')
    .select('tasks(id, project_id)')
    .eq('task_id', taskId)
    .eq('team_member_id', user.id)
    .maybeSingle<{ tasks: OwnedTaskRecord | null }>()

  if (error || !assignment?.tasks) {
    throw new Error('Task not found')
  }

  return {
    supabase,
    task: assignment.tasks,
  }
}

function revalidateTeamTaskViews(taskId: string) {
  revalidatePath('/team')
  revalidatePath(`/team/tasks/${taskId}`)
}

function revalidateAdminNotificationViews() {
  revalidatePath('/admin')
  revalidatePath('/admin/notifications')
  revalidatePath('/admin', 'layout')
}

export async function updateTeamTaskContentAction(
  taskId: string,
  values: { caption: string; status: 'todo' | 'in_progress' | 'done' }
): Promise<ActionResult> {
  try {
    const parsed = teamTaskContentSchema.safeParse(values)

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid task update',
      }
    }

    const { supabase } = await getOwnedTask(taskId)
    const { error } = await supabase
      .from('tasks')
      .update({ caption: parsed.data.caption || null, status: parsed.data.status })
      .eq('id', taskId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidateTeamTaskViews(taskId)

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unable to update task' }
  }
}

export async function updateTeamTaskFilePathAction(taskId: string, filePath: string): Promise<ActionResult> {
  try {
    const nextPath = z.string().trim().min(1, 'File path is required').safeParse(filePath)

    if (!nextPath.success) {
      return {
        success: false,
        error: nextPath.error.issues[0]?.message ?? 'Invalid file path',
      }
    }

    const { supabase } = await getOwnedTask(taskId)
    const { error } = await supabase
      .from('tasks')
      .update({ design_file_path: nextPath.data })
      .eq('id', taskId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidateTeamTaskViews(taskId)

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unable to update file path' }
  }
}

/**
 * Notify assigner action (D-05, D-06)
 * Creates an admin notification and marks the task as done.
 * Must be a separate explicit action, not bundled with status changes.
 */
export async function notifyAssignerAction(taskId: string): Promise<ActionResult> {
  try {
    const { supabase } = await getOwnedTask(taskId)

    // Fetch task title and team member name
    const [{ data: taskData }, { data: teamMemberData }] = await Promise.all([
      supabase.from('tasks').select('title').eq('id', taskId).single<{ title: string }>(),
      supabase.from('team_members').select('name').eq('id', (await supabase.auth.getUser()).data.user!.id).single<{ name: string }>(),
    ])

    if (!taskData || !teamMemberData) {
      return { success: false, error: 'Unable to fetch task or team member details' }
    }

    const message = `${teamMemberData.name} marked ${taskData.title} as done.`

    // Insert admin notification (team_member_id = NULL per D-06)
    const { error: notifyError } = await supabase
      .from('notifications')
      .insert({
        team_member_id: null,
        message,
        read: false,
      })

    if (notifyError) {
      return { success: false, error: notifyError.message }
    }

    // Mark task as done
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ status: 'done' })
      .eq('id', taskId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Revalidate all affected paths
    revalidateTeamTaskViews(taskId)
    revalidateAdminNotificationViews()

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unable to notify assigner' }
  }
}
