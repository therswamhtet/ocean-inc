import Link from 'next/link'
import { notFound } from 'next/navigation'

import { createProjectAction, deleteProjectAction, updateClientDescriptionAction } from './actions'
import { toggleClientStatusActionWrapper } from '../actions'
import { LABELS } from '@/lib/labels'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

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

function monthName(month: number) {
  return new Date(0, month - 1).toLocaleString('default', { month: 'long' })
}

const statusConfig: Record<string, { label: string; dot: string }> = {
  active: { label: 'Active', dot: 'bg-green-500' },
  paused: { label: 'Paused', dot: 'bg-yellow-500' },
  done: { label: 'Done', dot: 'bg-gray-400' },
}

function StatusDot({ status }: { status: string }) {
  const config = statusConfig[status] ?? statusConfig.active
  return (
    <span className="inline-flex items-center gap-2 text-sm text-foreground">
      <span className={`h-2.5 w-2.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
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

  const displayColor = client.color || getColorForClient(client.name)
  const activeCount = projects.filter((p) => p.status === 'active').length

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link className="underline underline-offset-4" href="/admin/clients">
          Clients
        </Link>
        <span>›</span>
        <span className="text-foreground">{client.name}</span>
      </nav>

      {/* Client header card */}
      <div className="rounded-xl border border-border bg-card p-6">
        {/* Top section: color bar + name */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className="mt-1.5 h-6 w-1.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: displayColor }}
            />
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Client projects
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-foreground">{client.name}</h2>
            </div>
          </div>
          <span className="inline-flex shrink-0 rounded-md border border-border bg-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-foreground">
            {activeCount} active project{activeCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Description */}
        <form action={updateClientDescriptionAction.bind(null, clientId)} className="mt-4">
          <Textarea
            name="description"
            defaultValue={client.description ?? ''}
            placeholder="Add a client description..."
            maxLength={200}
            className="min-h-[56px] w-full max-w-xs resize-none text-sm"
          />
          <div className="mt-3">
            <Button type="submit" variant="outline" size="default">
              Save description
            </Button>
          </div>
        </form>
      </div>

      {/* Error banner */}
      {pageError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {pageError}
        </div>
      )}

      {/* Projects table card */}
      <div className="rounded-xl border border-border bg-card">
        {/* Toolbar: Create Project button */}
        <div className="border-b border-border p-5">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Create Project</Button>
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

        {/* Projects list */}
        {projects.length === 0 ? (
          <div className="flex min-h-36 items-center justify-center px-5 py-10 text-center">
            <p className="text-sm text-muted-foreground">{LABELS.emptyStates.noProjects}</p>
          </div>
        ) : (
          <>
            {/* Desktop: horizontal table */}
            <div className="hidden md:block">
              <div className="divide-y divide-border">
                {/* Header row */}
                <div className="flex items-center px-5 py-3 text-sm text-muted-foreground">
                  <div className="flex-1 font-medium">Name</div>
                  <div className="w-24 font-medium">Month</div>
                  <div className="w-20 font-medium">Year</div>
                  <div className="w-28 font-medium">Status</div>
                  <div className="w-20 font-medium text-right">Actions</div>
                </div>
                {/* Data rows */}
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center px-5 py-4 text-sm transition-colors hover:bg-muted/30"
                  >
                    <div className="flex-1">
                      <Link
                        href={`/admin/clients/${clientId}/projects/${project.id}`}
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        {project.name}
                      </Link>
                    </div>
                    <div className="w-24 text-muted-foreground">{monthName(project.month)}</div>
                    <div className="w-20 text-muted-foreground">{project.year}</div>
                    <div className="w-28">
                      <StatusDot status={project.status} />
                    </div>
                    <div className="w-20 text-right">
                      <form action={deleteProjectAction.bind(null, project.id, clientId)}>
                        <button
                          type="submit"
                          className="inline-block border-b border-foreground/30 text-sm text-foreground hover:border-destructive hover:text-destructive transition-colors"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile: stacked cards */}
            <div className="divide-y divide-border md:hidden">
              {projects.map((project) => (
                <div key={project.id} className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <Link
                      href={`/admin/clients/${clientId}/projects/${project.id}`}
                      className="text-base font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {project.name}
                    </Link>
                    <StatusDot status={project.status} />
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">
                    {monthName(project.month)} {project.year}
                  </p>
                  <form action={deleteProjectAction.bind(null, project.id, clientId)}>
                    <button
                      type="submit"
                      className="min-h-[44px] w-full rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-destructive transition hover:bg-destructive/5"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
