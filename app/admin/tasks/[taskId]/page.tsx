import Link from 'next/link'
import { notFound } from 'next/navigation'

import { createServiceRoleClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { ArrowLeft, Calendar, FileText, ExternalLink } from 'lucide-react'

type TaskRecord = {
  id: string
  project_id: string | null
  title: string
  briefing: string | null
  caption: string | null
  design_file_path: string | null
  posting_date: string | null
  due_date: string | null
  deadline: string | null
  status: 'todo' | 'in_progress' | 'done'
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

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>
}) {
  const { taskId } = await params
  const serviceRoleClient = createServiceRoleClient()

  // Fetch task with project info
  const { data: task, error: taskError } = await serviceRoleClient
    .from('tasks')
    .select('id, project_id, title, briefing, caption, design_file_path, posting_date, due_date, deadline, status')
    .eq('id', taskId)
    .single<TaskRecord>()

  if (taskError || !task) {
    notFound()
  }

  // If task has a project, fetch project and client info for breadcrumb
  let project: ProjectRecord | null = null
  if (task.project_id) {
    const { data: projectData } = await serviceRoleClient
      .from('projects')
      .select('id, name, client_id, clients(id, name)')
      .eq('id', task.project_id)
      .single<ProjectRecord>()
    project = projectData
  }

  const statusColors: Record<string, string> = {
    todo: 'bg-gray-400',
    in_progress: 'bg-blue-400',
    done: 'bg-green-400',
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link className="underline underline-offset-4" href="/admin">
            Dashboard
          </Link>
          {project && (
            <>
              <span>{'>'}</span>
              <Link className="underline underline-offset-4" href={`/admin/clients/${project.client_id}`}>
                {project.clients?.name ?? 'Client'}
              </Link>
              <span>{'>'}</span>
              <Link className="underline underline-offset-4" href={`/admin/clients/${project.client_id}/projects/${project.id}`}>
                {project.name}
              </Link>
              <span>{'>'}</span>
            </>
          )}
          <span className="text-foreground">{task.title}</span>
        </nav>

        <div className="flex items-center justify-between rounded-lg border border-border p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Task detail</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">{task.title}</h1>
            <div className="mt-2 flex items-center gap-3">
              <span className={`h-2.5 w-2.5 rounded-full ${statusColors[task.status] ?? 'bg-gray-400'}`} />
              <span className="text-sm text-muted-foreground capitalize">{task.status.replace('_', ' ')}</span>
            </div>
          </div>
          {project && (
            <Link
              href={`/admin/clients/${project.client_id}/projects/${project.id}/tasks/${task.id}`}
              className="flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-sm transition hover:bg-muted/40"
            >
              <ExternalLink className="h-4 w-4" />
              Edit in Project
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Task Info */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4" />
              Task Information
            </h2>
            <dl className="space-y-3">
              {task.posting_date && (
                <div className="flex items-start gap-3">
                  <dt className="w-24 text-sm text-muted-foreground">Posting Date</dt>
                  <dd className="text-sm font-medium">{format(new Date(task.posting_date), 'MMMM d, yyyy')}</dd>
                </div>
              )}
              {task.due_date && (
                <div className="flex items-start gap-3">
                  <dt className="w-24 text-sm text-muted-foreground">Due Date</dt>
                  <dd className="text-sm font-medium">{format(new Date(task.due_date), 'MMMM d, yyyy')}</dd>
                </div>
              )}
              {task.deadline && (
                <div className="flex items-start gap-3">
                  <dt className="w-24 text-sm text-muted-foreground">Deadline</dt>
                  <dd className="text-sm font-medium">{format(new Date(task.deadline), 'MMMM d, yyyy')}</dd>
                </div>
              )}
              {project && (
                <div className="flex items-start gap-3">
                  <dt className="w-24 text-sm text-muted-foreground">Project</dt>
                  <dd className="text-sm font-medium">{project.name}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Caption */}
        {task.caption && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-5">
              <h2 className="mb-4 text-sm font-semibold">Caption</h2>
              <p className="whitespace-pre-wrap text-sm text-foreground">{task.caption}</p>
            </div>
          </div>
        )}

        {/* Briefing */}
        {task.briefing && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-5">
              <h2 className="mb-4 text-sm font-semibold">Briefing</h2>
              <div 
                className="prose prose-sm max-w-none text-sm text-foreground"
                dangerouslySetInnerHTML={{ __html: task.briefing }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Back link */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
    </div>
  )
}
