'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { format, isBefore, startOfDay } from 'date-fns'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ImageUp, LoaderCircle, Upload } from 'lucide-react'

import type { TaskRow } from '@/app/admin/clients/[clientId]/projects/[projectId]/task-view-toggle'
import { updateTaskFilePathAction } from '@/app/admin/clients/[clientId]/projects/[projectId]/actions'
import { TaskDetailDialog } from '@/components/admin/task-detail-dialog'
import { cn } from '@/lib/utils'

type KanbanCardProps = {
  task: TaskRow
  projectId: string
  clientId: string
}

const statusPill: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  todo: { label: 'To Do', dot: 'bg-[#999999]', bg: 'bg-[#999999]/10', text: 'text-[#666666]' },
  in_progress: { label: 'In Progress', dot: 'bg-[#D4A843]', bg: 'bg-[#D4A843]/10', text: 'text-[#D4A843]' },
  done: { label: 'Done', dot: 'bg-[#4A9E5C]', bg: 'bg-[#4A9E5C]/10', text: 'text-[#4A9E5C]' },
}

function getTaskTags(task: TaskRow): string[] {
  const tags: string[] = []
  if (task.caption) tags.push('Content')
  if (task.design_file_path) tags.push('Design')
  if (task.briefing) tags.push('Briefed')
  return tags
}

function formatCardDate(task: TaskRow) {
  const date = task.due_date || task.posting_date
  if (!date) return null
  return format(new Date(date), 'MMM d')
}

function isTaskOverdue(task: TaskRow) {
  const date = task.due_date || task.posting_date
  return Boolean(
    date && isBefore(startOfDay(new Date(date)), startOfDay(new Date())) && task.status !== 'done'
  )
}

function DesignUploadButton({ taskId, projectId, onUploadComplete }: {
  taskId: string
  projectId: string
  onUploadComplete: (path: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { setError('Only images'); return }
    if (file.size > 10 * 1024 * 1024) { setError('Max 10MB'); return }
    setUploading(true)
    setError(null)
    const ext = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') ?? 'jpg'
    const path = `${projectId}/temp/${crypto.randomUUID()}/${crypto.randomUUID()}.${ext}`
    try {
      const formData = new FormData()
      formData.set('file', file)
      formData.set('path', path)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        const result = await updateTaskFilePathAction(taskId, data.path)
        if (result.success) onUploadComplete(data.path)
        else setError(result.error ?? 'Failed')
      } else {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? 'Upload failed')
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Upload failed') }
    finally { setUploading(false) }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = '' }} />
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
        className="inline-flex items-center gap-1 rounded-md border border-dashed border-border bg-surface-raised/50 px-1.5 py-0.5 text-[10px] font-medium text-foreground hover:bg-surface-raised hover:border-border-visible transition"
      >
        {uploading ? <LoaderCircle className="h-3 w-3 animate-spin" /> : <Upload className="h-2.5 w-2.5" />}
        Upload
      </button>
      {error && <span className="text-[10px] text-[#D71921]">{error}</span>}
    </>
  )
}

export function KanbanCard({ task, projectId, clientId }: KanbanCardProps) {
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [currentDesignPath, setCurrentDesignPath] = useState(task.design_file_path)
  useEffect(() => setIsMounted(true), [])

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  const overdue = isTaskOverdue(task)
  const cardDate = formatCardDate(task)
  const s = overdue
    ? { label: 'Overdue', dot: 'bg-[#D71921]', bg: 'bg-[#D71921]/10', text: 'text-[#D71921]' }
    : (statusPill[task.status] ?? statusPill.todo)
  const tags = getTaskTags({ ...task, design_file_path: currentDesignPath })
  const displayTask = { ...task, design_file_path: currentDesignPath }

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-no-click]')) return
    setDetailDialogOpen(true)
  }

  return (
    <>
      <article
        ref={setNodeRef}
        style={style}
        data-dragging={isDragging ? 'true' : 'false'}
        onClick={handleClick}
        className={cn(
          'group relative rounded-lg border bg-surface p-3 cursor-pointer transition-all',
          'hover:border-foreground/20',
          overdue ? 'border-[#D71921]/20' : 'border-border'
        )}
      >
        {isMounted && (
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            {...attributes}
            {...listeners}
            className="absolute top-2.5 right-2.5 cursor-grab active:cursor-grabbing rounded p-0.5 text-muted-foreground/40 hover:text-muted-foreground transition"
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        )}

        {tags.length > 0 && (
          <div className="mb-1.5 flex flex-wrap items-center gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                  tag === 'Content' ? 'bg-[#D4A843]/10 text-[#D4A843]' :
                  tag === 'Design' ? 'bg-surface-raised text-foreground' :
                  'bg-[#4A9E5C]/10 text-[#4A9E5C]'
                )}
              >
                {tag}
              </span>
            ))}
            {!currentDesignPath && (
              <div data-no-click="true" className="shrink-0">
                <DesignUploadButton taskId={task.id} projectId={projectId} onUploadComplete={(path) => setCurrentDesignPath(path)} />
              </div>
            )}
          </div>
        )}

        {tags.length === 0 && !currentDesignPath && (
          <div className="mb-1.5" data-no-click="true">
            <DesignUploadButton taskId={task.id} projectId={projectId} onUploadComplete={(path) => setCurrentDesignPath(path)} />
          </div>
        )}

        <p className="mb-2 text-sm font-medium leading-snug text-foreground line-clamp-2 break-words pr-6">
          {task.title}
        </p>

        <div className="flex items-center justify-between">
          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', s.bg, s.text)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
            {s.label}
          </span>
          {cardDate && (
            <span className={cn('text-[11px] tabular-nums', overdue ? 'font-semibold text-[#D71921]' : 'text-muted-foreground')}>
              {cardDate}
            </span>
          )}
        </div>
      </article>

      <TaskDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        task={displayTask}
        projectId={projectId}
        clientId={clientId}
      />
    </>
  )
}