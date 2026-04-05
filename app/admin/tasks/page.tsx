import { format } from 'date-fns'

import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'

const statusColors: Record<string, string> = {
  done: 'bg-green-500',
  in_progress: 'bg-yellow-500',
  todo: 'bg-gray-400',
}

type TaskRecord = {
  id: string
  title: string
  posting_date: string | null
  due_date: string | null
  status: string
  projects: { name: string } | null
}

function CompactTaskList({ tasks, sectionLabel }: { tasks: TaskRecord[]; sectionLabel: string }) {
  if (tasks.length === 0) return null

  return (
    <section className="rounded-lg border border-border p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{sectionLabel}</h3>
      <ul className="space-y-2">
        {tasks.map((task) => {
          const projectName = task.projects?.name
          return (
            <li key={task.id} className="flex items-start gap-3 text-sm">
              <span
                className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${statusColors[task.status] ?? 'bg-gray-400'}`}
              />
              <div className="min-w-0 flex-1">
                <span className="font-medium text-foreground">{task.title}</span>
                {projectName && (
                  <span className="text-muted-foreground"> — {projectName}</span>
                )}
              </div>
              <Badge className="flex-shrink-0 capitalize">
                {task.status.replace('_', ' ')}
              </Badge>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default async function TasksPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const today = format(new Date(), 'yyyy-MM-dd')

  const [{ data: todayTasks }, { data: upcomingTasks }, { data: dueTasks }] = await Promise.all([
    supabase
      .from('tasks')
      .select('id, title, posting_date, due_date, status, projects(name)')
      .eq('posting_date', today)
      .limit(20)
      .returns<TaskRecord[]>(),
    supabase
      .from('tasks')
      .select('id, title, posting_date, due_date, status, projects(name)')
      .gt('posting_date', today)
      .neq('status', 'done')
      .order('posting_date', { ascending: true })
      .limit(20)
      .returns<TaskRecord[]>(),
    supabase
      .from('tasks')
      .select('id, title, posting_date, due_date, status, projects(name)')
      .lt('due_date', today)
      .neq('status', 'done')
      .order('due_date', { ascending: true })
      .limit(20)
      .returns<TaskRecord[]>(),
  ])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Tasks</p>
        <div>
          <h2 className="text-2xl font-semibold">All Tasks</h2>
          <p className="text-sm text-muted-foreground">
            View tasks organized by urgency — today, upcoming, and overdue.
          </p>
        </div>
      </div>

      {todayTasks && todayTasks.length > 0 && (
        <CompactTaskList tasks={todayTasks} sectionLabel={`Today's Tasks (${todayTasks.length})`} />
      )}

      {upcomingTasks && upcomingTasks.length > 0 && (
        <CompactTaskList tasks={upcomingTasks} sectionLabel={`Upcoming (${upcomingTasks.length})`} />
      )}

      {dueTasks && dueTasks.length > 0 && (
        <CompactTaskList tasks={dueTasks} sectionLabel={`Overdue (${dueTasks.length})`} />
      )}

      {(!todayTasks || todayTasks.length === 0) &&
        (!upcomingTasks || upcomingTasks.length === 0) &&
        (!dueTasks || dueTasks.length === 0) && (
          <div className="rounded-lg border border-dashed border-border px-5 py-10 text-center">
            <p className="text-lg font-medium">No tasks found.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tasks will appear here when they are created in a project.
            </p>
          </div>
        )}
    </div>
  )
}
