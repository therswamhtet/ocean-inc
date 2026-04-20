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

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  todo: { label: 'To Do', dot: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-600' },
  in_progress: { label: 'In Progress', dot: 'bg-blue-400', bg: 'bg-blue-50', text: 'text-blue-600' },
  done: { label: 'Done', dot: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-600' },
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
          'rounded-lg border-2 border-dashed px-6 py-8 text-center transition cursor-pointer',
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/30'
        )}
      >
        <div className="mx-auto flex flex-col items-center gap-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/50">
            {uploading ? <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" /> : <ImageUp className="h-5 w-5 text-muted-foreground" />}
          </div>
          <p className="text-sm font-medium text-foreground">Upload design file</p>
          <p className="text-xs text-muted-foreground">Drag and drop or click to browse (max 10MB)</p>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
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
    ? { label: 'Overdue', dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-600' }
    : (statusConfig[task.status] ?? statusConfig.todo)
  const caption = task.caption ?? ''
  const briefing = task.briefing ?? ''
  const fileName = currentDesignPath?.split('/').pop() ?? null
  const isDesignImage = isImageFile(currentDesignPath)
  const postingDateTime = task.posting_date
    ? `${formatDate(task.posting_date)}${task.posting_time ? ` at ${formatTime(task.posting_time)}` : ''}`
    : '—'

  function handleDesignUpload(path: string) {
    setCurrentDesignPath(path)
    onDesignUpload?.(path)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold pr-8">{task.title}</DialogTitle>
          <DialogDescription className="sr-only">Task details for {task.title}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between pt-1">
          <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', s.bg, s.text)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
            {s.label}
          </span>
          {projectId && clientId && (
            <Link
              href={`/admin/clients/${clientId}/projects/${projectId}/tasks/${task.id}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted/50"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Link>
          )}
        </div>

        <div className="space-y-4">
          {caption && (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Caption</label>
                <button type="button" onClick={handleCopyCaption} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition">
                  <Copy className="h-3 w-3" />
                  {copyFeedback ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                <p className="whitespace-pre-wrap break-words text-sm text-foreground leading-relaxed">{caption}</p>
              </div>
            </div>
          )}

          {briefing && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Briefing</label>
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: briefing }} />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Design file</label>
            {currentDesignPath && fileName ? (
              <div className="space-y-3">
                {isDesignImage && previewLoading && !previewUrl && (
                  <div className="flex items-center justify-center rounded-lg border border-border py-8">
                    <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
                {isDesignImage && previewUrl && (
                  <div className="overflow-hidden rounded-lg border border-border">
                    <img src={previewUrl} alt="Design preview" className="h-auto w-full max-h-80 object-contain bg-muted/20" />
                  </div>
                )}
                <DownloadButton fileName={fileName} filePath={currentDesignPath} />
              </div>
            ) : (
              <InlineDesignUploader taskId={task.id} projectId={projectId ?? ''} onUploadComplete={handleDesignUpload} />
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Details</label>
            <div className="grid gap-2 sm:grid-cols-2">
              {task.posting_date && (
                <div className="rounded-lg border border-border px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-0.5">Posting Date</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(task.posting_date)}{task.posting_time && <span className="text-muted-foreground"> at {formatTime(task.posting_time)}</span>}</p>
                </div>
              )}
              {task.due_date && (
                <div className="rounded-lg border border-border px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-0.5">Due Date</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(task.due_date)}</p>
                </div>
              )}
              {task.deadline && (
                <div className="rounded-lg border border-border px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-0.5">Deadline</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(task.deadline)}</p>
                </div>
              )}
              {!task.posting_date && !task.due_date && !task.deadline && (
                <p className="text-sm text-muted-foreground col-span-2">No dates set.</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DownloadButton({ fileName, filePath }: { fileName: string; filePath: string }) {
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
      <Button type="button" variant="outline" size="sm" onClick={download} disabled={isPending}>
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {fileName}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}