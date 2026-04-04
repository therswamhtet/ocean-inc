import { isBefore, startOfDay } from 'date-fns'

import { PortalKanbanTaskCard } from '@/components/portal/kanban-task-card'
import type { PortalTask, PortalTaskStatus } from '@/lib/portal/types'

type PortalKanbanViewProps = {
  tasks: PortalTask[]
  onTaskSelect: (task: PortalTask) => void
}

const columnOrder: PortalTaskStatus[] = ['todo', 'in_progress', 'done']

const columnLabels: Record<PortalTaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
}

function isTaskOverdue(task: PortalTask) {
  if (!task.postingDate || task.status === 'done') {
    return false
  }

  const postingDate = new Date(task.postingDate)
  if (Number.isNaN(postingDate.getTime())) {
    return false
  }

  return isBefore(startOfDay(postingDate), startOfDay(new Date()))
}

export function PortalKanbanView({ tasks, onTaskSelect }: PortalKanbanViewProps) {
  const hasTasks = tasks.length > 0

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* D-01 lock: 3 columns only (todo/in_progress/done); overdue is visual-only. */}
      {columnOrder.map((status) => {
        const tasksInColumn = tasks.filter((task) => task.status === status)

        return (
          <section
            key={status}
            aria-label={columnLabels[status]}
            className="space-y-3 rounded-lg border border-border bg-muted/20 p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">{columnLabels[status]}</h3>
              <span className="text-xs text-muted-foreground">{tasksInColumn.length}</span>
            </div>

              <div className="space-y-3">
                {tasksInColumn.map((task) => (
                  <PortalKanbanTaskCard
                    key={task.id}
                    task={task}
                    isOverdue={isTaskOverdue(task)}
                    onSelect={onTaskSelect}
                  />
                ))}

              {tasksInColumn.length === 0 ? (
                <div className="rounded-sm border border-dashed border-border px-3 py-8 text-center text-sm text-muted-foreground">
                  No tasks.
                </div>
              ) : null}
            </div>
          </section>
        )
      })}

      {!hasTasks ? (
        <p className="md:col-span-3 text-sm text-muted-foreground">
          No tasks are scheduled yet for this active project.
        </p>
      ) : null}
    </div>
  )
}
