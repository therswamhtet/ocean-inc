'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { Clock, LoaderCircle } from 'lucide-react'

import CopyButton from '@/components/admin/copy-button'
import DesignFileDownloader from '@/components/admin/design-file-downloader'
import { createClient } from '@/lib/supabase/client'
import { LABELS } from '@/lib/labels'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { StatusDot } from '@/components/ui/status-dot'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
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

  // Comments state
  const [comments, setComments] = useState<Array<{
    id: string
    content: string
    is_revision: boolean
    created_at: string
    team_members: { name: string } | null
  }>>([])
  const [commentText, setCommentText] = useState('')
  const [isPostingComment, startPostingComment] = useTransition()
  const [commentError, setCommentError] = useState<string | null>(null)
  const [revisionRequested, setRevisionRequested] = useState(true)

  // Fetch comments when dialog opens
  useEffect(() => {
    if (!open || !task?.id) {
      setComments([])
      return
    }
    createClient()
      .from('comments')
      .select('id, content, is_revision, created_at, team_members(name)')
      .eq('task_id', task.id)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) {
          setComments(data as any)
        }
      })
  }, [open, task?.id])

  function handlePostComment() {
    if (!commentText.trim() || !task) return
    const taskId = task.id
    setCommentError(null)
    startPostingComment(async () => {
      try {
        const res = await fetch('/api/portal/comment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId, content: commentText.trim(), isRevision: revisionRequested }),
        })
        const result = await res.json()
        if (result.success) {
          setCommentText('')
          setRevisionRequested(true)
          createClient()
            .from('comments')
            .select('id, content, is_revision, created_at, team_members(name)')
            .eq('task_id', taskId)
            .order('created_at', { ascending: true })
            .then(({ data, error }) => {
              if (!error && data) setComments(data as any)
            })
        } else {
          setCommentError(result.error ?? 'Failed to post comment')
        }
      } catch {
        setCommentError('Network error, please try again')
      }
    })
  }

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

          {/* ── Comments / Revision Requests ── */}
          <section className="space-y-3 rounded-lg border border-border px-4 py-4">
            <p className="text-sm font-semibold text-foreground">Comments & Revision Requests</p>
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`rounded-md border px-3 py-2 text-sm ${
                      comment.is_revision
                        ? 'border-amber-300 bg-amber-50/50'
                        : 'border-border bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      {comment.is_revision && (
                        <Badge variant="default" className="bg-amber-100 text-amber-800 hover:bg-amber-200 text-xs">
                          Revision Requested
                        </Badge>
                      )}
                      <span className="font-medium text-foreground">
                        {comment.team_members?.name ?? 'Team'}
                      </span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap break-words text-foreground">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-border">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Request a revision or leave a comment..."
                rows={3}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={revisionRequested}
                    onCheckedChange={setRevisionRequested}
                    id="portal-revision-flag"
                  />
                  <label htmlFor="portal-revision-flag" className="text-sm text-muted-foreground cursor-pointer">
                    Request revision
                  </label>
                </div>
                <Button
                  type="button"
                  disabled={isPostingComment || !commentText.trim()}
                  onClick={handlePostComment}
                  size="sm"
                >
                  {isPostingComment ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                  {isPostingComment ? 'Posting...' : 'Post comment'}
                </Button>
              </div>
              {commentError && <p className="text-sm text-destructive">{commentError}</p>}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
