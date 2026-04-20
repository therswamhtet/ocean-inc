import { format, isBefore, startOfDay } from 'date-fns'

import { PortalKanbanTaskCard } from '@/components/portal/kanban-task-card'
import type { PortalTask, PortalTaskStatus } from '@/lib/portal/types'

type PortalKanbanViewProps = {
  tasks: PortalTask[]
  onTaskSelect: (task: PortalTask) => void
}

type KanbanColumn = {
  status: PortalTaskStatus
  label: string
  dotColor: string
}

const columns: KanbanColumn[] = [
  { status: 'todo', label: 'To Do', dotColor: 'bg-slate-400' },
  { status: 'in_progress', label: 'In Progress', dotColor: 'bg-blue-400' },
  { status: 'done', label: 'Done', dotColor: 'bg-green-500' },
]

function isTaskOverdue(task: PortalTask) {
  if (!task.postingDate || task.status === 'done') return false
  const postingDate = new Date(task.postingDate)
  if (Number.isNaN(postingDate.getTime())) return false
  return isBefore(startOfDay(postingDate), startOfDay(new Date()))
}

export function PortalKanbanView({ tasks, onTaskSelect }: PortalKanbanViewProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {columns.map((column) => {
        const tasksInColumn = tasks.filter((task) => task.status === column.status)

        return (
          <section
            key={column.status}
            aria-label={column.label}
            className="flex flex-col rounded-lg border border-border bg-muted/20"
          >
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <span className={`h-2 w-2 rounded-full ${column.dotColor}`} />
              <h3 className="text-sm font-semibold text-foreground">{column.label}</h3>
              <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {tasksInColumn.length}
              </span>
            </div>

            <div className="flex min-h-40 flex-col gap-3 p-3">
              {tasksInColumn.map((task) => (
                <PortalKanbanTaskCard
                  key={task.id}
                  task={task}
                  isOverdue={isTaskOverdue(task)}
                  onSelect={onTaskSelect}
                />
              ))}

              {tasksInColumn.length === 0 && (
                <div className="flex min-h-32 items-center justify-center rounded-md border border-dashed border-border">
                  <p className="text-sm text-muted-foreground">No tasks</p>
                </div>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}