'use client'

import { useState, useTransition } from 'react'
import { format, isBefore, startOfDay } from 'date-fns'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

import type { TaskRow } from '@/app/admin/clients/[clientId]/projects/[projectId]/task-view-toggle'
import { StatusDot } from '@/components/ui/status-dot'
import { ContentCard } from '@/components/ui/content-card'
import { Button } from '@/components/ui/button'
import { TaskDetailDialog } from '@/components/admin/task-detail-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateTaskAction } from '@/app/admin/clients/[clientId]/projects/[projectId]/actions'
import { cn } from '@/lib/utils'

type KanbanCardProps = {
  task: TaskRow
  projectId: string
}

const editTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  posting_date: z.string().optional(),
  posting_time: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']),
})

type EditTaskFormValues = z.infer<typeof editTaskSchema>

/** Derive a task category tag from task fields */
function getTaskTags(task: TaskRow): string[] {
  const tags: string[] = []
  if (task.caption) tags.push('Content')
  if (task.design_file_path) tags.push('Design')
  if (task.briefing) tags.push('Briefed')
  if (!task.caption && !task.design_file_path && !task.briefing) tags.push('Todo')
  return tags
}

function formatCardDate(task: TaskRow) {
  const date = task.due_date || task.posting_date
  if (!date) return null
  return format(new Date(date), 'MMM d')
}

function isTaskOverdue(task: TaskRow) {
  const date = task.due_date || task.posting_date
  return Boolean(
    date && isBefore(startOfDay(new Date(date)), startOfDay(new Date())) && task.status !== 'done'
  )
}

export function KanbanCard({ task, projectId }: KanbanCardProps) {
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const overdue = isTaskOverdue(task)
  const cardDate = formatCardDate(task)
  const tags = getTaskTags(task)

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDetailDialogOpen(true)
  }

  const handleEditClick = () => {
    setDetailDialogOpen(false)
    setEditDialogOpen(true)
  }

  return (
    <>
      <article
        ref={setNodeRef}
        style={style}
        data-dragging={isDragging ? 'true' : 'false'}
        onClick={handleCardClick}
      >
        <ContentCard
          variant="kanban"
          className={cn(
            'group bg-background transition hover:shadow-sm relative',
            overdue ? 'border-destructive/40 hover:border-destructive/60' : 'hover:border-foreground/30 cursor-pointer'
          )}
        >
          {/* Drag handle */}
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            {...attributes}
            {...listeners}
            className="absolute top-2 right-2 cursor-grab active:cursor-grabbing p-0.5 text-muted-foreground hover:text-foreground transition-opacity"
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          {/* Tags row at top */}
          {tags.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    'rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em]',
                    tag === 'Content' ? 'bg-blue-100 text-blue-700' :
                    tag === 'Design' ? 'bg-purple-100 text-purple-700' :
                    tag === 'Briefed' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-muted text-muted-foreground'
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <span className="mb-3 block text-sm font-medium leading-snug text-foreground">
            {task.title}
          </span>

          {/* Bottom row: status dot + assignee + date + overdue */}
          <div className="flex items-center justify-between">
            {/* Left: status + assignee */}
            <div className="flex items-center gap-2">
              <StatusDot status={overdue ? 'overdue' : task.status} />
              {task.assigned_to_username && (
                <span className="text-[11px] font-mono text-muted-foreground">
                  @ {task.assigned_to_username}
                </span>
              )}
            </div>

            {/* Right: date + overdue badge */}
            {cardDate && (
              <span className={cn(
                'text-[11px] font-medium',
                overdue ? 'text-destructive' : 'text-muted-foreground'
              )}>
                {cardDate}
              </span>
            )}
          </div>

          {overdue && (
            <div className="mt-2 inline-flex items-center gap-1 rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
              Overdue
            </div>
          )}
        </ContentCard>
      </article>

      <TaskDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        task={task}
      />

      <EditTaskDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        task={task}
        onEdit={handleEditClick}
      />
    </>
  )
}

function EditTaskDialog({ open, onOpenChange, task, onEdit }: { open: boolean; onOpenChange: (open: boolean) => void; task: TaskRow; onEdit: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<string | null>(null)

  const form = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      title: task.title,
      posting_date: task.posting_date ?? '',
      posting_time: task.posting_time ?? '10:00',
      status: task.status,
    },
  })

  const onSubmit = (values: EditTaskFormValues) => {
    setFeedback(null)
    startTransition(async () => {
      const result = await updateTaskAction(task.id, {
        title: values.title,
        postingDate: values.posting_date || undefined,
        postingTime: values.posting_time || undefined,
        status: values.status,
      })
      if (result.success) {
        onOpenChange(false)
        window.location.reload()
      } else {
        setFeedback(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input
              id="title"
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="posting_date" className="text-sm font-medium">Posting Date</label>
              <Input
                id="posting_date"
                type="date"
                {...form.register('posting_date')}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="posting_time" className="text-sm font-medium">Posting Time</label>
              <Input
                id="posting_time"
                type="time"
                {...form.register('posting_time')}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <Select
                value={form.watch('status')}
                onValueChange={(value: 'todo' | 'in_progress' | 'done') => 
                  form.setValue('status', value, { shouldDirty: true })
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
            </div>
          </div>

          {feedback && (
            <div className="rounded-lg border border-destructive px-3 py-2 text-sm text-destructive">
              {feedback}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
