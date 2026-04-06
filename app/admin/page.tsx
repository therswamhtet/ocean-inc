import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns'

import { DashboardMetrics, DashboardTaskSections, DashboardMyTasks } from '@/components/admin/dashboard-inner'
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

export default async function AdminDashboard() {
  const supabase = await createClient()
  const serviceRoleClient = createServiceRoleClient()
  const today = format(new Date(), 'yyyy-MM-dd')
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd')
  const todayStart = format(startOfDay(new Date()), 'yyyy-MM-dd')
  const todayEnd = format(endOfDay(new Date()), 'yyyy-MM-dd')

  // Get the current user's identity
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { count: activeProjects },
    { count: inProgress },
    { count: overdue },
    { count: completedThisMonth },
    { data: calendarTasks },
    { data: overdueTasks },
    { data: todayTasks },
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
  ])

  // Fetch "My Tasks" — tasks assigned to the current user via team_members
  let myTasks: Parameters<typeof DashboardMyTasks>[0]['tasks'] = []
  const userEmail = user?.email || user?.user_metadata?.email || null
  if (userEmail) {
    // Find the team_members record for the current user
    const { data: teamMember } = await serviceRoleClient
      .from('team_members')
      .select('id')
      .eq('email', userEmail)
      .maybeSingle()

    if (teamMember) {
      const { data: myTasksAssigned } = await serviceRoleClient
        .from('task_assignments')
        .select('task_id, team_member_id, team_members(name, username), tasks(id, title, status, posting_date, due_date, project_id, projects(name, client_id))')
        .eq('team_member_id', teamMember.id)
        .limit(50)

      // Normalize task assignments into the DashboardMyTasks type
      myTasks = (myTasksAssigned ?? []).map((raw: any) => {
        const task = raw.tasks
        const projects = task?.projects
        return {
          id: task?.id ?? '',
          title: task?.title ?? '',
          status: task?.status ?? 'todo',
          posting_date: task?.posting_date ?? null,
          due_date: task?.due_date ?? null,
          project_id: task?.project_id ?? null,
          client_id: projects?.client_id ?? null,
          project_name: projects?.name ?? null,
          client_name: null,
          assignee_username: raw.team_members?.username ?? null,
          assignee_name: raw.team_members?.name ?? null,
        }
      })
    }
  }

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

      <DashboardMyTasks tasks={myTasks} />

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
