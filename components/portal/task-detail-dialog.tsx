'use client'

import CopyButton from '@/components/admin/copy-button'
import DesignFileDownloader from '@/components/admin/design-file-downloader'
import { LABELS } from '@/lib/labels'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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

export function PortalTaskDetailDialog({ open, onOpenChange, task }: PortalTaskDetailDialogProps) {
  if (!task) {
    return null
  }

  const caption = task.caption ?? LABELS.emptyStates.noCaption
  const postingDate = task.postingDate ?? 'Not available'
  const fileName = getFileName(task.designFilePath)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>Read-only task details for this project item.</DialogDescription>
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
              <DesignFileDownloader filePath={task.designFilePath} fileName={fileName} />
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
