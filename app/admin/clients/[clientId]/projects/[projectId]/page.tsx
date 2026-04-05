import Link from 'next/link'
import { notFound } from 'next/navigation'

import { TaskViewToggle, type TaskRow } from './task-view-toggle'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

type ProjectRecord = {
  id: string
  name: string
  client_id: string
  clients: {
    id: string
    name: string
  } | null
}

type TaskRecord = {
  id: string
  title: string
  briefing: string | null
  caption: string | null
  design_file_path: string | null
  posting_date: string | null
  due_date: string | null
  deadline: string | null
  status: 'todo' | 'in_progress' | 'done'
  created_at: string
  task_assignments:
    | Array<{
        team_members: {
          name: string | null
          username: string | null
        } | null
      }>
    | null
}

export default async function ProjectTasksPage({
  params,
}: {
  params: Promise<{ clientId: string; projectId: string }>
}) {
  const { clientId, projectId } = await params
  const supabase = await createClient()
  const serviceRoleClient = createServiceRoleClient()

  const { data: project, error: projectError } = await serviceRoleClient
    .from('projects')
    .select('id, name, client_id, clients(id, name)')
    .eq('id', projectId)
    .eq('client_id', clientId)
    .single<ProjectRecord>()

  if (projectError || !project) {
    notFound()
  }

  const { data: tasks, error: tasksError } = await serviceRoleClient
    .from('tasks')
    .select(
      'id, title, briefing, caption, design_file_path, posting_date, due_date, deadline, status, created_at, task_assignments(team_members(name, username))'
    )
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .returns<TaskRecord[]>()

  if (tasksError) {
    throw new Error(tasksError.message)
  }

  const normalizedTasks: TaskRow[] = (tasks ?? []).map((task) => ({
    ...task,
    assigned_to_username: task.task_assignments?.[0]?.team_members?.username ?? null,
    assigned_to_name: task.task_assignments?.[0]?.team_members?.name ?? null,
  }))

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
          <span className="text-foreground">{project.name}</span>
        </nav>

        <div className="rounded-lg border border-border p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Project tasks</p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">{project.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, track, and move content tasks between list and kanban views.
          </p>
        </div>
      </div>

      <TaskViewToggle initialTasks={normalizedTasks} projectId={projectId} clientId={clientId} />
    </div>
  )
}
