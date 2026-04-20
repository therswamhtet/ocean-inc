import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns'

import { DashboardMetrics, DashboardTaskSections } from '@/components/admin/dashboard-inner'
import { AdminCalendar } from '@/app/admin/calendar-wrapper'
import { LABELS } from '@/lib/labels'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

type TaskForCalendar = {
  id: string
  project_id: string | null
  title: string
  posting_date: string | null
  status: string
  projects: { id: string; name: string; client_id: string } | null
}

type ProjectForDashboard = {
  id: string
  name: string
  month: number | null
  year: number | null
  status: string
  client_id: string
  clients: { id: string; name: string; color: string | null } | null
}

const CLIENT_PALETTE = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316']

function getColorForName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return CLIENT_PALETTE[Math.abs(hash) % CLIENT_PALETTE.length]
}

function monthName(m: number | null) {
  if (!m) return '—'
  return new Date(0, m - 1).toLocaleString('default', { month: 'short' })
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  const serviceRoleClient = createServiceRoleClient()
  const today = format(new Date(), 'yyyy-MM-dd')
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd')
  const todayStart = format(startOfDay(new Date()), 'yyyy-MM-dd')
  const todayEnd = format(endOfDay(new Date()), 'yyyy-MM-dd')

  const [
    { count: activeProjects },
    { count: inProgress },
    { count: overdue },
    { count: completedThisMonth },
    { data: calendarTasks },
    { data: overdueTasks },
    { data: todayTasks },
    { data: recentProjects },
  ] = await Promise.all([
    serviceRoleClient.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    serviceRoleClient.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
    serviceRoleClient
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .lt('posting_date', today)
      .neq('status', 'done'),
    serviceRoleClient
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'done')
      .gte('updated_at', monthStart),
    serviceRoleClient
      .from('tasks')
      .select('id, project_id, title, posting_date, status, projects(id, name, client_id)')
      .not('posting_date', 'is', null)
      .gte('posting_date', monthStart)
      .lt('posting_date', monthEnd),
    serviceRoleClient
      .from('tasks')
      .select('id, project_id, title, posting_date, status, projects(client_id, name)')
      .lt('posting_date', today)
      .neq('status', 'done')
      .limit(5),
    serviceRoleClient
      .from('tasks')
      .select('id, project_id, title, posting_date, status, projects(client_id, name)')
      .gte('posting_date', todayStart)
      .lte('posting_date', todayEnd)
      .limit(5),
    serviceRoleClient
      .from('projects')
      .select('id, name, month, year, status, client_id, clients(id, name, color)')
      .eq('status', 'active')
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(6)
      .returns<ProjectForDashboard[]>(),
  ])

  const metrics = [
    { label: LABELS.dashboard.totalProjects, value: activeProjects ?? 0 },
    { label: LABELS.dashboard.tasksInProgress, value: inProgress ?? 0 },
    {
      label: LABELS.dashboard.overdueTasks,
      value: overdue ?? 0,
      className: 'border-l-4 border-l-red-500',
    },
    { label: LABELS.dashboard.completedThisMonth, value: completedThisMonth ?? 0 },
  ]

  const typedRecentProjects = (recentProjects ?? []) as ProjectForDashboard[]

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Track current project volume and task progress.</p>
        </div>

        <DashboardMetrics metrics={metrics} />
      </section>

      {typedRecentProjects.length > 0 && (
        <section>
          <div className="mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Active Projects
            </h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {typedRecentProjects.map((project) => {
              const client = project.clients
              const color = client?.color || (client?.name ? getColorForName(client.name) : '#b45309')

              return (
                <a
                  key={project.id}
                  href={`/admin/clients/${project.client_id}/projects/${project.id}`}
                  className="group rounded-lg border border-border bg-card p-4 transition hover:border-primary/30 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 h-8 w-1 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate group-hover:underline">
                        {project.name}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{monthName(project.month)} {project.year}</span>
                      </div>
                      {client && (
                        <p className="mt-1 text-xs text-muted-foreground truncate">{client.name}</p>
                      )}
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        </section>
      )}

      <AdminCalendar
        tasks={calendarTasks as unknown as TaskForCalendar[]}
        currentMonth={new Date()}
      />

      <DashboardTaskSections
        overdueTasks={overdueTasks as unknown as Parameters<typeof DashboardTaskSections>[0]['overdueTasks']}
        todayTasks={todayTasks as unknown as Parameters<typeof DashboardTaskSections>[0]['todayTasks']}
      />
    </div>
  )
}
