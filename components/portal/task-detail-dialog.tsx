'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { Copy, Download, LoaderCircle } from 'lucide-react'

import DesignFileDownloader from '@/components/admin/design-file-downloader'
import { createClient } from '@/lib/supabase/client'
import { LABELS } from '@/lib/labels'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { PortalTask } from '@/lib/portal/types'

type PortalTaskDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: PortalTask | null
}

function getFileName(filePath: string | null) {
  if (!filePath) return null
  return filePath.split('/').pop() ?? null
}

function isImageFile(path: string | null) {
  if (!path) return false
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext)
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(time: string) {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const hour12 = h % 12 || 12
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`
}

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string; border: string }> = {
  todo: { label: 'To Do', dot: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
  in_progress: { label: 'In Progress', dot: 'bg-blue-400', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  done: { label: 'Done', dot: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
}

export function PortalTaskDetailDialog({ open, onOpenChange, task }: PortalTaskDetailDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [copiedCaption, setCopiedCaption] = useState(false)

  const filePathToLoad = task && isImageFile(task.designFilePath ?? null)
    ? task.designFilePath
    : null
  const prevFilePath = useRef<string | null>(null)

  useEffect(() => {
    if (!filePathToLoad) { setPreviewUrl(null); setPreviewLoading(false); return }
    if (prevFilePath.current === filePathToLoad) return
    prevFilePath.current = filePathToLoad
    setPreviewLoading(true)
    setPreviewUrl(null)
    let cancelled = false
    createClient()
      .storage.from('design-files')
      .createSignedUrl(filePathToLoad, 3600)
      .then(({ data, error }) => {
        if (!cancelled && !error && data?.signedUrl) setPreviewUrl(data.signedUrl)
      })
      .finally(() => { if (!cancelled) setPreviewLoading(false) })
    return () => { cancelled = true }
  }, [filePathToLoad])

  const handleCopyCaption = async () => {
    if (!task?.caption) return
    try { await navigator.clipboard.writeText(task.caption); setCopiedCaption(true); setTimeout(() => setCopiedCaption(false), 2000) }
    catch { /* */ }
  }

  if (!task) return null

  const caption = task.caption ?? LABELS.emptyStates.noCaption
  const fileName = getFileName(task.designFilePath)
  const isDesignImage = isImageFile(task.designFilePath ?? null)
  const status = statusConfig[task.status] ?? statusConfig.todo
  const hasDesignFile = task.designFilePath && fileName
  const hasDates = task.postingDate || task.postingTime

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold pr-8">{task.title}</DialogTitle>
          <DialogDescription className="sr-only">Task details for {task.title}</DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-6">
          {/* ── Caption ── */}
          {task.caption && (
            <section>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-sm font-semibold text-foreground">Caption</h3>
                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition"
                >
                  <Copy className="h-3 w-3" />
                  {copiedCaption ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                <p className="whitespace-pre-wrap break-words text-sm text-foreground leading-relaxed">{caption}</p>
              </div>
            </section>
          )}

          {/* ── Design File ── */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-2">Design file</h3>
            {hasDesignFile ? (
              <div className="space-y-3">
                {isDesignImage && previewLoading && !previewUrl && (
                  <div className="flex items-center justify-center rounded-lg border border-border py-10">
                    <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
                {isDesignImage && previewUrl && (
                  <div className="overflow-hidden rounded-lg border border-border">
                    <img src={previewUrl} alt="Design preview" className="h-auto w-full object-contain bg-muted/20" />
                  </div>
                )}
                <DesignFileDownloader fileName={fileName!} filePath={task.designFilePath!} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{LABELS.emptyStates.noDesignFile}</p>
            )}
          </section>

          {/* ── Schedule ── */}
          {hasDates && (
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-2">Schedule</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {task.postingDate && (
                  <div className="rounded-lg border border-border px-3 py-2.5">
                    <p className="text-[11px] text-muted-foreground mb-0.5">Posting Date</p>
                    <p className="text-sm font-medium text-foreground">{formatDate(task.postingDate)}</p>
                  </div>
                )}
                {task.postingTime && (
                  <div className="rounded-lg border border-border px-3 py-2.5">
                    <p className="text-[11px] text-muted-foreground mb-0.5">Time</p>
                    <p className="text-sm font-medium text-foreground">{formatTime(task.postingTime)}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── Footer ── */}
          <div className="pt-4 border-t border-border">
            <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold', status.bg, status.text, status.border)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
              {status.label}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}