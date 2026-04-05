'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { format } from 'date-fns'
import { Download, LoaderCircle, Copy, Pencil } from 'lucide-react'

import type { TaskRow } from '@/app/admin/clients/[clientId]/projects/[projectId]/task-view-toggle'
import { LABELS } from '@/lib/labels'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
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
  onEdit?: () => void
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

export function TaskDetailDialog({ open, onOpenChange, task, onEdit }: TaskDetailDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState(false)
  const prevFilePath = useRef<string | null>(null)

  const filePathToLoad = task?.design_file_path && isImageFile(task.design_file_path)
    ? task.design_file_path
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
          const previewUrlWithParams = `${data.signedUrl}&width=800&height=600&resize=contain`
          setPreviewUrl(previewUrlWithParams)
        }
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false)
      })

    return () => { cancelled = true }
  }, [filePathToLoad, previewUrl])

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

  if (!task) {
    return null
  }

  const caption = task.caption ?? LABELS.emptyStates.noCaption
  const briefing = task.briefing ?? ''
  const fileName = task.design_file_path?.split('/').pop() ?? null
  const isDesignImage = isImageFile(task.design_file_path ?? null)

  const postingDateTime = task.posting_date 
    ? `${formatDate(task.posting_date)}${task.posting_time ? ` at ${formatTime(task.posting_time)}` : ''}`
    : 'Not set'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl">{task.title}</DialogTitle>
          {onEdit && (
            <Button type="button" variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <section className="flex items-center justify-between rounded-sm border border-border px-3 py-3">
            <div className="flex items-center gap-2">
              <StatusDot status={task.status} showLabel />
              {task.assigned_to_username && (
                <span className="text-sm font-mono text-muted-foreground">
                  @{task.assigned_to_username}
                </span>
              )}
              {task.assigned_to_name && !task.assigned_to_username && (
                <span className="text-sm text-muted-foreground">
                  {task.assigned_to_name}
                </span>
              )}
            </div>
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
            {task.design_file_path && fileName ? (
              isDesignImage ? (
                <div className="space-y-3">
                  {previewUrl ? (
                    <div className="space-y-3">
                      <div className="overflow-hidden rounded-lg border border-border">
                        <img
                          src={previewUrl}
                          alt="Design preview"
                          className="h-auto w-full max-h-64 object-contain"
                        />
                      </div>
                      <DownloadButton fileName={fileName} filePath={task.design_file_path} />
                    </div>
                  ) : previewLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Loading preview…
                    </div>
                  ) : (
                    <DownloadButton fileName={fileName} filePath={task.design_file_path} />
                  )}
                </div>
              ) : (
                <DownloadButton fileName={fileName} filePath={task.design_file_path} />
              )
            ) : (
              <p className="text-sm text-muted-foreground">{LABELS.emptyStates.noDesignFile}</p>
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
