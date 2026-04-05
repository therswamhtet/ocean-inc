import Link from 'next/link'
import { notFound } from 'next/navigation'

import { TaskEditForm } from './task-edit-form'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

type TaskRecord = {
  id: string
  project_id: string
  title: string
  briefing: string | null
  caption: string | null
  design_file_path: string | null
  posting_date: string | null
  due_date: string | null
  deadline: string | null
  status: 'todo' | 'in_progress' | 'done'
}

type TeamMemberRecord = {
  id: string
  name: string
  email: string
}

type ProjectRecord = {
  id: string
  name: string
  client_id: string
  clients: {
    id: string
    name: string
  } | null
}

type AssignmentRecord = {
  team_member_id: string
  team_members: {
    name: string
    email: string
  } | null
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ clientId: string; projectId: string; taskId: string }>
}) {
  const { clientId, projectId, taskId } = await params
  const supabase = await createClient()
  const serviceRoleClient = createServiceRoleClient()

  const [{ data: task, error: taskError }, { data: project, error: projectError }, { data: teamMembers, error: teamMembersError }, { data: assignment, error: assignmentError }] =
    await Promise.all([
      serviceRoleClient
        .from('tasks')
        .select('id, project_id, title, briefing, caption, design_file_path, posting_date, due_date, deadline, status')
        .eq('id', taskId)
        .eq('project_id', projectId)
        .single<TaskRecord>(),
      serviceRoleClient
        .from('projects')
        .select('id, name, client_id, clients(id, name)')
        .eq('id', projectId)
        .eq('client_id', clientId)
        .single<ProjectRecord>(),
      serviceRoleClient
        .from('team_members')
        .select('id, name, email')
        .order('name', { ascending: true })
        .returns<TeamMemberRecord[]>(),
      serviceRoleClient
        .from('task_assignments')
        .select('team_member_id, team_members(name, email)')
        .eq('task_id', taskId)
        .maybeSingle<AssignmentRecord>(),
    ])

  if (taskError || !task || projectError || !project) {
    notFound()
  }

  if (teamMembersError) {
    throw new Error(teamMembersError.message)
  }

  if (assignmentError && assignmentError.code !== 'PGRST116') {
    throw new Error(assignmentError.message)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link className="underline underline-offset-4" href="/admin/clients">
            Clients
          </Link>
          <span>{'>'}</span>
          <Link className="underline underline-offset-4" href={`/admin/clients/${clientId}`}>
            {project.clients?.name ?? 'Client'}
          </Link>
          <span>{'>'}</span>
          <Link className="underline underline-offset-4" href={`/admin/clients/${clientId}/projects/${projectId}`}>
            {project.name}
          </Link>
          <span>{'>'}</span>
          <span className="text-foreground">{task.title}</span>
        </nav>

        <div className="rounded-lg border border-border p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Task detail</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">{task.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Edit content details, update the assigned team member, and manage the latest design file.
          </p>
        </div>
      </div>

      <TaskEditForm
        clientId={clientId}
        projectId={projectId}
        task={{
          id: task.id,
          title: task.title,
          briefing: task.briefing,
          caption: task.caption,
          postingDate: task.posting_date,
          dueDate: task.due_date,
          deadline: task.deadline,
          status: task.status,
          designFilePath: task.design_file_path,
        }}
        teamMembers={teamMembers ?? []}
        initialAssignmentId={assignment?.team_member_id ?? null}
      />
    </div>
  )
}
