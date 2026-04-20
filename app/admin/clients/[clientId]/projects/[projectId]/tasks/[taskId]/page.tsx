import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

import { TaskEditForm } from './task-edit-form'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'

type TaskRecord = {
  id: string
  project_id: string
  title: string
  briefing: string | null
  caption: string | null
  design_file_path: string | null
  posting_date: string | null
  posting_time: string | null
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
  params: Promise<{ clientId: string; projectId: string; taskId: string }>
}) {
  const { clientId, projectId, taskId } = await params
  const supabase = await createClient()
  const serviceRoleClient = createServiceRoleClient()

  const [{ data: task, error: taskError }, { data: project, error: projectError }] =
    await Promise.all([
      serviceRoleClient
        .from('tasks')
        .select('id, project_id, title, briefing, caption, design_file_path, posting_date, posting_time, due_date, deadline, status')
        .eq('id', taskId)
        .eq('project_id', projectId)
        .single<TaskRecord>(),
      serviceRoleClient
        .from('projects')
        .select('id, name, client_id, clients(id, name)')
        .eq('id', projectId)
        .eq('client_id', clientId)
        .single<ProjectRecord>(),
    ])

  if (taskError || !task || projectError || !project) {
    notFound()
  }

  const s = statusConfig[task.status] ?? statusConfig.todo
  const clientName = project.clients?.name ?? 'Client'

  return (
    <div className="space-y-5">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground overflow-x-auto">
        <Link className="hover:text-foreground transition shrink-0" href="/admin/clients">Clients</Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <Link className="hover:text-foreground transition shrink-0" href={`/admin/clients/${clientId}`}>{clientName}</Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <Link className="hover:text-foreground transition shrink-0" href={`/admin/clients/${clientId}/projects/${projectId}`}>{project.name}</Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate text-foreground font-medium">{task.title}</span>
      </nav>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-foreground truncate">{task.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Edit content details, schedule, and design files.</p>
        </div>
        <span className={cn('shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', s.bg, s.text)}>
          <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
          {s.label}
        </span>
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
          postingTime: task.posting_time,
          dueDate: task.due_date,
          deadline: task.deadline,
          status: task.status,
          designFilePath: task.design_file_path,
        }}
      />
    </div>
  )
}