import Link from 'next/link'
import { notFound } from 'next/navigation'

import { TaskDetailForm } from './task-detail-form'
import { createClient } from '@/lib/supabase/server'

type TaskRecord = {
  id: string
  title: string
  briefing: string | null
  caption: string | null
  posting_date: string | null
  due_date: string | null
  deadline: string | null
  status: 'todo' | 'in_progress' | 'done'
  design_file_path: string | null
  projects:
    | {
        id: string
        name: string
        clients:
          | {
              id: string
              name: string
            }
          | null
      }
    | null
}

export default async function TeamTaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>
}) {
  const { taskId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata.role !== 'team_member') {
    notFound()
  }

  const { data: assignment, error } = await supabase
    .from('task_assignments')
    .select(
      'tasks(id, title, briefing, caption, posting_date, due_date, deadline, status, design_file_path, projects(id, name, clients(id, name)))'
    )
    .eq('task_id', taskId)
    .eq('team_member_id', user.id)
    .single<{ tasks: TaskRecord | null }>()

  const task = assignment?.tasks

  if (error || !task) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link className="underline underline-offset-4" href="/team">
            Dashboard
          </Link>
          <span>{'>'}</span>
          <span className="text-foreground">{task.projects?.name ?? 'Project'}</span>
          <span>{'>'}</span>
          <span className="text-foreground">{task.title}</span>
        </nav>

        <div className="rounded-lg border border-border p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Assigned task</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">{task.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {task.projects?.name ?? 'Project'} · {task.projects?.clients?.name ?? 'Client'}
          </p>
        </div>
      </div>

      <TaskDetailForm
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
          projectName: task.projects?.name ?? 'Project',
          clientName: task.projects?.clients?.name ?? 'Client',
        }}
      />
    </div>
  )
}
