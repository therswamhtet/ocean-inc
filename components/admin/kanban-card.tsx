'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { format, isBefore, startOfDay } from 'date-fns'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import type { TaskRow } from '@/app/admin/clients/[clientId]/projects/[projectId]/task-view-toggle'
import { StatusDot } from '@/components/ui/status-dot'

type KanbanCardProps = {
  task: TaskRow
  projectId: string
}

export function KanbanCard({ task, projectId }: KanbanCardProps) {
  const params = useParams<{ clientId: string }>()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isOverdue = Boolean(
    task.posting_date && isBefore(startOfDay(new Date(task.posting_date)), startOfDay(new Date())) && task.status !== 'done'
  )

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="border border-border rounded-sm bg-background p-3 cursor-grab hover:border-foreground/30 active:cursor-grabbing"
      data-dragging={isDragging ? 'true' : 'false'}
      {...attributes}
      {...listeners}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <StatusDot status={isOverdue ? 'overdue' : task.status} />
        <span className="text-xs text-muted-foreground">
          {task.posting_date ? format(new Date(task.posting_date), 'MMM d') : 'No date'}
        </span>
      </div>

      <Link
        href={`/admin/clients/${params.clientId}/projects/${projectId}/tasks/${task.id}`}
        className="block truncate text-sm font-medium text-foreground underline-offset-4 hover:underline"
      >
        {task.title}
      </Link>
    </article>
  )
}
