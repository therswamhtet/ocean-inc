'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  assignTaskToMemberAction,
  deleteTaskAction,
  updateTaskAction,
  updateTaskFilePathAction,
} from '@/app/admin/clients/[clientId]/projects/[projectId]/actions'
import CopyButton from '@/components/admin/copy-button'
import DesignFileDownloader from '@/components/admin/design-file-downloader'
import { DesignFileUploader } from '@/components/admin/design-file-uploader'
import { LABELS } from '@/lib/labels'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { linkify } from '@/lib/utils'

function isImageFile(path: string) {
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext)
}

/** Fetches a signed URL for a design file image and returns it for display. */
function useDesignImageUrl(filePath: string | null) {
  const [url, setUrl] = useState<string | null>(null)
  const prevPath = useRef(filePath)

  useEffect(() => {
    if (!filePath || prevPath.current !== filePath) {
      setUrl(null)
      prevPath.current = filePath
    }
    if (!filePath) return

    let cancelled = false
    createClient()
      .storage
      .from('design-files')
      .createSignedUrl(filePath, 3600)
      .then(({ data, error }) => {
        if (!cancelled && !error && data?.signedUrl) {
          setUrl(data.signedUrl)
        }
      })

    return () => { cancelled = true }
  }, [filePath])

  return url
}

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  briefing: z.string().optional(),
  caption: z.string().optional(),
  postingDate: z.string().optional(),
  deadline: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']),
  designFilePath: z.string().optional(),
})

type TaskFormValues = z.infer<typeof taskSchema>

type TaskEditFormProps = {
  clientId: string
  projectId: string
  task: {
    id: string
    title: string
    briefing: string | null
    caption: string | null
    postingDate: string | null
    dueDate?: string | null
    deadline: string | null
    status: 'todo' | 'in_progress' | 'done'
    designFilePath: string | null
  }
  teamMembers: Array<{
    id: string
    name: string
    email: string
    username: string | null
  }>
  adminTeamMemberId: string | null
  initialAssignmentId: string | null
}

export function TaskEditForm({
  clientId,
  projectId,
  task,
  teamMembers,
  adminTeamMemberId,
  initialAssignmentId,
}: TaskEditFormProps) {
  const router = useRouter()
  const [feedback, setFeedback] = useState<string | null>(null)
  const [assignmentId, setAssignmentId] = useState(initialAssignmentId ?? 'unassigned')
  const [designFilePath, setDesignFilePath] = useState(task.designFilePath)
  const [isSaving, startSaving] = useTransition()
  const [isAssigning, startAssigning] = useTransition()
  const [isDeleting, startDeleting] = useTransition()
  const [isReplacing, startReplacing] = useTransition()

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task.title,
      briefing: task.briefing ?? '',
      caption: task.caption ?? '',
      postingDate: task.postingDate ?? '',
      deadline: task.deadline ?? '',
      status: task.status,
      designFilePath: task.designFilePath ?? '',
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form

  // Generate signed URL for image preview (auto-loads on mount / change)
  const previewUrl = useDesignImageUrl(designFilePath)

  const currentFileName = useMemo(() => designFilePath?.split('/').pop() ?? null, [designFilePath])
  const projectPath = `/admin/clients/${clientId}/projects/${projectId}`
  const showDesignImage = designFilePath && isImageFile(designFilePath)

  const onSubmit = handleSubmit((values) => {
    setFeedback(null)

    startSaving(async () => {
      const result = await updateTaskAction(task.id, {
        ...values,
        designFilePath: designFilePath ?? '',
      })

      if (result.success) {
        setFeedback('Task saved.')
        router.refresh()
      } else {
        setFeedback(result.error)
      }
    })
  })

  return (
    <div className="space-y-6">
      <form className="space-y-6 rounded-lg border border-border p-5" onSubmit={onSubmit}>
        <div className="space-y-4">
          <Field>
            <FieldLabel htmlFor="title">Title</FieldLabel>
            <Input id="title" placeholder="Instagram carousel" {...register('title')} />
            {errors.title && <FieldError>{errors.title.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="briefing">Briefing</FieldLabel>
            <Textarea
              id="briefing"
              placeholder="Key notes, references, or campaign direction"
              rows={4}
              {...register('briefing')}
            />
            <FieldDescription>URLs render as clickable links for the team member.</FieldDescription>
            {errors.briefing && <FieldError>{errors.briefing.message}</FieldError>}
          </Field>

          <Field>
            <div className="flex items-center justify-between gap-3">
              <FieldLabel htmlFor="caption">Caption</FieldLabel>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Keep the final social copy current here.</span>
                <CopyButton label="Copy" text={watch('caption') ?? ''} />
              </div>
            </div>
            <Textarea id="caption" placeholder="Write the post caption here" {...register('caption')} />
            {errors.caption && <FieldError>{errors.caption.message}</FieldError>}
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="postingDate">{LABELS.task.postingDate}</FieldLabel>
              <Input id="postingDate" type="date" {...register('postingDate')} />
              {errors.postingDate && <FieldError>{errors.postingDate.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="deadline">{LABELS.task.deadline}</FieldLabel>
              <Input id="deadline" type="date" {...register('deadline')} />
              {errors.deadline && <FieldError>{errors.deadline.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel>{LABELS.task.status}</FieldLabel>
              <Select
                value={watch('status')}
                onValueChange={(value: 'todo' | 'in_progress' | 'done') =>
                  setValue('status', value, { shouldDirty: true, shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <FieldError>{errors.status.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel>{LABELS.task.assignee}</FieldLabel>
              <Select
                value={assignmentId}
                onValueChange={(value) => {
                  setFeedback(null)
                  setAssignmentId(value)

                  startAssigning(async () => {
                    const nextMemberId = value === 'unassigned' ? null : value
                    const result = await assignTaskToMemberAction(task.id, nextMemberId)

                    if (result.success) {
                      setFeedback(nextMemberId ? 'Task reassigned.' : 'Task unassigned.')
                      router.refresh()
                    } else {
                      setFeedback(result.error)
                      setAssignmentId(initialAssignmentId ?? 'unassigned')
                    }
                  })
                }}
              >
                <SelectTrigger disabled={isAssigning}>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  <SelectItem value="self">Assign to myself</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.username ? `@${member.username}` : member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                {isAssigning ? 'Updating assignment...' : 'Changes save immediately.'}
              </FieldDescription>
            </Field>
          </div>
        </div>

        {/* Design file — full-width */}
        <Field>
          <div className="flex items-center justify-between gap-3">
            <FieldLabel>Design file</FieldLabel>
            {currentFileName && (
              <span className="text-xs text-muted-foreground">Replace the current upload any time.</span>
            )}
          </div>

          {designFilePath && currentFileName ? (
            <div className="space-y-4">
              {/* Image preview shown automatically */}
              {showDesignImage && previewUrl && (
                <div className="overflow-hidden rounded-lg border border-border">
                  <img
                    src={previewUrl}
                    alt={currentFileName}
                    className="h-auto w-full max-w-none object-contain"
                  />
                </div>
              )}

              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Current file: {currentFileName}</p>
                <p className="break-all text-xs text-muted-foreground">{designFilePath}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <DesignFileDownloader fileName={currentFileName} filePath={designFilePath} />
              </div>

              <div className="border-t border-border pt-4">
                <p className="mb-3 text-sm font-medium text-foreground">Replace file</p>
                <DesignFileUploader
                  projectId={projectId}
                  taskId={task.id}
                  onUploadComplete={(path) => {
                    setFeedback(null)
                    setDesignFilePath(path)
                    setValue('designFilePath', path, { shouldDirty: true })

                    startReplacing(async () => {
                      const result = await updateTaskFilePathAction(task.id, path)

                      if (result.success) {
                        setFeedback('Design file replaced.')
                        router.refresh()
                      } else {
                        setFeedback(result.error)
                      }
                    })
                  }}
                />
              </div>
            </div>
          ) : (
            <DesignFileUploader
              projectId={projectId}
              taskId={task.id}
              onUploadComplete={(path) => {
                setFeedback(null)
                setDesignFilePath(path)
                setValue('designFilePath', path, { shouldDirty: true })

                startReplacing(async () => {
                  const result = await updateTaskFilePathAction(task.id, path)

                  if (result.success) {
                    setFeedback('Design file uploaded.')
                    router.refresh()
                  } else {
                    setFeedback(result.error)
                  }
                })
              }}
            />
          )}
        </Field>

        {feedback && (
          <div className="rounded-lg border border-border px-3 py-2 text-sm">{feedback}</div>
        )}

        {/* Action buttons — mobile-friendly stacking */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center border-t border-border pt-4">
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href={projectPath}>Back to project</Link>
            </Button>
            <Button disabled={isSaving || isReplacing} type="submit">
              {isSaving ? 'Saving...' : LABELS.common.save}
            </Button>
          </div>
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={() => {
              const confirmed = window.confirm(LABELS.task.deleteConfirm)

              if (!confirmed) {
                return
              }

              setFeedback(null)
              startDeleting(async () => {
                const result = await deleteTaskAction(task.id, projectId, designFilePath ?? undefined)

                if (result.success) {
                  router.push(projectPath)
                  router.refresh()
                } else {
                  setFeedback(result.error)
                }
              })
            }}
          >
            {isDeleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {LABELS.task.deleted}
          </Button>
        </div>
      </form>
    </div>
  )
}
