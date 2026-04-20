import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeft, ChevronRight, ExternalLink, FileText } from 'lucide-react'

import { createServiceRoleClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'

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

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  todo: { label: 'To Do', dot: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-600' },
  in_progress: { label: 'In Progress', dot: 'bg-blue-400', bg: 'bg-blue-50', text: 'text-blue-600' },
  done: { label: 'Done', dot: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-600' },
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>
}) {
  const { taskId } = await params
  const serviceRoleClient = createServiceRoleClient()

  const { data: task, error: taskError } = await serviceRoleClient
    .from('tasks')
    .select('id, project_id, title, briefing, caption, design_file_path, posting_date, due_date, deadline, status')
    .eq('id', taskId)
    .single<TaskRecord>()

  if (taskError || !task) {
    notFound()
  }

  let project: ProjectRecord | null = null
  if (task.project_id) {
    const { data: projectData } = await serviceRoleClient
      .from('projects')
      .select('id, name, client_id, clients(id, name)')
      .eq('id', task.project_id)
      .single<ProjectRecord>()
    project = projectData
  }

  const s = statusConfig[task.status] ?? statusConfig.todo

  return (
    <div className="space-y-5">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground overflow-x-auto">
        <Link className="hover:text-foreground transition shrink-0" href="/admin">Dashboard</Link>
        {project && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <Link className="hover:text-foreground transition shrink-0" href={`/admin/clients/${project.client_id}`}>{project.clients?.name ?? 'Client'}</Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <Link className="hover:text-foreground transition shrink-0" href={`/admin/clients/${project.client_id}/projects/${project.id}`}>{project.name}</Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          </>
        )}
        <span className="truncate text-foreground font-medium">{task.title}</span>
      </nav>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-foreground truncate">{task.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">View-only summary of this task.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', s.bg, s.text)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
            {s.label}
          </span>
          {project && (
            <Link
              href={`/admin/clients/${project.client_id}/projects/${project.id}/tasks/${task.id}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted/50"
            >
              <ExternalLink className="h-3 w-3" />
              Edit
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Details</h2>
            </div>
          </div>
          <dl className="space-y-3 p-5">
            {task.posting_date && (
              <div className="flex items-start gap-3">
                <dt className="w-28 shrink-0 text-sm text-muted-foreground">Posting Date</dt>
                <dd className="text-sm font-medium text-foreground">{format(new Date(task.posting_date), 'MMMM d, yyyy')}</dd>
              </div>
            )}
            {task.due_date && (
              <div className="flex items-start gap-3">
                <dt className="w-28 shrink-0 text-sm text-muted-foreground">Due Date</dt>
                <dd className="text-sm font-medium text-foreground">{format(new Date(task.due_date), 'MMMM d, yyyy')}</dd>
              </div>
            )}
            {task.deadline && (
              <div className="flex items-start gap-3">
                <dt className="w-28 shrink-0 text-sm text-muted-foreground">Deadline</dt>
                <dd className="text-sm font-medium text-foreground">{format(new Date(task.deadline), 'MMMM d, yyyy')}</dd>
              </div>
            )}
            {project && (
              <div className="flex items-start gap-3">
                <dt className="w-28 shrink-0 text-sm text-muted-foreground">Project</dt>
                <dd className="text-sm font-medium text-foreground">{project.name}</dd>
              </div>
            )}
            {!task.posting_date && !task.due_date && !task.deadline && (
              <p className="text-sm text-muted-foreground">No dates set.</p>
            )}
          </dl>
        </section>

        {task.caption && (
          <section className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-3">
              <h2 className="text-sm font-semibold text-foreground">Caption</h2>
            </div>
            <div className="p-5">
              <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{task.caption}</p>
            </div>
          </section>
        )}

        {task.briefing && (
          <section className="rounded-xl border border-border bg-card sm:col-span-2">
            <div className="border-b border-border px-5 py-3">
              <h2 className="text-sm font-semibold text-foreground">Briefing</h2>
            </div>
            <div className="p-5 prose prose-sm max-w-none text-sm text-foreground" dangerouslySetInnerHTML={{ __html: task.briefing }} />
          </section>
        )}
      </div>

      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
    </div>
  )
}