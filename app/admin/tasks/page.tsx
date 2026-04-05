import { format } from 'date-fns'

import { createServiceRoleClient } from '@/lib/supabase/server'
import AllTasks from './all-tasks'

async function fetchTasks(
  supabase: ReturnType<typeof createServiceRoleClient>,
  filter: 'today' | 'upcoming' | 'overdue',
) {
  const today = format(new Date(), 'yyyy-MM-dd')

  let builder = supabase
    .from('tasks')
    .select(
      `
      id,
      created_at,
      title,
      posting_date,
      due_date,
      deadline,
      status,
      project_id,
      projects (
        id,
        name,
        client_id,
        clients (
          id,
          name,
          color
        )
      ),
      task_assignments (
        team_members (
          name
        )
      )
    `,
    )

  switch (filter) {
    case 'today':
      builder = builder.eq('posting_date', today).limit(50)
      break
    case 'upcoming':
      builder = builder
        .gt('posting_date', today)
        .neq('status', 'done')
        .order('posting_date', { ascending: true })
        .limit(50)
      break
    case 'overdue':
      builder = builder
        .lt('posting_date', today)
        .neq('status', 'done')
        .order('posting_date', { ascending: true })
        .limit(50)
      break
  }

  const { data, error } = await builder.returns<any[]>()
  if (error) throw new Error(error.message)

  return (data ?? []).map((row: any) => {
    const projects = row.projects as Record<string, unknown> | null
    const clients = (projects?.clients ?? {}) as Record<string, unknown> | null
    const assignments = row.task_assignments as any[] | null
    const assignee = assignments?.[0]?.team_members?.name ?? null

    return {
      id: row.id,
      created_at: row.created_at,
      title: row.title,
      posting_date: row.posting_date as string | null,
      due_date: row.due_date as string | null,
      deadline: row.deadline as string | null,
      status: row.status,
      assigned_to_name: assignee,
      client_id: (clients?.id as string) ?? '',
      client_name: (clients?.name as string) ?? 'Unknown',
      client_color: (clients?.color as string | null) ?? null,
      project_id: (projects?.id as string) ?? '',
      project_name: (projects?.name as string) ?? 'Unknown',
    }
  })
}

export default async function TasksPage() {
  const serviceRoleClient = createServiceRoleClient()

  const [todayTasks, upcomingTasks, overdueTasks] = await Promise.all([
    fetchTasks(serviceRoleClient, 'today'),
    fetchTasks(serviceRoleClient, 'upcoming'),
    fetchTasks(serviceRoleClient, 'overdue'),
  ])

  return (
    <AllTasks
      today={{ label: "Today's Tasks", tasks: todayTasks }}
      upcoming={{ label: 'Upcoming', tasks: upcomingTasks }}
      overdue={{ label: 'Overdue', tasks: overdueTasks }}
    />
  )
}
