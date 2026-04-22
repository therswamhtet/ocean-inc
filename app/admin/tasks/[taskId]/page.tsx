import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeft, ChevronRight, ExternalLink, FileImage, FileText } from 'lucide-react'

import { createServiceRoleClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import DesignFileDownloader from '@/components/admin/design-file-downloader'

type TaskRecord = {
  id: string
  project_id: string | null
  title: string
  briefing: string | null
  caption: string | null
  design_file_path: string | null
  posting_date: string | null
  due_date: string | null
  deadline: string | null
  status: 'todo' | 'in_progress' | 'done'
}

type ProjectRecord = {
  id: string
  name: string
  client_id: string
  clients: {
    id: string
    name: string
  } | null
}

const statusConfig: Record<string, { label: string; dot: string; text: string }> = {
  todo: { label: 'To Do', dot: 'bg-[#999999]', text: 'text-[#999999]' },
  in_progress: { label: 'In Progress', dot: 'bg-[#D4A843]', text: 'text-[#D4A843]' },
  done: { label: 'Done', dot: 'bg-[#4A9E5C]', text: 'text-[#4A9E5C]' },
}

function isImageFile(path: string | null) {
  if (!path) return false
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext)
}

function getFileName(path: string | null) {
  if (!path) return null
  return path.split('/').pop() ?? null
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-4 py-3 border-b border-border last:border-0">
      <dt className="w-32 shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm font-medium text-foreground">{children}</dd>
    </div>
  )
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>
}) {
  const { taskId } = await params
  const serviceRoleClient = createServiceRoleClient()

  const { data: task, error: taskError } = await serviceRoleClient
    .from('tasks')
    .select('id, project_id, title, briefing, caption, design_file_path, posting_date, due_date, deadline, status')
    .eq('id', taskId)
    .single<TaskRecord>()

  if (taskError || !task) {
    notFound()
  }

  let project: ProjectRecord | null = null
  if (task.project_id) {
    const { data: projectData } = await serviceRoleClient
      .from('projects')
      .select('id, name, client_id, clients(id, name)')
      .eq('id', task.project_id)
      .single<ProjectRecord>()
    project = projectData
  }

  // Fetch signed URL for design preview
  let designPreviewUrl: string | null = null
  if (task.design_file_path && isImageFile(task.design_file_path)) {
    const { data } = await serviceRoleClient
      .storage
      .from('design-files')
      .createSignedUrl(task.design_file_path, 3600)
    designPreviewUrl = data?.signedUrl ?? null
  }

  const s = statusConfig[task.status] ?? statusConfig.todo
  const fileName = getFileName(task.design_file_path)

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-muted-foreground overflow-x-auto">
        <Link className="hover:text-foreground transition shrink-0 font-mono uppercase tracking-[0.06em]" href="/admin">Dashboard</Link>
        {project && (
          <>
            <ChevronRight className="h-3 w-3 shrink-0" strokeWidth={1.5} />
            <Link className="hover:text-foreground transition shrink-0 font-mono uppercase tracking-[0.06em]" href={`/admin/clients/${project.client_id}`}>{project.clients?.name ?? 'Client'}</Link>
            <ChevronRight className="h-3 w-3 shrink-0" strokeWidth={1.5} />
            <Link className="hover:text-foreground transition shrink-0 font-mono uppercase tracking-[0.06em]" href={`/admin/clients/${project.client_id}/projects/${project.id}`}>{project.name}</Link>
            <ChevronRight className="h-3 w-3 shrink-0" strokeWidth={1.5} />
          </>
        )}
        <span className="truncate text-foreground font-medium">{task.title}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground leading-tight">{task.title}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold', s.text)}>
            <span className={cn('h-2 w-2 rounded-full', s.dot)} />
            {s.label}
          </span>
          {project && (
            <Link
              href={`/admin/clients/${project.client_id}/projects/${project.id}/tasks/${task.id}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-medium text-foreground transition hover:bg-surface-raised font-mono uppercase tracking-[0.06em]"
            >
              <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
              Edit
            </Link>
          )}
        </div>
      </div>

      {/* Details */}
      <section className="rounded-lg border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <FileText className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Details</h2>
        </div>
        <div className="px-5">
          <dl>
            {task.posting_date && (
              <DetailRow label="Posting Date">
                {format(new Date(task.posting_date), 'MMMM d, yyyy')}
              </DetailRow>
            )}
            {task.due_date && (
              <DetailRow label="Due Date">
                {format(new Date(task.due_date), 'MMMM d, yyyy')}
              </DetailRow>
            )}
            {task.deadline && (
              <DetailRow label="Deadline">
                {format(new Date(task.deadline), 'MMMM d, yyyy')}
              </DetailRow>
            )}
            {project && (
              <DetailRow label="Project">
                <Link href={`/admin/clients/${project.client_id}/projects/${project.id}`} className="hover:underline">
                  {project.name}
                </Link>
              </DetailRow>
            )}
            {!task.posting_date && !task.due_date && !task.deadline && !project && (
              <div className="py-4 text-sm text-muted-foreground">No details available.</div>
            )}
          </dl>
        </div>
      </section>

      {/* Design Preview */}
      {task.design_file_path && (
        <section className="rounded-lg border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3">
            <FileImage className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Design Preview</h2>
          </div>
          <div className="p-5 space-y-4">
            {designPreviewUrl ? (
              <div className="overflow-hidden rounded-lg border border-border bg-surface-raised">
                <img
                  src={designPreviewUrl}
                  alt={fileName ?? 'Design preview'}
                  className="h-auto w-full max-h-[400px] object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-lg border border-border py-16">
                <p className="text-sm text-muted-foreground font-mono uppercase tracking-[0.06em]">Preview not available for this file type</p>
              </div>
            )}
            {fileName && (
              <DesignFileDownloader filePath={task.design_file_path} fileName={fileName} />
            )}
          </div>
        </section>
      )}

      {/* Caption */}
      {task.caption && (
        <section>
          <h2 className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Caption</h2>
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{task.caption}</p>
          </div>
        </section>
      )}

      {/* Briefing */}
      {task.briefing && (
        <section>
          <h2 className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Briefing</h2>
          <div className="rounded-lg border border-border bg-surface p-5 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {task.briefing}
          </div>
        </section>
      )}

      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground font-mono uppercase tracking-[0.06em]"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Back to Dashboard
      </Link>
    </div>
  )
}
