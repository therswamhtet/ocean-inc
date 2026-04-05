'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { createTaskAction } from '@/app/admin/clients/[clientId]/projects/[projectId]/actions'
import { getClientsAction, getProjectsAction, getTeamMembersAction } from '@/app/admin/clients/actions'
import { DesignFileUploader } from '@/components/admin/design-file-uploader'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { LABELS } from '@/lib/labels'

type Client = {
  id: string
  name: string
  color: string
}

type Project = {
  id: string
  name: string
  month: string
  year: number
}

type TeamMember = {
  id: string
  name: string
  email: string
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

type QuickTaskDialogProps = {
  onSuccess?: () => void
}

export function QuickTaskDialog({ onSuccess }: QuickTaskDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'select' | 'create'>('select')
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [message, setMessage] = useState<string | null>(null)

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

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = form
  const [statusValue, setStatusValue] = useState<'todo' | 'in_progress' | 'done'>('todo')
  const [assignedToValue, setAssignedToValue] = useState('')
  const watchedDesignFilePath = watch('designFilePath')

  useEffect(() => {
    if (!open) return

    startTransition(async () => {
      const result = await getClientsAction()
      if (result.success) {
        setClients(result.clients)
      }
    })

    startTransition(async () => {
      const membersResult = await getTeamMembersAction()
      if (membersResult.success) {
        setTeamMembers(membersResult.teamMembers)
      }
    })
  }, [open])

  useEffect(() => {
    if (!selectedClientId) {
      setProjects([])
      setSelectedProjectId('')
      return
    }

    startTransition(async () => {
      const result = await getProjectsAction(selectedClientId)
      if (result.success) {
        setProjects(result.projects)
      }
    })
  }, [selectedClientId])

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId)
    setStep('create')
  }

  const onSubmit = handleSubmit((values) => {
    setMessage(null)

    startTransition(async () => {
      const result = await createTaskAction(selectedProjectId, {
        ...values,
        designFilePath: values.designFilePath ?? '',
      })

      if (result.success) {
        setMessage('Task created')
        reset({
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

        setTimeout(() => {
          handleClose()
        }, 1000)
      } else {
        setMessage(result.error)
      }
    })
  })

  const handleClose = () => {
    setOpen(false)
    setStep('select')
    setSelectedClientId('')
    setSelectedProjectId('')
    setProjects([])
    setMessage(null)
    reset({
      title: '',
      briefing: '',
      caption: '',
      postingDate: '',
      deadline: '',
      status: 'todo',
      assignedTo: '',
      designFilePath: '',
    })
  }

  const handleBack = () => {
    setStep('select')
    setSelectedProjectId('')
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !newOpen && handleClose()}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Quick Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {step === 'select' ? (
          <>
            <DialogHeader>
              <DialogTitle>Select Client & Project</DialogTitle>
              <DialogDescription>
                Choose a client and project for the new task.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <Field>
                <FieldLabel>Client</FieldLabel>
                <Select
                  value={selectedClientId}
                  onValueChange={(value) => {
                    setSelectedClientId(value)
                    setSelectedProjectId('')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: client.color }}
                          />
                          {client.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Project</FieldLabel>
                <Select
                  value={selectedProjectId}
                  onValueChange={handleProjectSelect}
                  disabled={!selectedClientId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={selectedClientId ? 'Select a project' : 'Select a client first'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.month} {project.year} — {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleBack} className="-ml-2">
                  ← Back
                </Button>
                <DialogTitle>Create Task</DialogTitle>
              </div>
              <DialogDescription>
                Adding task to the selected project.
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-4 pt-2" onSubmit={onSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="title">Title</FieldLabel>
                  <Input id="title" placeholder="Instagram carousel" {...register('title')} />
                  {errors.title ? <FieldError>{errors.title.message}</FieldError> : null}
                </Field>

                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="briefing">{LABELS.task.briefing}</FieldLabel>
                  <Textarea id="briefing" placeholder="Key notes, references, or campaign direction" {...register('briefing')} />
                  {errors.briefing ? <FieldError>{errors.briefing.message}</FieldError> : null}
                </Field>

                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="caption">{LABELS.task.caption}</FieldLabel>
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
                          {member.name}
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
                  projectId={selectedProjectId}
                  onUploadComplete={(path) => {
                    setValue('designFilePath', path, { shouldDirty: true })
                    setMessage('Design file uploaded. Ready to create task.')
                  }}
                />
              </Field>

              {message ? (
                <div className="rounded-lg border border-border px-3 py-2 text-sm">{message}</div>
              ) : null}

              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={handleClose}>
                  {LABELS.common.cancel}
                </Button>
                <Button disabled={isPending} type="submit">
                  {isPending ? 'Creating...' : 'Create Task'}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
