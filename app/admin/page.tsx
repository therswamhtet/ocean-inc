import { format, startOfMonth } from 'date-fns'

import { DashboardMetrics, DashboardNotifications } from '@/components/admin/dashboard-inner'
import { LABELS } from '@/lib/labels'
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const today = format(new Date(), 'yyyy-MM-dd')
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')

  const [
    { count: activeProjects },
    { count: inProgress },
    { count: overdue },
    { count: completedThisMonth },
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

      <DashboardNotifications notifications={notifications} unreadCount={unreadCount} />
    </div>
  )
}
