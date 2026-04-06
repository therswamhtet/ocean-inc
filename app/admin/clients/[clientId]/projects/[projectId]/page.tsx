import Link from 'next/link'
import { notFound } from 'next/navigation'

import { TaskViewToggle, type TaskRow } from './task-view-toggle'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

type ProjectRecord = {
  id: string
  name: string
  client_id: string
  status: string
  month: number | null
  year: number | null
  created_at: string | null
  clients: {
    id: string
    name: string
    color: string | null
    description: string | null
  } | null
}

type TaskRecord = {
  id: string
  title: string
  briefing: string | null
  caption: string | null
  design_file_path: string | null
  posting_date: string | null
  posting_time: string | null
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

function monthName(m: number) {
  return new Date(0, m - 1).toLocaleString('default', { month: 'long' })
}

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function statusBadge(status: string) {
  const config: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    active: { label: 'In Progress', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
    paused: { label: 'Paused', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
    done: { label: 'Completed', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  }
  const c = config[status] ?? config.active
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
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
    .select('id, name, client_id, status, month, year, created_at, clients(id, name, color, description)')
    .eq('id', projectId)
    .eq('client_id', clientId)
    .single<ProjectRecord>()

  if (projectError || !project) {
    notFound()
  }

  const { data: tasks, error: tasksError } = await serviceRoleClient
    .from('tasks')
    .select(
      'id, title, briefing, caption, design_file_path, posting_date, posting_time, due_date, deadline, status, created_at, task_assignments(team_members(name, username))'
    )
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .returns<TaskRecord[]>()

  if (tasksError) {
    throw new Error(tasksError.message)
  }

  // Compute summary stats
  const totalTasks = tasks?.length ?? 0
  const completedTasks = tasks?.filter((t) => t.status === 'done').length ?? 0
  const inProgressTasks = tasks?.filter((t) => t.status === 'in_progress').length ?? 0
  const todoTasks = tasks?.filter((t) => t.status === 'todo').length ?? 0

  const normalizedTasks: TaskRow[] = (tasks ?? []).map((task) => ({
    ...task,
    assigned_to_username: task.task_assignments?.[0]?.team_members?.username ?? null,
    assigned_to_name: task.task_assignments?.[0]?.team_members?.name ?? null,
    posting_time: task.posting_time,
  }))

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
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

      {/* Project Details Card */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            {/* Color bar */}
            <div
              className="h-10 w-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.clients?.color || '#b45309' }}
            />
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-foreground">{project.name}</h2>
                {statusBadge(project.status)}
              </div>
              {project.clients?.description && (
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {project.clients.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:divide-x sm:divide-border">
          <div className="text-center sm:pr-4">
            <p className="text-2xl font-semibold text-foreground">{totalTasks}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center sm:px-4">
            <p className="text-2xl font-semibold text-foreground">{todoTasks}</p>
            <p className="text-xs text-muted-foreground">To Do</p>
          </div>
          <div className="text-center sm:px-4">
            <p className="text-2xl font-semibold text-foreground">{inProgressTasks}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </div>
          <div className="text-center sm:pl-4">
            <p className="text-2xl font-semibold text-foreground">{completedTasks}</p>
            <p className="text-xs text-muted-foreground">Done</p>
          </div>
        </div>

        {/* Meta info row */}
        <div className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t border-border sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Client</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">{project.clients?.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Period</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">
              {project.month && project.year ? `${monthName(project.month)} ${project.year}` : '—'}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">{formatDate(project.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <TaskViewToggle initialTasks={normalizedTasks} projectId={projectId} clientId={clientId} />
    </div>
  )
}
