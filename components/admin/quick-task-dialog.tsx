'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { createTaskAction } from '@/app/admin/clients/[clientId]/projects/[projectId]/actions'
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
import { cn } from '@/lib/utils'

type Client = {
  id: string
  name: string
  color: string
}

type Project = {
  id: string
  name: string
  month: number
  year: number
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

type QuickTaskDialogProps = {
  clients: Client[]
  projectsByClient: Record<string, Project[]>
  onSuccess?: () => void
}

function monthName(m: number) {
  return new Date(0, m - 1).toLocaleString('default', { month: 'short' })
}

export function QuickTaskDialog({ clients, projectsByClient, onSuccess }: QuickTaskDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [message, setMessage] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      briefing: '',
      caption: '',
      postingDate: '',
      deadline: '',
      status: 'todo',
      designFilePath: '',
    },
  })

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = form
  const [statusValue, setStatusValue] = useState<'todo' | 'in_progress' | 'done'>('todo')
  const watchedDesignFilePath = watch('designFilePath')

  const availableProjects = selectedClientId ? (projectsByClient[selectedClientId] ?? []) : []

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId)
    setSelectedProjectId('')
  }

  const onSubmit = handleSubmit((values) => {
    setMessage(null)

    startTransition(async () => {
      const result = await createTaskAction(selectedProjectId, {
        ...values,
        designFilePath: values.designFilePath ?? '',
      }, null)

      if (result.success) {
        setMessage('Task created successfully')
        reset({
          title: '',
          briefing: '',
          caption: '',
          postingDate: '',
          deadline: '',
          status: 'todo',
          designFilePath: '',
        })
        setStatusValue('todo')
        router.refresh()
        onSuccess?.()

        setTimeout(() => {
          handleClose()
        }, 800)
      } else {
        setMessage(result.error ?? 'Failed to create task')
      }
    })
  })

  const handleClose = () => {
    setOpen(false)
    setSelectedClientId('')
    setSelectedProjectId('')
    setMessage(null)
    reset({
      title: '',
      briefing: '',
      caption: '',
      postingDate: '',
      deadline: '',
      status: 'todo',
      designFilePath: '',
    })
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => setOpen(newOpen)}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Quick Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>
            Choose a client and project, then fill in the details.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5 pt-2" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Client</label>
              <Select value={selectedClientId} onValueChange={handleClientSelect}>
                <SelectTrigger className="h-10">
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Project</label>
              <Select
                value={selectedProjectId}
                onValueChange={setSelectedProjectId}
                disabled={!selectedClientId}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={selectedClientId ? 'Select a project' : 'Select client first'} />
                </SelectTrigger>
                <SelectContent>
                  {availableProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {monthName(project.month)} {project.year} — {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedProjectId && (
            <>
              <div className="border-t border-border pt-4 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="quick-title" className="text-sm font-medium text-foreground">Title</label>
                  <Input
                    id="quick-title"
                    placeholder="Instagram carousel"
                    className="h-10"
                    {...register('title')}
                  />
                  {errors.title && <p className="text-xs text-[#D71921]">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="quick-briefing" className="text-sm font-medium text-foreground">
                    {LABELS.task.briefing} <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <Textarea
                    id="quick-briefing"
                    placeholder="Key notes, references, or campaign direction"
                    rows={2}
                    {...register('briefing')}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="quick-caption" className="text-sm font-medium text-foreground">
                    {LABELS.task.caption} <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <Textarea
                    id="quick-caption"
                    placeholder="Write the post caption here"
                    rows={2}
                    {...register('caption')}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{LABELS.task.postingDate}</label>
                  <Input type="date" className="h-10" {...register('postingDate')} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{LABELS.task.deadline}</label>
                  <Input type="date" className="h-10" {...register('deadline')} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{LABELS.task.status}</label>
                  <Select
                    value={statusValue}
                    onValueChange={(value: 'todo' | 'in_progress' | 'done') => {
                      setStatusValue(value)
                      setValue('status', value, { shouldValidate: true })
                    }}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Design file</label>
                <DesignFileUploader
                  projectId={selectedProjectId}
                  onUploadComplete={(path) => {
                    setValue('designFilePath', path, { shouldDirty: true })
                    setMessage('Design file uploaded. Ready to create task.')
                  }}
                />
              </div>

              {message && (
                <div className={cn(
                  'rounded-lg border px-4 py-2.5 text-sm',
                  message.includes('success') || message.includes('uploaded')
                    ? 'border-[#4A9E5C]/20 bg-[#4A9E5C]/10 text-[#4A9E5C]'
                    : 'border-border text-foreground'
                )}>
                  {message}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-1">
                <Button variant="outline" type="button" onClick={handleClose}>
                  Cancel
                </Button>
                <Button disabled={isPending} type="submit">
                  {isPending ? 'Creating...' : 'Create Task'}
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}