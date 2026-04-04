import Link from 'next/link'
import { format } from 'date-fns'

import { StatusDot } from '@/components/ui/status-dot'
import { createClient } from '@/lib/supabase/server'
import { LABELS } from '@/lib/labels'

type DisplayStatus = 'todo' | 'in_progress' | 'done' | 'overdue'

type AssignmentRecord = {
  tasks: {
    id: string
    title: string
    status: 'todo' | 'in_progress' | 'done'
    posting_date: string | null
    due_date: string | null
    created_at: string
    projects:
      | {
          name: string
          clients: {
            name: string
          } | null
        }
      | null
  } | null
}

const metricCardClassName = 'rounded-lg border border-border p-4'

function compareNullableDates(a: string | null, b: string | null) {
  if (a && b) {
    return a.localeCompare(b)
  }

  if (a) {
    return -1
  }

  if (b) {
    return 1
  }

  return 0
}

export default async function TeamDashboardPage() {
  const supabase = await createClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: assignments, error } = await supabase
    .from('task_assignments')
    .select(
      'tasks(id, title, status, posting_date, due_date, created_at, projects(name, clients(name)))'
    )
    .eq('team_member_id', user.id)
    .returns<AssignmentRecord[]>()

  if (error) {
    throw new Error(error.message)
  }

  const tasks = (assignments ?? [])
    .flatMap((assignment) => (assignment.tasks ? [assignment.tasks] : []))
    .map((task) => {
      const isOverdue = Boolean(task.posting_date && task.posting_date < today && task.status !== 'done')

      return {
        id: task.id,
        title: task.title,
        status: task.status,
        postingDate: task.posting_date,
        dueDate: task.due_date,
        createdAt: task.created_at,
        projectName: task.projects?.name ?? 'Untitled Project',
        clientName: task.projects?.clients?.name ?? 'Unknown Client',
        displayStatus: (isOverdue ? 'overdue' : task.status) as DisplayStatus,
        isOverdue,
      }
    })
    .sort((a, b) => {
      const dueDateComparison = compareNullableDates(a.dueDate, b.dueDate)

      if (dueDateComparison !== 0) {
        return dueDateComparison
      }

      return a.createdAt.localeCompare(b.createdAt)
    })

  const metrics = [
    { label: 'Total Assigned', value: tasks.length },
    { label: 'Due Today', value: tasks.filter((task) => task.dueDate === today).length },
    { label: 'Overdue', value: tasks.filter((task) => task.isOverdue).length },
    { label: 'Completed', value: tasks.filter((task) => task.status === 'done').length },
  ]

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">See what is due next and keep your assigned content moving.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {metrics.map((metric) => (
            <article key={metric.label} className={metricCardClassName}>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="mt-1 text-2xl font-bold">{metric.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border">
        <div className="border-b border-border px-4 py-4">
          <h3 className="text-base font-semibold">Assigned Tasks</h3>
          <p className="text-sm text-muted-foreground">Sorted by due date so the closest deadlines stay first.</p>
        </div>

        {tasks.length > 0 ? (
          <ul>
            {tasks.map((task) => (
              <li key={task.id} className="border-b border-border last:border-b-0">
                <Link
                  href={`/team/tasks/${task.id}`}
                  className="flex flex-col gap-3 px-4 py-4 transition hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{task.title}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <span>{task.projectName}</span>
                      <span>•</span>
                      <span>{task.clientName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{task.dueDate ? `Due ${task.dueDate}` : 'No due date'}</span>
                    <StatusDot status={task.displayStatus} showLabel />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-6 text-sm text-muted-foreground">No tasks assigned yet.</p>
        )}
      </section>
    </div>
  )
}
