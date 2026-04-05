'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { createTaskAction } from '@/app/admin/clients/[clientId]/projects/[projectId]/actions'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import { DesignFileUploader } from '@/components/admin/design-file-uploader'
import { LABELS } from '@/lib/labels'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

type TeamMember = {
  id: string
  name: string
  email: string
  username: string | null
}

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  briefing: z.string().optional(),
  caption: z.string().optional(),
  postingDate: z.string().optional(),
  deadline: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']),
  assignedTo: z.string().optional(),
  designFilePath: z.string().optional(),
})

type TaskFormValues = z.infer<typeof taskSchema>

type TaskCreateFormProps = {
  projectId: string
  onSuccess?: () => void
}

export function TaskCreateForm({ projectId, onSuccess }: TaskCreateFormProps) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      briefing: '',
      caption: '',
      postingDate: '',
      deadline: '',
      status: 'todo',
      assignedTo: '',
      designFilePath: '',
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form

  useEffect(() => {
    const supabase = createSupabaseClient()
    const fetchTeamMembers = async () => {
      const { data } = await supabase
        .from('team_members')
        .select('id, name, email, username')
        .order('name', { ascending: true })
      if (data) {
        setTeamMembers(data)
      }
    }
    fetchTeamMembers()
  }, [])

  // Local state for Select (avoids watch() compiler warning with memoized components)
  const [statusValue, setStatusValue] = useState<'todo' | 'in_progress' | 'done'>('todo')
  const [assignedToValue, setAssignedToValue] = useState('')

  const onSubmit = handleSubmit((values) => {
    setMessage(null)

    startTransition(async () => {
      const result = await createTaskAction(projectId, values, values.assignedTo || null)

      if (result.success) {
        setMessage('Task created')
        form.reset({
          title: '',
          briefing: '',
          caption: '',
          postingDate: '',
          deadline: '',
          status: 'todo',
          assignedTo: '',
          designFilePath: '',
        })
        setStatusValue('todo')
        setAssignedToValue('')
        router.refresh()
        onSuccess?.()
      } else {
        setMessage(result.error)
      }
    })
  })

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input id="title" placeholder="Instagram carousel" {...register('title')} />
          {errors.title ? <FieldError>{errors.title.message}</FieldError> : null}
        </Field>

        <Field className="sm:col-span-2">
          <FieldLabel>{LABELS.task.briefing}</FieldLabel>
          <Textarea id="briefing" placeholder="Key notes, references, or campaign direction" {...register('briefing')} />
          {errors.briefing ? <FieldError>{errors.briefing.message}</FieldError> : null}
        </Field>

        <Field className="sm:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <FieldLabel htmlFor="caption">{LABELS.task.caption}</FieldLabel>
            <span className="text-xs text-muted-foreground">Copy button appears on the task detail screen.</span>
          </div>
          <Textarea id="caption" placeholder="Write the post caption here" {...register('caption')} />
          {errors.caption ? <FieldError>{errors.caption.message}</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="postingDate">{LABELS.task.postingDate}</FieldLabel>
          <Input id="postingDate" type="date" {...register('postingDate')} />
          {errors.postingDate ? <FieldError>{errors.postingDate.message}</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="deadline">{LABELS.task.deadline}</FieldLabel>
          <Input id="deadline" type="date" {...register('deadline')} />
          {errors.deadline ? <FieldError>{errors.deadline.message}</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel>{LABELS.task.status}</FieldLabel>
          <Select
            defaultValue="todo"
            value={statusValue}
            onValueChange={(value: 'todo' | 'in_progress' | 'done') => {
              setStatusValue(value)
              setValue('status', value, { shouldValidate: true })
            }}
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

        <Field>
          <FieldLabel>{LABELS.task.assignee}</FieldLabel>
          <Select
            value={assignedToValue}
            onValueChange={(value) => {
              setAssignedToValue(value)
              setValue('assignedTo', value, { shouldValidate: true })
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="self">Assign to myself</SelectItem>
              {teamMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.username ? `@${member.username}` : member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.assignedTo ? <FieldError>{errors.assignedTo.message}</FieldError> : null}
        </Field>
      </div>

      <Field>
        <FieldLabel>Design file</FieldLabel>
        <DesignFileUploader
          projectId={projectId}
          onUploadComplete={(path) => {
            setValue('designFilePath', path, { shouldDirty: true })
            setMessage('Design file uploaded. Ready to create task.')
          }}
        />
      </Field>

      {message ? <div className="rounded-lg border border-border px-3 py-2 text-sm">{message}</div> : null}

      <div className="flex justify-end">
        <Button disabled={isPending} type="submit">
          {isPending ? 'Creating...' : 'Create Task'}
        </Button>
      </div>
    </form>
  )
}

export { taskSchema }
