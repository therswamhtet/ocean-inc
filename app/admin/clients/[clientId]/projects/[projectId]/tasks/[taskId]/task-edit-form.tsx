'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Download, LoaderCircle, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  assignTaskToMemberAction,
  deleteTaskAction,
  updateTaskAction,
  updateTaskFilePathAction,
} from '@/app/admin/clients/[clientId]/projects/[projectId]/actions'
import CopyButton from '@/components/admin/copy-button'
import { DesignFileUploader } from '@/components/admin/design-file-uploader'
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

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  briefing: z.string().optional(),
  caption: z.string().optional(),
  postingDate: z.string().optional(),
  dueDate: z.string().optional(),
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
    dueDate: string | null
    deadline: string | null
    status: 'todo' | 'in_progress' | 'done'
    designFilePath: string | null
  }
  teamMembers: Array<{
    id: string
    name: string
    email: string
  }>
  initialAssignmentId: string | null
}

function BriefingPreview({ text }: { text: string }) {
  if (!text) {
    return null
  }

  return (
    <div
      className="rounded-lg border border-border px-3 py-3 text-sm text-foreground"
      dangerouslySetInnerHTML={{ __html: linkify(text) }}
    />
  )
}

function DesignFileDownloader({ path, fileName }: { path: string; fileName: string }) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setError(null)

          startTransition(async () => {
            const supabase = createClient()
            const { data, error: signedUrlError } = await supabase.storage
              .from('design-files')
              .createSignedUrl(path, 60, {
                download: fileName,
              })

            if (signedUrlError || !data?.signedUrl) {
              setError(signedUrlError?.message ?? 'Unable to create a download link.')
              return
            }

            window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
          })
        }}
      >
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        Download file
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}

export function TaskEditForm({
  clientId,
  projectId,
  task,
  teamMembers,
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
      dueDate: task.dueDate ?? '',
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

  const currentFileName = useMemo(() => designFilePath?.split('/').pop() ?? null, [designFilePath])
  const projectPath = `/admin/clients/${clientId}/projects/${projectId}`

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
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <form className="space-y-6 rounded-lg border border-border p-5" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="title">Title</FieldLabel>
            <Input id="title" placeholder="Instagram carousel" {...register('title')} />
            {errors.title ? <FieldError>{errors.title.message}</FieldError> : null}
          </Field>

          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="briefing">Briefing</FieldLabel>
            <Textarea id="briefing" placeholder="Key notes, references, or campaign direction" {...register('briefing')} />
            <FieldDescription>URLs render below as clickable preview links.</FieldDescription>
            {errors.briefing ? <FieldError>{errors.briefing.message}</FieldError> : null}
          </Field>

          <Field className="sm:col-span-2">
            <FieldLabel>Briefing preview</FieldLabel>
            <BriefingPreview text={watch('briefing') ?? ''} />
          </Field>

          <Field className="sm:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <FieldLabel htmlFor="caption">Caption</FieldLabel>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Keep the final social copy current here.</span>
                <CopyButton label="Copy" text={watch('caption') ?? ''} />
              </div>
            </div>
            <Textarea id="caption" placeholder="Write the post caption here" {...register('caption')} />
            {errors.caption ? <FieldError>{errors.caption.message}</FieldError> : null}
          </Field>

          <Field>
            <FieldLabel htmlFor="postingDate">Posting date</FieldLabel>
            <Input id="postingDate" type="date" {...register('postingDate')} />
            {errors.postingDate ? <FieldError>{errors.postingDate.message}</FieldError> : null}
          </Field>

          <Field>
            <FieldLabel htmlFor="dueDate">Due date</FieldLabel>
            <Input id="dueDate" type="date" {...register('dueDate')} />
            {errors.dueDate ? <FieldError>{errors.dueDate.message}</FieldError> : null}
          </Field>

          <Field>
            <FieldLabel htmlFor="deadline">Deadline</FieldLabel>
            <Input id="deadline" type="date" {...register('deadline')} />
            {errors.deadline ? <FieldError>{errors.deadline.message}</FieldError> : null}
          </Field>

          <Field>
            <FieldLabel>Status</FieldLabel>
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
            {errors.status ? <FieldError>{errors.status.message}</FieldError> : null}
          </Field>
        </div>

        <Field>
          <div className="flex items-center justify-between gap-3">
            <FieldLabel>Design file</FieldLabel>
            {currentFileName ? <span className="text-xs text-muted-foreground">Replace the current upload any time.</span> : null}
          </div>

          {designFilePath && currentFileName ? (
            <div className="space-y-4 rounded-lg border border-border p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Current file: {currentFileName}</p>
                <p className="break-all text-xs text-muted-foreground">{designFilePath}</p>
              </div>
              <DesignFileDownloader fileName={currentFileName} path={designFilePath} />
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

        {feedback ? <div className="rounded-lg border border-border px-3 py-2 text-sm">{feedback}</div> : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={() => {
              const confirmed = window.confirm('Delete this task? This also removes the current design file.')

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
            Delete task
          </Button>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline">
              <Link href={projectPath}>Back to project</Link>
            </Button>
            <Button disabled={isSaving || isReplacing} type="submit">
              {isSaving ? 'Saving...' : 'Save task'}
            </Button>
          </div>
        </div>
      </form>

      <aside className="space-y-5 rounded-lg border border-border p-5">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Assignment</p>
          <h2 className="text-lg font-semibold text-foreground">Team member</h2>
          <p className="text-sm text-muted-foreground">Assign or unassign this task without leaving the page.</p>
        </div>

        <Field>
          <FieldLabel>Assigned to</FieldLabel>
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
              <SelectValue placeholder="Select a team member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassign</SelectItem>
              {teamMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name} · {member.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>
            {isAssigning ? 'Updating assignment...' : 'Changes save immediately for the project and task views.'}
          </FieldDescription>
        </Field>
      </aside>
    </div>
  )
}
