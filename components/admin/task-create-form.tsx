'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { createTaskAction } from '@/app/admin/clients/[clientId]/projects/[projectId]/actions'
import { DesignFileUploader } from '@/components/admin/design-file-uploader'
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

type TaskCreateFormProps = {
  projectId: string
  onSuccess?: () => void
}

export function TaskCreateForm({ projectId, onSuccess }: TaskCreateFormProps) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      briefing: '',
      caption: '',
      postingDate: '',
      dueDate: '',
      deadline: '',
      status: 'todo',
      designFilePath: '',
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form

  const onSubmit = handleSubmit((values) => {
    setMessage(null)

    startTransition(async () => {
      const result = await createTaskAction(projectId, values)

      if (result.success) {
        setMessage('Task created')
        form.reset({
          title: '',
          briefing: '',
          caption: '',
          postingDate: '',
          dueDate: '',
          deadline: '',
          status: 'todo',
          designFilePath: '',
        })
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
          <FieldLabel htmlFor="briefing">Briefing</FieldLabel>
          <Textarea id="briefing" placeholder="Key notes, references, or campaign direction" {...register('briefing')} />
          {errors.briefing ? <FieldError>{errors.briefing.message}</FieldError> : null}
        </Field>

        <Field className="sm:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <FieldLabel htmlFor="caption">Caption</FieldLabel>
            <span className="text-xs text-muted-foreground">Copy button appears on the task detail screen.</span>
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
            defaultValue="todo"
            value={watch('status')}
            onValueChange={(value: 'todo' | 'in_progress' | 'done') => setValue('status', value, { shouldValidate: true })}
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
