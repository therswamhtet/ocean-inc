import Link from 'next/link'

import { createServiceRoleClient } from '@/lib/supabase/server'
import { ProjectsContent } from './projects-content'

type ProjectRow = {
  id: string
  name: string
  month: number | null
  year: number | null
  status: string
  client_id: string
  clients: {
    id: string
    name: string
    color: string | null
  } | null
}

const statusConfig: Record<string, { label: string; dot: string }> = {
  active: { label: 'Active', dot: 'bg-[#4A9E5C]' },
  paused: { label: 'Paused', dot: 'bg-[#D4A843]' },
  done: { label: 'Done', dot: 'bg-[#999999]' },
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
  return new Date(0, m - 1).toLocaleString('default', { month: 'long' })
}

export default async function ProjectsPage() {
  const serviceRoleClient = createServiceRoleClient()

  const { data: projects, error } = await serviceRoleClient
    .from('projects')
    .select('id, name, month, year, status, client_id, clients(id, name, color)')
    .order('status', { ascending: true })
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .returns<ProjectRow[]>()

  if (error) {
    throw new Error(error.message)
  }

  const activeProjects = (projects ?? []).filter((p) => p.status === 'active')
  const otherProjects = (projects ?? []).filter((p) => p.status !== 'active')

  const activeProjectData = activeProjects.map((project) => {
    const client = project.clients
    const color = client?.color || (client?.name ? getColorForName(client.name) : '#1A1A1A')
    const config = statusConfig[project.status] ?? statusConfig.active
    return {
      ...project,
      color,
      config,
      monthName: monthName(project.month),
    }
  })

  const otherProjectData = otherProjects.map((project) => {
    const client = project.clients
    const color = client?.color || (client?.name ? getColorForName(client.name) : '#1A1A1A')
    const config = statusConfig[project.status] ?? statusConfig.active
    return {
      ...project,
      color,
      config,
      monthName: monthName(project.month),
    }
  })

  return (
    <ProjectsContent
      activeProjects={activeProjectData}
      otherProjects={otherProjectData}
      hasProjects={(projects?.length ?? 0) > 0}
    />
  )
}
