'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { Copy, Download, LoaderCircle } from 'lucide-react'

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

const statusConfig: Record<string, { label: string; dot: string; text: string }> = {
  todo: { label: 'To Do', dot: 'bg-[#999999]', text: 'text-[#999999]' },
  in_progress: { label: 'In Progress', dot: 'bg-[#D4A843]', text: 'text-[#D4A843]' },
  done: { label: 'Done', dot: 'bg-[#4A9E5C]', text: 'text-[#4A9E5C]' },
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
          <DialogTitle className="text-lg font-bold tracking-tight pr-8">{task.title}</DialogTitle>
          <DialogDescription className="sr-only">Task details for {task.title}</DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-6">
          {/* Caption */}
          {task.caption && (
            <section>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Caption</h3>
                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-surface-raised hover:text-foreground transition font-mono uppercase tracking-[0.06em]"
                >
                  <Copy className="h-3 w-3" />
                  {copiedCaption ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="rounded-lg border border-border bg-surface-raised px-4 py-3">
                <p className="whitespace-pre-wrap break-words text-sm text-foreground leading-relaxed">{caption}</p>
              </div>
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
                      <DownloadButton filePath={task.designFilePath!} />
                    </div>
                  </div>
                )}
                {(!isDesignImage || !previewUrl) && (
                  <DownloadButton filePath={task.designFilePath!} />
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground font-mono uppercase tracking-[0.06em]">{LABELS.emptyStates.noDesignFile}</p>
            )}
          </section>

          {/* Schedule */}
          {hasDates && (
            <section>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-2">Schedule</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {task.postingDate && (
                  <div className="rounded-lg border border-border px-3 py-2.5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground mb-1">Posting Date</p>
                    <p className="text-sm font-medium text-foreground">{formatDate(task.postingDate)}</p>
                  </div>
                )}
                {task.postingTime && (
                  <div className="rounded-lg border border-border px-3 py-2.5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground mb-1">Time</p>
                    <p className="text-sm font-medium text-foreground">{formatTime(task.postingTime)}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-border">
            <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold', status.text)}>
              <span className={cn('h-2 w-2 rounded-full', status.dot)} />
              {status.label}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
