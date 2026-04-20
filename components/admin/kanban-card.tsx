'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { format, isBefore, startOfDay } from 'date-fns'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ImageUp, LoaderCircle, Upload, X } from 'lucide-react'

import type { TaskRow } from '@/app/admin/clients/[clientId]/projects/[projectId]/task-view-toggle'
import { updateTaskFilePathAction } from '@/app/admin/clients/[clientId]/projects/[projectId]/actions'
import { StatusDot } from '@/components/ui/status-dot'
import { ContentCard } from '@/components/ui/content-card'
import { Button } from '@/components/ui/button'
import { TaskDetailDialog } from '@/components/admin/task-detail-dialog'
import { cn } from '@/lib/utils'

type KanbanCardProps = {
  task: TaskRow
  projectId: string
}

function getTaskTags(task: TaskRow): string[] {
  const tags: string[] = []
  if (task.caption) tags.push('Content')
  if (task.design_file_path) tags.push('Design')
  if (task.briefing) tags.push('Briefed')
  if (!task.caption && !task.design_file_path && !task.briefing) tags.push('Todo')
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

function DesignUploadButton({
  taskId,
  projectId,
  onUploadComplete,
}: {
  taskId: string
  projectId: string
  onUploadComplete: (path: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Only images allowed')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Max 10MB')
      return
    }

    setUploading(true)
    setError(null)

    const ext = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') ?? 'jpg'
    const fileName = `${crypto.randomUUID()}.${ext}`
    const path = `${projectId}/temp/${crypto.randomUUID()}/${fileName}`

    try {
      const formData = new FormData()
      formData.set('file', file)
      formData.set('path', path)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        const finalPath = data.path

        const result = await updateTaskFilePathAction(taskId, finalPath)
        if (result.success) {
          onUploadComplete(finalPath)
        } else {
          setError(result.error ?? 'Failed to save')
        }
      } else {
        setError('Upload failed')
      }
    } catch {
      setError('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
          e.target.value = ''
        }}
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          inputRef.current?.click()
        }}
        className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition"
      >
        {uploading ? (
          <LoaderCircle className="h-3 w-3 animate-spin" />
        ) : (
          <Upload className="h-3 w-3" />
        )}
        {uploading ? 'Uploading' : 'Upload'}
      </button>
      {error && (
        <span className="text-[10px] text-destructive ml-1">{error}</span>
      )}
    </>
  )
}

export function KanbanCard({ task, projectId }: KanbanCardProps) {
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [currentDesignPath, setCurrentDesignPath] = useState(task.design_file_path)
  useEffect(() => setIsMounted(true), [])

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const overdue = isTaskOverdue(task)
  const cardDate = formatCardDate(task)

  const displayTask = { ...task, design_file_path: currentDesignPath }
  const tags = getTaskTags(displayTask)

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-no-click]')) return
    setDetailDialogOpen(true)
  }

  return (
    <>
      <article
        ref={setNodeRef}
        style={style}
        data-dragging={isDragging ? 'true' : 'false'}
        onClick={handleCardClick}
      >
        <ContentCard
          variant="kanban"
          className={cn(
            'group bg-background transition hover:shadow-sm relative',
            overdue ? 'border-destructive/40 hover:border-destructive/60' : 'hover:border-foreground/30 cursor-pointer'
          )}
        >
          {isMounted && (
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              {...attributes}
              {...listeners}
              className="absolute top-2 right-2 cursor-grab active:cursor-grabbing p-0.5 text-muted-foreground hover:text-foreground transition-opacity"
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </button>
          )}

          {tags.length > 0 && (
            <div className="mb-1.5 flex flex-wrap items-center gap-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em] whitespace-nowrap',
                    tag === 'Content' ? 'bg-blue-100 text-blue-700' :
                    tag === 'Design' ? 'bg-purple-100 text-purple-700' :
                    tag === 'Briefed' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-muted text-muted-foreground'
                  )}
                >
                  {tag === 'Design' ? (
                    <span className="inline-flex items-center gap-0.5">
                      <ImageUp className="h-2.5 w-2.5" />
                      Design
                    </span>
                  ) : tag}
                </span>
              ))}

              {!currentDesignPath && (
                <div data-no-click="true" className="shrink-0">
                  <DesignUploadButton
                    taskId={task.id}
                    projectId={projectId}
                    onUploadComplete={(path) => setCurrentDesignPath(path)}
                  />
                </div>
              )}
            </div>
          )}

          {!tags.length && !currentDesignPath && (
            <div className="mb-1.5 flex items-center gap-1" data-no-click="true">
              <DesignUploadButton
                taskId={task.id}
                projectId={projectId}
                onUploadComplete={(path) => setCurrentDesignPath(path)}
              />
            </div>
          )}

          <p className="mb-2 text-sm font-medium leading-snug text-foreground line-clamp-2 break-words">
            {task.title}
          </p>

          <div className="flex items-center justify-between">
            <StatusDot status={overdue ? 'overdue' : task.status} />
            {cardDate && (
              <span className={cn(
                'text-[11px] font-medium',
                overdue ? 'text-destructive' : 'text-muted-foreground'
              )}>
                {cardDate}
              </span>
            )}
          </div>

          {overdue && (
            <div className="mt-2 inline-flex items-center gap-1 rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
              Overdue
            </div>
          )}
        </ContentCard>
      </article>

      <TaskDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        task={displayTask}
        projectId={projectId}
      />
    </>
  )
}