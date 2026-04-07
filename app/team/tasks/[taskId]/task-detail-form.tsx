'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { format } from 'date-fns'
import { Check, Pencil, Trash2, X } from 'lucide-react'

import { notifyAssignerAction, editCommentAction, deleteCommentAction, postCommentAction, updateTeamTaskContentAction, updateTeamTaskFilePathAction } from '@/app/team/tasks/actions'
import CopyButton from '@/components/admin/copy-button'
import DesignFileDownloader from '@/components/admin/design-file-downloader'
import { DesignFileUploader } from '@/components/admin/design-file-uploader'
import { LABELS } from '@/lib/labels'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { linkify } from '@/lib/utils'

type TaskDetailFormProps = {
  task: {
    id: string
    title: string
    briefing: string | null
    caption: string | null
    postingDate: string | null
    dueDate: string | null
    deadline: string | null
    status: 'todo' | 'in_progress' | 'done'
    designFilePath: string | null
    projectName: string
    clientName: string
  }
}

function ReadOnlyValue({ value }: { value: string | null }) {
  return <div className="rounded-lg border border-border px-3 py-3 text-sm text-foreground">{value || '—'}</div>
}

function BriefingValue({ text }: { text: string | null }) {
  if (!text) {
    return <ReadOnlyValue value={null} />
  }

  return (
    <div
      className="rounded-lg border border-border px-3 py-3 text-sm text-foreground"
      dangerouslySetInnerHTML={{ __html: linkify(text) }}
    />
  )
}

export function TaskDetailForm({ task }: TaskDetailFormProps) {
  const [caption, setCaption] = useState(task.caption ?? '')
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'done'>(task.status)
  const [designFilePath, setDesignFilePath] = useState(task.designFilePath)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isSavingCaption, startSavingCaption] = useTransition()
  const [isSavingStatus, startSavingStatus] = useTransition()
  const [isReplacingFile, startReplacingFile] = useTransition()
  const [isNotifying, startNotifying] = useTransition()
  const [isNotifyDialogOpen, setIsNotifyDialogOpen] = useState(false)

  const currentFileName = useMemo(() => designFilePath?.split('/').pop() ?? null, [designFilePath])

  const [commentText, setCommentText] = useState('')
  const [commentIsRevision, setCommentIsRevision] = useState(false)
  const [isPostingComment, startPostingComment] = useTransition()
  const [comments, setComments] = useState<Array<{
    id: string
    content: string
    is_revision: boolean
    created_at: string
    team_member_id: string | null
    team_members: { name: string } | null
  }>>([])
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editCommentText, setEditCommentText] = useState('')
  const [isEditingComment, startEditingComment] = useTransition()

  useEffect(() => {
    const fetchComments = () => {
      createClient()
        .from('comments')
        .select('id, content, is_revision, created_at, team_member_id, team_members(name)')
        .eq('task_id', task.id)
        .order('created_at', { ascending: true })
        .then(({ data, error }) => {
          if (!error && data) {
            setComments(data as any)
          }
        })
    }
    fetchComments()
  }, [task.id])

  function handlePostComment() {
    if (!commentText.trim()) return
    setFeedback(null)

    startPostingComment(async () => {
      const result = await postCommentAction(task.id, commentText, commentIsRevision)
      if (result.success) {
        setCommentText('')
        setCommentIsRevision(false)
        setFeedback('Comment posted.')
        // Refresh comments
        createClient()
          .from('comments')
          .select('id, content, is_revision, created_at, team_member_id, team_members(name)')
          .eq('task_id', task.id)
          .order('created_at', { ascending: true })
          .then(({ data, error }) => {
            if (!error && data) {
              setComments(data as any)
            }
          })
      } else {
        setFeedback(result.error)
      }
    })
  }

  function handleEditComment(commentId: string) {
    if (!editCommentText.trim()) return
    startEditingComment(async () => {
      const result = await editCommentAction(commentId, editCommentText)
      if (result.success) {
        setEditingCommentId(null)
        setEditCommentText('')
        setFeedback('Comment updated.')
        // Refresh comments
        createClient()
          .from('comments')
          .select('id, content, is_revision, created_at, team_member_id, team_members(name)')
          .eq('task_id', task.id)
          .order('created_at', { ascending: true })
          .then(({ data, error }) => {
            if (!error && data) {
              setComments(data as any)
            }
          })
      } else {
        setFeedback(result.error)
      }
    })
  }

  function handleDeleteComment(commentId: string) {
    startPostingComment(async () => {
      const result = await deleteCommentAction(commentId)
      if (result.success) {
        setFeedback('Comment deleted.')
        createClient()
          .from('comments')
          .select('id, content, is_revision, created_at, team_member_id, team_members(name)')
          .eq('task_id', task.id)
          .order('created_at', { ascending: true })
          .then(({ data, error }) => {
            if (!error && data) {
              setComments(data as any)
            }
          })
      } else {
        setFeedback(result.error)
      }
    })
  }

  function saveContent(nextValues: { caption: string; status: 'todo' | 'in_progress' | 'done' }, successMessage: string) {
    setFeedback(null)

    return updateTeamTaskContentAction(task.id, nextValues).then((result) => {
      if (result.success) {
        setFeedback(successMessage)
        return
      }

      setFeedback(result.error)
    })
  }

  function handleNotifyAssigner() {
    setFeedback(null)
    setIsNotifyDialogOpen(false)

    startNotifying(() => {
      void notifyAssignerAction(task.id).then((result) => {
        if (result.success) {
          setStatus('done')
          setFeedback(LABELS.notify.success)
          return
        }

        setFeedback(result.error)
      })
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <section className="space-y-6 rounded-lg border border-border p-5">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Task context</p>
          <h2 className="text-lg font-semibold text-foreground">Review your assigned work</h2>
          <p className="text-sm text-muted-foreground">Project: {task.projectName} · Client: {task.clientName}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field className="sm:col-span-2">
            <FieldLabel>Title</FieldLabel>
            <ReadOnlyValue value={task.title} />
          </Field>

          <Field className="sm:col-span-2">
            <FieldLabel>Briefing</FieldLabel>
            <BriefingValue text={task.briefing} />
          </Field>

          <Field>
            <FieldLabel>{LABELS.task.postingDate}</FieldLabel>
            <ReadOnlyValue value={task.postingDate} />
          </Field>

          <Field>
            <FieldLabel>{LABELS.task.dueDate}</FieldLabel>
            <ReadOnlyValue value={task.dueDate} />
          </Field>

          <Field className="sm:col-span-2">
            <FieldLabel>{LABELS.task.deadline}</FieldLabel>
            <ReadOnlyValue value={task.deadline} />
          </Field>
        </div>
      </section>

      <div className="space-y-6">
        <section className="space-y-4 rounded-lg border border-border p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">Caption</h3>
              <p className="text-sm text-muted-foreground">Update the social copy without changing your file or status.</p>
            </div>
            <CopyButton text={caption} />
          </div>

          <Field>
            <FieldLabel htmlFor="caption">Caption text</FieldLabel>
            <Textarea
              id="caption"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="Write the post caption here"
            />
          </Field>

          <div className="flex justify-end">
            <Button
              type="button"
              disabled={isSavingCaption}
              onClick={() => {
                startSavingCaption(() => {
                  void saveContent({ caption, status }, 'Caption saved.')
                })
              }}
            >
              {isSavingCaption ? 'Saving...' : 'Save caption'}
            </Button>
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-border p-5">
          <div>
            <h3 className="text-base font-semibold text-foreground">Status</h3>
            <p className="text-sm text-muted-foreground">Change progress without bundling other edits.</p>
          </div>

          <Field>
            <FieldLabel>Status</FieldLabel>
            <Select value={status} onValueChange={(value: 'todo' | 'in_progress' | 'done') => setStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <div className="flex justify-end">
            <Button
              type="button"
              disabled={isSavingStatus}
              onClick={() => {
                startSavingStatus(() => {
                  void saveContent({ caption, status }, 'Status saved.')
                })
              }}
            >
              {isSavingStatus ? 'Saving...' : 'Save status'}
            </Button>
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-border p-5">
          <div>
            <h3 className="text-base font-semibold text-foreground">Design file</h3>
            <p className="text-sm text-muted-foreground">Download the current file or upload a replacement.</p>
          </div>

          {designFilePath && currentFileName ? (
            <div className="space-y-4 rounded-lg border border-border p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Current file: {currentFileName}</p>
                <p className="break-all text-xs text-muted-foreground">{designFilePath}</p>
              </div>
              <DesignFileDownloader filePath={designFilePath} fileName={currentFileName} />
            </div>
          ) : (
            <FieldDescription>{LABELS.emptyStates.noDesignFile}</FieldDescription>
          )}

          <div className="border-t border-border pt-4">
            <DesignFileUploader
              projectId={task.id}
              taskId={task.id}
              onUploadComplete={(path) => {
                setFeedback(null)
                setDesignFilePath(path)

                startReplacingFile(async () => {
                  const result = await updateTeamTaskFilePathAction(task.id, path)

                  if (result.success) {
                    setFeedback(task.designFilePath ? 'Design file replaced.' : 'Design file uploaded.')
                    return
                  }

                  setFeedback(result.error)
                })
              }}
            />
            {isReplacingFile ? (
              <p className="mt-2 text-sm text-muted-foreground">Saving file reference...</p>
            ) : null}
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-border p-5">
          <div>
            <h3 className="text-base font-semibold text-foreground">{LABELS.notify.title}</h3>
            <p className="text-sm text-muted-foreground">Notify the admin when your work is complete.</p>
          </div>

          <Dialog open={isNotifyDialogOpen} onOpenChange={setIsNotifyDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="default" className="w-full">
                {LABELS.notify.button}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{LABELS.notify.title}</DialogTitle>
                <DialogDescription>
                  {LABELS.notify.description}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 text-sm text-muted-foreground">
                <p>Are you sure you want to proceed?</p>
                <ul className="mt-2 list-disc pl-4">
                  <li>An in-app notification will be sent to the admin</li>
                  <li>The task status will change to Done</li>
                </ul>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsNotifyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={isNotifying}
                  onClick={() => {
                    handleNotifyAssigner()
                  }}
                >
                  {isNotifying ? LABELS.notify.assigning : LABELS.notify.confirmButton}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>

        <section className="space-y-4 rounded-lg border border-border p-5">
          <div>
            <h3 className="text-base font-semibold text-foreground">Comments</h3>
            <p className="text-sm text-muted-foreground">Discuss this task or flag a revision request.</p>
          </div>

          {comments.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="group flex gap-2"
                >
                  <Avatar name={comment.team_members?.name ?? 'You'} size={28} />
                  <div className="min-w-0 flex-1">
                    <div className={`rounded-md border px-3 py-2 text-sm ${
                      comment.is_revision
                        ? 'border-amber-300 bg-amber-50/50'
                        : 'border-border bg-muted/30'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {comment.team_members?.name ?? 'You'}
                        </span>
                        {comment.is_revision && (
                          <Badge variant="default" className="bg-amber-100 text-amber-800 hover:bg-amber-200 text-xs">
                            Revision Requested
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.created_at), 'MMM d, HH:mm')}
                        </span>
                        {/* Edit/Delete buttons — always visible */}
                        {!editingCommentId && (
                          <div className="ml-auto flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 px-1.5 text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                setEditingCommentId(comment.id)
                                setEditCommentText(comment.content)
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 px-1.5 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="mt-1 whitespace-pre-wrap break-words text-foreground">
                        {comment.content}
                      </p>
                    </div>

                    {editingCommentId === comment.id && (
                      <div className="mt-1 flex items-center gap-1">
                        <Textarea
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          rows={2}
                          className="text-sm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          disabled={isEditingComment}
                          onClick={() => handleEditComment(comment.id)}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => setEditingCommentId(null)}
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={commentIsRevision}
                  onCheckedChange={setCommentIsRevision}
                  id="comment-revision-flag"
                />
                <label htmlFor="comment-revision-flag" className="text-sm text-muted-foreground cursor-pointer">
                  Request revision
                </label>
              </div>
              <Button
                type="button"
                disabled={isPostingComment || !commentText.trim()}
                onClick={handlePostComment}
              >
                {isPostingComment ? 'Posting...' : 'Post comment'}
              </Button>
            </div>
          </div>
        </section>

        {feedback ? <div className="rounded-lg border border-border px-3 py-2 text-sm">{feedback}</div> : null}
      </div>
    </div>
  )
}
