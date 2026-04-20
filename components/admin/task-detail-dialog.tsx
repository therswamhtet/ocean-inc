'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { format } from 'date-fns'
import { Check, Download, LoaderCircle, Copy, Pencil, ImageUp, Upload, X } from 'lucide-react'

import type { TaskRow } from '@/app/admin/clients/[clientId]/projects/[projectId]/task-view-toggle'
import { updateTaskFilePathAction } from '@/app/admin/clients/[clientId]/projects/[projectId]/actions'
import { LABELS } from '@/lib/labels'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StatusDot } from '@/components/ui/status-dot'
import { createClient } from '@/lib/supabase/client'
import { linkify } from '@/lib/utils'

type TaskDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: TaskRow | null
  projectId?: string
  onEdit?: () => void
  onDesignUpload?: (path: string) => void
}

function isImageFile(path: string | null) {
  if (!path) return false
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext)
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return 'Not set'
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

function InlineDesignUploader({
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
      setError('Only image files are supported.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Files must be 10MB or smaller.')
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
        const result = await updateTaskFilePathAction(taskId, data.path)
        if (result.success) {
          onUploadComplete(data.path)
        } else {
          setError(result.error ?? 'Failed to save path.')
        }
      } else {
        setError('Upload failed. Please try again.')
      }
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
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
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        className="rounded-lg border border-dashed border-border px-4 py-6 text-center transition hover:bg-muted/30 cursor-pointer"
      >
        <div className="mx-auto flex flex-col items-center gap-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border">
            {uploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImageUp className="h-4 w-4" />}
          </div>
          <p className="text-sm font-medium text-foreground">Upload design file</p>
          <p className="text-xs text-muted-foreground">Click to browse or drag an image (max 10MB)</p>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

export function TaskDetailDialog({ open, onOpenChange, task, projectId, onEdit, onDesignUpload }: TaskDetailDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState(false)
  const [currentDesignPath, setCurrentDesignPath] = useState<string | null>(null)
  const prevFilePath = useRef<string | null>(null)

  useEffect(() => {
    if (task?.design_file_path) {
      setCurrentDesignPath(task.design_file_path)
    } else {
      setCurrentDesignPath(null)
    }
  }, [task?.design_file_path, task?.id])

  const filePathToLoad = currentDesignPath && isImageFile(currentDesignPath)
    ? currentDesignPath
    : null

  useEffect(() => {
    if (!filePathToLoad) {
      setPreviewUrl(null)
      setPreviewLoading(false)
      return
    }

    if (prevFilePath.current === filePathToLoad && previewUrl) return
    prevFilePath.current = filePathToLoad

    setPreviewLoading(true)
    setPreviewUrl(null)

    let cancelled = false
    createClient()
      .storage.from('design-files')
      .createSignedUrl(filePathToLoad, 3600)
      .then(({ data, error }) => {
        if (!cancelled && !error && data?.signedUrl) {
          setPreviewUrl(`${data.signedUrl}&width=800&height=600&resize=contain`)
        }
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false)
      })

    return () => { cancelled = true }
  }, [filePathToLoad])

  const handleCopyCaption = async () => {
    if (!task?.caption) return
    try {
      await navigator.clipboard.writeText(task.caption)
      setCopyFeedback(true)
      setTimeout(() => setCopyFeedback(false), 2000)
    } catch {
      // Clipboard API failed
    }
  }

  if (!task) return null

  const caption = task.caption ?? LABELS.emptyStates.noCaption
  const briefing = task.briefing ?? ''
  const fileName = currentDesignPath?.split('/').pop() ?? null
  const isDesignImage = isImageFile(currentDesignPath)
  const postingDateTime = task.posting_date
    ? `${formatDate(task.posting_date)}${task.posting_time ? ` at ${formatTime(task.posting_time)}` : ''}`
    : 'Not set'

  function handleDesignUploadComplete(path: string) {
    setCurrentDesignPath(path)
    onDesignUpload?.(path)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl">{task.title}</DialogTitle>
          <DialogDescription className="sr-only">
            Task details for {task.title}
          </DialogDescription>
          {onEdit && (
            <Button type="button" variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <section className="flex items-center justify-between rounded-sm border border-border px-3 py-3">
            <StatusDot status={task.status} showLabel />
          </section>

          <section className="space-y-2 rounded-sm border border-border px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-foreground">Caption</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopyCaption}
                className="h-8 px-2"
              >
                {copyFeedback ? (
                  <span className="text-xs text-green-600">Copied!</span>
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="whitespace-pre-wrap break-words text-sm text-foreground">{caption}</p>
          </section>

          {briefing && (
            <section className="space-y-2 rounded-sm border border-border px-3 py-3">
              <p className="text-sm font-medium text-foreground">Briefing</p>
              <div
                className="text-sm text-foreground whitespace-pre-wrap break-words"
                dangerouslySetInnerHTML={{ __html: linkify(briefing) }}
              />
            </section>
          )}

          <section className="space-y-2 rounded-sm border border-border px-3 py-3">
            <p className="text-sm font-medium text-foreground">Design file</p>
            {currentDesignPath && fileName ? (
              <div className="space-y-3">
                {isDesignImage && previewUrl && (
                  <div className="overflow-hidden rounded-lg border border-border">
                    <img
                      src={previewUrl}
                      alt="Design preview"
                      className="h-auto w-full max-h-64 object-contain"
                    />
                  </div>
                )}
                {isDesignImage && previewLoading && !previewUrl && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Loading preview…
                  </div>
                )}
                <DownloadButton fileName={fileName} filePath={currentDesignPath} />
              </div>
            ) : (
              <InlineDesignUploader
                taskId={task.id}
                projectId={projectId ?? ''}
                onUploadComplete={handleDesignUploadComplete}
              />
            )}
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            <section className="space-y-2 rounded-sm border border-border px-3 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Posting Date & Time</p>
              <p className="text-sm text-foreground">{postingDateTime}</p>
            </section>

            {task.due_date && (
              <section className="space-y-2 rounded-sm border border-border px-3 py-3">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{LABELS.task.dueDate}</p>
                <p className="text-sm text-foreground">{formatDate(task.due_date)}</p>
              </section>
            )}

            {task.deadline && (
              <section className="space-y-2 rounded-sm border border-border px-3 py-3">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{LABELS.task.deadline}</p>
                <p className="text-sm text-foreground">{formatDate(task.deadline)}</p>
              </section>
            )}
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

      if (signedUrlError || !data?.signedUrl) {
        setError('Download link expired, please refresh')
        return
      }

      window.open(data.signedUrl, '_blank')
    })
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" size="sm" onClick={download} disabled={isPending}>
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {fileName}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}