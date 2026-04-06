'use client'

import { useEffect, useRef, useState } from 'react'
import { Clock } from 'lucide-react'

import CopyButton from '@/components/admin/copy-button'
import DesignFileDownloader from '@/components/admin/design-file-downloader'
import { createClient } from '@/lib/supabase/client'
import { LABELS } from '@/lib/labels'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { StatusDot } from '@/components/ui/status-dot'
import type { PortalTask } from '@/lib/portal/types'

type PortalTaskDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: PortalTask | null
}

function getFileName(filePath: string | null) {
  if (!filePath) {
    return null
  }
  const fileName = filePath.split('/').pop()
  return fileName ?? null
}

function isImageFile(path: string | null) {
  if (!path) return false
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext)
}

function formatTime(time: string) {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const hour12 = h % 12 || 12
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`
}

export function PortalTaskDetailDialog({ open, onOpenChange, task }: PortalTaskDetailDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const prevFilePath = useRef<string | null>(null)

  const filePathToLoad = task && isImageFile(task.designFilePath ?? null)
    ? task.designFilePath
    : null

  useEffect(() => {
    if (!filePathToLoad) {
      setPreviewUrl(null)
      setPreviewLoading(false)
      return
    }
    if (prevFilePath.current === filePathToLoad) return
    prevFilePath.current = filePathToLoad
    setPreviewLoading(true)
    setPreviewUrl(null)

    let cancelled = false
    createClient()
      .storage
      .from('design-files')
      .createSignedUrl(filePathToLoad, 3600)
      .then(({ data, error }) => {
        if (!cancelled && !error && data?.signedUrl) {
          setPreviewUrl(data.signedUrl)
        }
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false)
      })
    return () => { cancelled = true }
  }, [filePathToLoad])

  if (!task) return null

  const caption = task.caption ?? LABELS.emptyStates.noCaption
  const postingDate = task.postingDate ?? 'Not available'
  const fileName = getFileName(task.designFilePath)
  const isDesignImage = isImageFile(task.designFilePath ?? null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {/* ── Title header with generous right padding so text never touches X ── */}
        <DialogHeader className="space-y-2 pb-3">
          <DialogTitle className="truncate leading-snug pr-10 text-base" title={task.title}>
            {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 min-w-0">
          {/* ── Caption section with divider line ── */}
          <section className="rounded-lg border border-border px-4 py-4">
            <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground shrink-0">Caption</p>
              <CopyButton text={task.caption ?? ''} label="Copy caption" className="shrink-0" />
            </div>
            <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground leading-relaxed">{caption}</p>
          </section>

          {/* ── Design file ── */}
          <section className="space-y-2 overflow-hidden rounded-lg border border-border px-4 py-4 min-w-0">
            <p className="text-sm font-medium text-foreground">Design file</p>
            {task.designFilePath && fileName ? (
              isDesignImage ? (
                <div className="space-y-3 min-w-0">
                  {previewUrl ? (
                    <div className="space-y-3 min-w-0">
                      <div className="overflow-hidden rounded-lg border border-border">
                        <img
                          src={previewUrl}
                          alt="Design preview"
                          className="h-auto w-full object-contain"
                        />
                      </div>
                      <DesignFileDownloader fileName={fileName} filePath={task.designFilePath} />
                    </div>
                  ) : previewLoading ? (
                    <p className="text-sm text-muted-foreground">Loading preview…</p>
                  ) : (
                    <DesignFileDownloader fileName={fileName} filePath={task.designFilePath} />
                  )}
                </div>
              ) : (
                <DesignFileDownloader fileName={fileName} filePath={task.designFilePath} />
              )
            ) : (
              <p className="text-sm text-muted-foreground">{LABELS.emptyStates.noDesignFile}</p>
            )}
          </section>

          {/* ── Metadata row ── */}
          <div className="grid gap-3 sm:grid-cols-3">
            <section className="space-y-2 rounded-lg border border-border px-4 py-3.5">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{LABELS.task.postingDate}</p>
              <p className="text-sm text-foreground">{postingDate}</p>
            </section>
            <section className="space-y-2 rounded-lg border border-border px-4 py-3.5">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Posting Time</p>
              <p className="flex items-center gap-1 text-sm text-foreground">
                <Clock className="h-3 w-3 text-muted-foreground" />
                {task.postingTime ? formatTime(task.postingTime) : '10:00 AM'}
              </p>
            </section>
            <section className="space-y-2 rounded-lg border border-border px-4 py-3.5">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Status</p>
              <StatusDot status={task.status} showLabel />
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
