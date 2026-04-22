'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { format, isBefore, startOfDay } from 'date-fns'
import { Copy, Download, ImageUp, LoaderCircle, Pencil } from 'lucide-react'
import Link from 'next/link'

import type { TaskRow } from '@/app/admin/clients/[clientId]/projects/[projectId]/task-view-toggle'
import { updateTaskFilePathAction } from '@/app/admin/clients/[clientId]/projects/[projectId]/actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

type TaskDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: TaskRow | null
  projectId?: string
  clientId?: string
  onDesignUpload?: (path: string) => void
}

function isImageFile(path: string | null) {
  if (!path) return false
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext)
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return format(new Date(dateStr), 'MMM d, yyyy')
}

function formatTime(timeStr: string | null) {
  if (!timeStr) return ''
  if (timeStr.includes(':')) {
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }
  return timeStr
}

const statusConfig: Record<string, { label: string; dot: string; text: string }> = {
  todo: { label: 'To Do', dot: 'bg-[#999999]', text: 'text-[#999999]' },
  in_progress: { label: 'In Progress', dot: 'bg-[#D4A843]', text: 'text-[#D4A843]' },
  done: { label: 'Done', dot: 'bg-[#4A9E5C]', text: 'text-[#4A9E5C]' },
}

function InlineDesignUploader({ taskId, projectId, onUploadComplete }: {
  taskId: string
  projectId: string
  onUploadComplete: (path: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { setError('Only image files are supported.'); return }
    if (file.size > 10 * 1024 * 1024) { setError('Files must be 10MB or smaller.'); return }
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
        else setError(result.error ?? 'Failed to save.')
      } else { setError('Upload failed.') }
    } catch { setError('Upload failed.') }
    finally { setUploading(false) }
  }

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = '' }} />
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click() } }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) void handleFile(f) }}
        className={cn(
          'rounded-lg border-2 border-dashed transition cursor-pointer',
          isDragging ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/20 hover:bg-surface-raised'
        )}
      >
        <div className="flex flex-col items-center gap-2 py-6">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-raised">
            {uploading ? <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" /> : <ImageUp className="h-5 w-5 text-muted-foreground" />}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Upload design file</p>
            <p className="mt-0.5 text-xs text-muted-foreground font-mono uppercase tracking-[0.06em]">Drag and drop or click to browse (max 10MB)</p>
          </div>
        </div>
      </div>
      {error && <p className="text-sm text-[#D71921]">{error}</p>}
    </div>
  )
}

export function TaskDetailDialog({ open, onOpenChange, task, projectId, clientId, onDesignUpload }: TaskDetailDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState(false)
  const [currentDesignPath, setCurrentDesignPath] = useState<string | null>(null)
  const prevFilePath = useRef<string | null>(null)

  useEffect(() => {
    if (task?.design_file_path) setCurrentDesignPath(task.design_file_path)
    else setCurrentDesignPath(null)
    setPreviewUrl(null)
  }, [task?.id])

  const filePathToLoad = currentDesignPath && isImageFile(currentDesignPath) ? currentDesignPath : null

  useEffect(() => {
    if (!filePathToLoad) { setPreviewUrl(null); setPreviewLoading(false); return }
    if (prevFilePath.current === filePathToLoad && previewUrl) return
    prevFilePath.current = filePathToLoad
    setPreviewLoading(true)
    setPreviewUrl(null)
    let cancelled = false
    createClient()
      .storage.from('design-files')
      .createSignedUrl(filePathToLoad, 3600)
      .then(({ data, error }) => { if (!cancelled && !error && data?.signedUrl) setPreviewUrl(`${data.signedUrl}&width=800&height=600&resize=contain`) })
      .finally(() => { if (!cancelled) setPreviewLoading(false) })
    return () => { cancelled = true }
  }, [filePathToLoad])

  const handleCopyCaption = async () => {
    if (!task?.caption) return
    try { await navigator.clipboard.writeText(task.caption); setCopyFeedback(true); setTimeout(() => setCopyFeedback(false), 2000) }
    catch { /* */ }
  }

  if (!task) return null

  const isOverdue = Boolean(
    (task.due_date || task.posting_date) &&
    isBefore(startOfDay(new Date(task.due_date || task.posting_date!)), startOfDay(new Date())) &&
    task.status !== 'done'
  )
  const s = isOverdue
    ? { label: 'Overdue', dot: 'bg-[#D71921]', text: 'text-[#D71921]' }
    : (statusConfig[task.status] ?? statusConfig.todo)
  const caption = task.caption ?? ''
  const briefing = task.briefing ?? ''
  const fileName = currentDesignPath?.split('/').pop() ?? null
  const isDesignImage = isImageFile(currentDesignPath)
  const hasDesignFile = currentDesignPath && fileName

  function handleDesignUpload(path: string) {
    setCurrentDesignPath(path)
    onDesignUpload?.(path)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight pr-8">{task.title}</DialogTitle>
          <DialogDescription className="sr-only">Task details for {task.title}</DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-6">
          {/* Caption */}
          {caption && (
            <section>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Caption</h3>
                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-surface-raised hover:text-foreground transition font-mono uppercase tracking-[0.06em]"
                >
                  <Copy className="h-3 w-3" />
                  {copyFeedback ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="rounded-lg border border-border bg-surface-raised px-4 py-3">
                <p className="whitespace-pre-wrap break-words text-sm text-foreground leading-relaxed">{caption}</p>
              </div>
            </section>
          )}

          {/* Briefing */}
          {briefing && (
            <section>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-2">Briefing</h3>
              <div className="rounded-lg border border-border bg-surface-raised px-4 py-3 text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: briefing }} />
            </section>
          )}

          {/* Design File */}
          <section>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-2">Design file</h3>
            {hasDesignFile ? (
              <div className="space-y-3">
                {isDesignImage && previewLoading && !previewUrl && (
                  <div className="flex items-center justify-center rounded-lg border border-border py-10">
                    <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
                {isDesignImage && previewUrl && (
                  <div className="group relative overflow-hidden rounded-lg border border-border">
                    <img src={previewUrl} alt="Design preview" className="h-auto w-full object-contain bg-surface-raised" />
                    <div className="absolute right-3 top-3">
                      <DownloadButton filePath={currentDesignPath!} />
                    </div>
                  </div>
                )}
                {(!isDesignImage || !previewUrl) && (
                  <DownloadButton filePath={currentDesignPath!} />
                )}
              </div>
            ) : (
              <InlineDesignUploader taskId={task.id} projectId={projectId ?? ''} onUploadComplete={handleDesignUpload} />
            )}
          </section>

          {/* Schedule */}
          {(task.posting_date || task.due_date || task.deadline) && (
            <section>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-2">Schedule</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {task.posting_date && (
                  <div className="rounded-lg border border-border px-3 py-2.5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground mb-1">Posting Date</p>
                    <p className="text-sm font-medium text-foreground">{formatDate(task.posting_date)}{task.posting_time && <span className="text-muted-foreground font-normal"> at {formatTime(task.posting_time)}</span>}</p>
                  </div>
                )}
                {task.due_date && (
                  <div className="rounded-lg border border-border px-3 py-2.5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground mb-1">Due Date</p>
                    <p className="text-sm font-medium text-foreground">{formatDate(task.due_date)}</p>
                  </div>
                )}
                {task.deadline && (
                  <div className="rounded-lg border border-border px-3 py-2.5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground mb-1">Deadline</p>
                    <p className="text-sm font-medium text-foreground">{formatDate(task.deadline)}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold', s.text)}>
              <span className={cn('h-2 w-2 rounded-full', s.dot)} />
              {s.label}
            </span>
            {projectId && clientId && (
              <Link
                href={`/admin/clients/${clientId}/projects/${projectId}/tasks/${task.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-medium text-foreground transition hover:bg-surface-raised font-mono uppercase tracking-[0.06em]"
              >
                <Pencil className="h-3 w-3" />
                Edit task
              </Link>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DownloadButton({ filePath }: { filePath: string }) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function download() {
    setError(null)
    startTransition(async () => {
      const supabase = createClient()
      const { data, error: signedUrlError } = await supabase.storage.from('design-files').createSignedUrl(filePath, 60)
      if (signedUrlError || !data?.signedUrl) { setError('Download link expired, please refresh'); return }
      window.open(data.signedUrl, '_blank')
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline" size="icon" className="h-8 w-8 bg-surface hover:bg-surface" onClick={download} disabled={isPending} title="Download">
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      </Button>
      {error && <p className="text-xs text-[#D71921]">{error}</p>}
    </div>
  )
}
