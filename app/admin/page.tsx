import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns'

import { DashboardMetrics, DashboardNotifications, DashboardCalendar, DashboardTaskSections } from '@/components/admin/dashboard-inner'
import { LABELS } from '@/lib/labels'
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()
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
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
    supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .lt('posting_date', today)
      .neq('status', 'done'),
    supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'done')
      .gte('updated_at', monthStart),
    supabase
      .from('tasks')
      .select('id, title, posting_date, status, projects(name)')
      .not('posting_date', 'is', null)
      .gte('posting_date', monthStart)
      .lt('posting_date', monthEnd),
    supabase
      .from('tasks')
      .select('id, project_id, title, posting_date, status, projects(client_id, name)')
      .lt('posting_date', today)
      .neq('status', 'done')
      .limit(5),
    supabase
      .from('tasks')
      .select('id, project_id, title, posting_date, status, projects(client_id, name)')
      .gte('posting_date', todayStart)
      .lte('posting_date', todayEnd)
      .limit(5),
  ])

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0

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

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Track current project volume and the latest team updates.</p>
        </div>

        <DashboardMetrics metrics={metrics} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <DashboardCalendar tasks={calendarTasks as unknown as Parameters<typeof DashboardCalendar>[0]['tasks']} currentMonth={new Date()} />
        <DashboardTaskSections 
          overdueTasks={overdueTasks as unknown as Parameters<typeof DashboardTaskSections>[0]['overdueTasks']} 
          todayTasks={todayTasks as unknown as Parameters<typeof DashboardTaskSections>[0]['todayTasks']} 
        />
      </section>

      <DashboardNotifications notifications={notifications} unreadCount={unreadCount} />
    </div>
  )
}
