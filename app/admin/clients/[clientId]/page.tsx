import Link from 'next/link'
import { notFound } from 'next/navigation'

import { createProjectAction, deleteProjectAction, updateClientDescriptionAction } from './actions'
import { toggleClientStatusAction } from '../actions'
import { LABELS } from '@/lib/labels'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ContentCard } from '@/components/ui/content-card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ClientRecord = {
  id: string
  name: string
  color: string
  description: string | null
  is_active: boolean
}

type ProjectRecord = {
  id: string
  name: string
  month: number
  year: number
  status: 'active' | 'paused' | 'done' | string
}

const CLIENT_PALETTE = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316']

function getColorForClient(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return CLIENT_PALETTE[Math.abs(hash) % CLIENT_PALETTE.length]
}

const projectStatuses = {
  active: 'Active',
  paused: 'Paused',
  done: 'Done',
} as const

const projectStatusColors = {
  active: 'bg-green-500',
  paused: 'bg-yellow-500',
  done: 'bg-gray-400',
} as const

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-md border border-border px-2 py-1 text-xs font-medium uppercase tracking-[0.12em] text-foreground">
      {children}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colorClass = projectStatusColors[status as keyof typeof projectStatusColors] ?? 'bg-gray-400'
  const label = projectStatuses[status as keyof typeof projectStatuses] ?? status

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${colorClass}`} />
      <span className="text-sm text-foreground">{label}</span>
    </span>
  )
}

function monthName(month: number) {
  return new Date(0, month - 1).toLocaleString('default', { month: 'long' })
}

export default async function ClientProjectsPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { clientId } = await params
  const { error: pageError } = await searchParams

  const supabase = await createClient()
  const serviceRoleClient = createServiceRoleClient()

  const { data: client, error: clientError } = await serviceRoleClient
    .from('clients')
    .select('id, name, color, description, is_active')
    .eq('id', clientId)
    .single<ClientRecord>()

  if (clientError || !client) {
    notFound()
  }

  const { data: projects, error: projectsError } = await serviceRoleClient
    .from('projects')
    .select('id, name, month, year, status')
    .eq('client_id', clientId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .returns<ProjectRecord[]>()

  if (projectsError) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link className="underline underline-offset-4" href="/admin/clients">
            Clients
          </Link>
          <span>{'>'}</span>
          <span className="text-foreground">{client.name}</span>
        </nav>
        <div className="flex flex-col gap-4 rounded-lg border border-border p-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-5 w-1 flex-shrink-0 rounded-sm" style={{ backgroundColor: client.color || getColorForClient(client.name) }} />
            <div>
              <p className="text-sm text-muted-foreground">{LABELS.common.projectList}</p>
              <h2 className="text-2xl font-semibold text-foreground">{client.name}</h2>
              <p className="text-sm text-muted-foreground">
                {LABELS.common.projectDescription}
              </p>
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default">{LABELS.project.create}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create project</DialogTitle>
                <DialogDescription>Add a new monthly project cycle for {client.name}.</DialogDescription>
              </DialogHeader>
              <form action={createProjectAction.bind(null, clientId)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="name">
                    {LABELS.common.name}
                  </label>
                  <Input
                    id="name"
                    minLength={2}
                    name="name"
                    placeholder={LABELS.common.monthPlaceholder}
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium" htmlFor="month">
                      {LABELS.common.month}
                    </label>
                    <select
                      className="w-full rounded-lg border border-input px-3 py-2 text-sm"
                      defaultValue={String(new Date().getMonth() + 1)}
                      id="month"
                      name="month"
                    >
                      {Array.from({ length: 12 }, (_, index) => index + 1).map((m) => (
                        <option key={m} value={m}>
                          {monthName(m)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium" htmlFor="year">
                      {LABELS.common.year}
                    </label>
                    <Input
                      defaultValue={new Date().getFullYear()}
                      id="year"
                      name="year"
                      required
                      type="number"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="status">
                    Status
                  </label>
                  <select
                    className="w-full rounded-lg border border-input px-3 py-2 text-sm"
                    defaultValue="active"
                    id="status"
                    name="status"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <Button type="submit">Create Project</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {pageError ? (
        <div className="rounded-lg border border-destructive px-4 py-3 text-sm text-destructive">
          {pageError}
        </div>
      ) : null}

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-5 py-10 text-center">
          <p className="text-lg font-medium">{LABELS.emptyStates.noProjects}</p>
        </div>
      ) : (
        <>
          {/* Desktop table / mobile cards */}
          <div className="hidden md:block">
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="min-w-full divide-y divide-border text-left text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Month</th>
                    <th className="px-4 py-3 font-medium">Year</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td className="px-4 py-3 font-medium">
                        <Link
                          href={`/admin/clients/${clientId}/projects/${project.id}`}
                          className="text-foreground underline-offset-4 hover:underline"
                        >
                          {project.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{monthName(project.month)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{project.year}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="px-4 py-3">
                        <form action={deleteProjectAction.bind(null, project.id, clientId)}>
                          <button className="text-sm underline underline-offset-4" type="submit">
                            Delete
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {projects.map((project) => (
              <ContentCard key={project.id} variant="mobile" className="space-y-3 bg-white">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/admin/clients/${clientId}/projects/${project.id}`}
                    className="text-base font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {project.name}
                  </Link>
                      <StatusBadge status={project.status} />
                </div>
                <div className="flex gap-3 text-sm text-muted-foreground">
                  <span>{monthName(project.month)} {project.year}</span>
                </div>
                <form action={deleteProjectAction.bind(null, project.id, clientId)}>
                  <button
                    className="min-h-[44px] w-full rounded-md border border-destructive px-3 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/5"
                    type="submit"
                  >
                    Delete
                  </button>
                </form>
              </ContentCard>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
