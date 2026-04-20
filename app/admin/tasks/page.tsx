import { format } from 'date-fns'

import { createServiceRoleClient } from '@/lib/supabase/server'
import AllTasks from './all-tasks'

type TaskRow = {
  id: string
  title: string
  posting_date: string | null
  status: string
  project_id: string
  due_date: string | null
  deadline: string | null
  projects: {
    id: string
    name: string
    client_id: string
    clients: { id: string; name: string; color: string } | null
  } | null
}

type ClientRow = {
  id: string
  name: string
  color: string
}

type ProjectRow = {
  id: string
  name: string
  month: number
  year: number
  client_id: string
  status: string
}

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

  const { data, error } = await builder.returns<TaskRow[]>()
  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => {
    const projects = row.projects as Record<string, unknown> | null
    const clients = (projects?.clients ?? {}) as Record<string, unknown> | null

    return {
      id: row.id,
      title: row.title,
      posting_date: row.posting_date as string | null,
      due_date: row.due_date as string | null,
      deadline: row.deadline as string | null,
      status: row.status,
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

  const [todayTasks, upcomingTasks, overdueTasks, clientsData, projectsData] = await Promise.all([
    fetchTasks(serviceRoleClient, 'today'),
    fetchTasks(serviceRoleClient, 'upcoming'),
    fetchTasks(serviceRoleClient, 'overdue'),
    serviceRoleClient
      .from('clients')
      .select('id, name, color')
      .order('name', { ascending: true })
      .returns<ClientRow[]>(),
    serviceRoleClient
      .from('projects')
      .select('id, name, month, year, client_id, status')
      .eq('status', 'active')
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .returns<ProjectRow[]>(),
  ])

  const clients = (clientsData.data ?? []) as ClientRow[]
  const projects = (projectsData.data ?? []) as ProjectRow[]

  const projectsByClient: Record<string, { id: string; name: string; month: number; year: number }[]> = {}
  for (const p of projects) {
    if (!projectsByClient[p.client_id]) projectsByClient[p.client_id] = []
    projectsByClient[p.client_id].push({ id: p.id, name: p.name, month: p.month, year: p.year })
  }

  const typedClients = (clients ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color,
  }))

  return (
    <AllTasks
      today={{ label: "Today's Tasks", tasks: todayTasks }}
      upcoming={{ label: 'Upcoming', tasks: upcomingTasks }}
      overdue={{ label: 'Overdue', tasks: overdueTasks }}
      clients={typedClients}
      projectsByClient={projectsByClient}
    />
  )
}