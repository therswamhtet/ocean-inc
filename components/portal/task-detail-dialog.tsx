'use client'

import { useEffect, useRef, useState } from 'react'
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

export function PortalTaskDetailDialog({ open, onOpenChange, task }: PortalTaskDetailDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const prevFilePath = useRef<string | null>(null)

  // Resolve the actual file path we want to preview
  const filePathToLoad = task && isImageFile(task.designFilePath ?? null)
    ? task.designFilePath
    : null

  // Auto-load image preview when file path changes
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

  if (!task) {
    return null
  }

  const caption = task.caption ?? LABELS.emptyStates.noCaption
  const postingDate = task.postingDate ?? 'Not available'
  const fileName = getFileName(task.designFilePath)
  const isDesignImage = isImageFile(task.designFilePath ?? null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <section className="space-y-2 rounded-sm border border-border px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-foreground">Caption</p>
              <CopyButton text={task.caption ?? ''} label="Copy caption" />
            </div>
            <p className="whitespace-pre-wrap break-words text-sm text-foreground">{caption}</p>
          </section>

          <section className="space-y-2 rounded-sm border border-border px-3 py-3">
            <p className="text-sm font-medium text-foreground">Design file</p>
            {task.designFilePath && fileName ? (
              isDesignImage ? (
                <div className="space-y-3">
                  {previewUrl ? (
                    <div className="space-y-3">
                      <div className="overflow-hidden rounded-lg border border-border">
                        <img
                          src={previewUrl}
                          alt="Design preview"
                          className="h-auto w-full object-contain"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <DesignFileDownloader fileName={fileName} filePath={task.designFilePath} />
                      </div>
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

          <div className="grid gap-3 sm:grid-cols-2">
            <section className="space-y-2 rounded-sm border border-border px-3 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{LABELS.task.postingDate}</p>
              <p className="text-sm text-foreground">{postingDate}</p>
            </section>

            <section className="space-y-2 rounded-sm border border-border px-3 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Status</p>
              <StatusDot status={task.status} showLabel />
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
