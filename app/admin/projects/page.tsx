import Link from 'next/link'

import { createServiceRoleClient } from '@/lib/supabase/server'

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
  active: { label: 'Active', dot: 'bg-green-500' },
  paused: { label: 'Paused', dot: 'bg-yellow-500' },
  done: { label: 'Done', dot: 'bg-gray-400' },
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

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-2xl font-semibold text-foreground">Projects</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          All projects across clients. Click a project to manage its tasks.
        </p>
      </div>

      {activeProjects.length > 0 && (
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Active ({activeProjects.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeProjects.map((project) => {
              const client = project.clients
              const color = client?.color || (client?.name ? getColorForName(client.name) : '#b45309')
              const config = statusConfig[project.status] ?? statusConfig.active

              return (
                <Link
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
                        <span className="inline-flex items-center gap-1">
                          <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                          {config.label}
                        </span>
                        <span>·</span>
                        <span>{monthName(project.month)} {project.year}</span>
                      </div>
                      {client && (
                        <p className="mt-1 text-xs text-muted-foreground truncate">{client.name}</p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {otherProjects.length > 0 && (
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Other ({otherProjects.length})
          </h3>
          <div className="rounded-lg border border-border bg-card">
            <div className="divide-y divide-border">
              {otherProjects.map((project) => {
                const client = project.clients
                const color = client?.color || (client?.name ? getColorForName(client.name) : '#b45309')
                const config = statusConfig[project.status] ?? statusConfig.active

                return (
                  <Link
                    key={project.id}
                    href={`/admin/clients/${project.client_id}/projects/${project.id}`}
                    className="group flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-muted/30"
                  >
                    <div
                      className="h-4 w-1 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="flex-1 font-medium text-foreground truncate group-hover:underline">
                      {project.name}
                    </span>
                    <span className="hidden sm:inline text-xs text-muted-foreground">
                      {monthName(project.month)} {project.year}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                      {config.label}
                    </span>
                    {client && (
                      <span className="hidden md:inline text-xs text-muted-foreground truncate max-w-24">
                        {client.name}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {projects?.length === 0 && (
        <div className="rounded-lg border border-dashed border-border px-5 py-10 text-center">
          <p className="text-lg font-medium text-foreground">No projects yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a client first, then add projects.
          </p>
        </div>
      )}
    </div>
  )
}