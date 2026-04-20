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
import { ArrowLeft, Briefcase, ExternalLink, Plus, Share2, Trash2 } from 'lucide-react'

type ClientRecord = {
  id: string
  name: string
  slug: string
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

function monthShort(month: number) {
  return new Date(0, month - 1).toLocaleString('default', { month: 'short' })
}

const statusConfig: Record<string, { label: string; dot: string; bg: string }> = {
  active: { label: 'Active', dot: 'bg-green-500', bg: 'bg-green-50 text-green-700 border-green-200' },
  paused: { label: 'Paused', dot: 'bg-yellow-500', bg: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  done: { label: 'Done', dot: 'bg-gray-400', bg: 'bg-gray-50 text-gray-600 border-gray-200' },
}

function ProjectFormDialog({ clientId, clientName }: { clientId: string; clientName: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-3.5 w-3.5" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>Add a new monthly project for {clientName}.</DialogDescription>
        </DialogHeader>
        <form action={createProjectAction.bind(null, clientId)} className="space-y-5 pt-2">
          <div className="space-y-2">
            <label htmlFor="proj-name" className="text-sm font-medium text-foreground">{LABELS.common.name}</label>
            <Input id="proj-name" minLength={2} name="name" placeholder={LABELS.common.monthPlaceholder} required className="h-10" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="proj-month" className="text-sm font-medium text-foreground">{LABELS.common.month}</label>
              <select className="w-full rounded-lg border border-input px-3 py-2 text-sm h-10" defaultValue={String(new Date().getMonth() + 1)} id="proj-month" name="month">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{monthName(m)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="proj-year" className="text-sm font-medium text-foreground">{LABELS.common.year}</label>
              <Input defaultValue={new Date().getFullYear()} id="proj-year" name="year" required type="number" className="h-10" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="proj-status" className="text-sm font-medium text-foreground">Status</label>
            <select className="w-full rounded-lg border border-input px-3 py-2 text-sm h-10" defaultValue="active" id="proj-status" name="status">
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="flex justify-end pt-1">
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
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
    .select('id, name, slug, color, description, is_active')
    .eq('id', clientId)
    .single<ClientRecord>()

  if (clientError || !client) {
    notFound()
  }

  const { data: projects, error: projectsError } = await serviceRoleClient
    .from('projects')
    .select('id, name, month, year, status')
    .eq('client_id', clientId)
    .order('status', { ascending: true })
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .returns<ProjectRecord[]>()

  if (projectsError) {
    notFound()
  }

  const { data: taskCounts } = await serviceRoleClient
    .from('tasks')
    .select('project_id, status')
    .in('project_id', (projects ?? []).map(p => p.id))

  const taskCountMap: Record<string, { total: number; done: number }> = {}
  for (const t of taskCounts ?? []) {
    const pid = t.project_id as string
    if (!taskCountMap[pid]) taskCountMap[pid] = { total: 0, done: 0 }
    taskCountMap[pid].total++
    if (t.status === 'done') taskCountMap[pid].done++
  }

  const displayColor = client.color || getColorForClient(client.name)
  const activeProjects = (projects ?? []).filter((p) => p.status === 'active')
  const otherProjects = (projects ?? []).filter((p) => p.status !== 'active')
  const totalTasks = Object.values(taskCountMap).reduce((s, c) => s + c.total, 0)
  const completedTasks = Object.values(taskCountMap).reduce((s, c) => s + c.done, 0)

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/admin/clients" className="inline-flex items-center gap-1.5 text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Clients
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="font-medium text-foreground">{client.name}</span>
      </nav>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="h-1.5" style={{ backgroundColor: displayColor }} />
        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${client.is_active ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${client.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {client.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <Link
                  href={`/portal/${client.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 underline underline-offset-4 transition hover:text-foreground"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View portal
                </Link>
                <span className="text-muted-foreground/30">·</span>
                <span>{totalTasks} task{totalTasks !== 1 ? 's' : ''} total</span>
                <span className="text-muted-foreground/30">·</span>
                <span>{activeProjects.length} active project{activeProjects.length !== 1 ? 's' : ''}</span>
              </div>
              {client.description && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-2xl">
                  {client.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ProjectFormDialog clientId={clientId} clientName={client.name} />
            </div>
          </div>

          <form action={updateClientDescriptionAction.bind(null, clientId)} className="mt-5 pt-5 border-t border-border">
            <label className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">Description</label>
            <div className="mt-1.5 flex flex-col gap-2 sm:flex-row sm:items-start">
              <Textarea
                name="description"
                defaultValue={client.description ?? ''}
                placeholder="Add a client description..."
                maxLength={200}
                className="min-h-[40px] flex-1 resize-none text-sm"
                rows={2}
              />
              <Button type="submit" variant="outline" size="sm" className="shrink-0">
                Save
              </Button>
            </div>
          </form>
        </div>
      </div>

      {pageError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {pageError}
        </div>
      )}

      {activeProjects.length > 0 && (
        <section>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Active Projects · {activeProjects.length}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeProjects.map((project) => {
              const config = statusConfig[project.status] ?? statusConfig.active
              const counts = taskCountMap[project.id]
              const progress = counts && counts.total > 0 ? (counts.done / counts.total) * 100 : 0

              return (
                <Link
                  key={project.id}
                  href={`/admin/clients/${clientId}/projects/${project.id}`}
                  className="group rounded-xl border border-border bg-card p-5 transition hover:border-primary/20 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-foreground truncate group-hover:underline">{project.name}</h4>
                      <p className="mt-0.5 text-xs text-muted-foreground">{monthShort(project.month)} {project.year}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${config.bg}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                      {config.label}
                    </span>
                  </div>

                  {counts && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
                        <span>{counts.done} of {counts.total} tasks done</span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-green-500 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {otherProjects.length > 0 && (
        <section>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Other · {otherProjects.length}
          </h3>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="divide-y divide-border">
              {otherProjects.map((project) => {
                const config = statusConfig[project.status] ?? statusConfig.active
                const counts = taskCountMap[project.id]

                return (
                  <div key={project.id} className="group flex items-center gap-3 px-4 py-3 transition hover:bg-muted/30">
                    <Link
                      href={`/admin/clients/${clientId}/projects/${project.id}`}
                      className="flex-1 min-w-0"
                    >
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate group-hover:underline">{project.name}</p>
                        <span className={`inline-flex items-center gap-1 shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${config.bg}`}>
                          <span className={`h-1 w-1 rounded-full ${config.dot}`} />
                          {config.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {monthShort(project.month)} {project.year}
                        {counts && ` · ${counts.done}/${counts.total} tasks`}
                      </p>
                    </Link>
                    <form action={deleteProjectAction.bind(null, project.id, clientId)}>
                      <button
                        type="submit"
                        className="rounded-md p-1.5 text-muted-foreground/50 transition hover:text-destructive hover:bg-destructive/5"
                        aria-label={`Delete ${project.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {projects && projects.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <Briefcase className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 text-lg font-medium text-foreground">No projects yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Create your first project for {client.name}.</p>
          <div className="mt-4">
            <ProjectFormDialog clientId={clientId} clientName={client.name} />
          </div>
        </div>
      )}
    </div>
  )
}