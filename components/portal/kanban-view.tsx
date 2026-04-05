import { isBefore, startOfDay } from 'date-fns'

import { LABELS } from '@/lib/labels'
import { PortalKanbanTaskCard } from '@/components/portal/kanban-task-card'
import type { PortalTask, PortalTaskStatus } from '@/lib/portal/types'

type PortalKanbanViewProps = {
  tasks: PortalTask[]
  onTaskSelect: (task: PortalTask) => void
}

const columnOrder: PortalTaskStatus[] = ['todo', 'in_progress', 'done']

const kanbanLabels = {
  todo: LABELS.kanban.columns.todo,
  in_progress: LABELS.kanban.columns.in_progress,
  done: LABELS.kanban.columns.done,
}

const columnLabels: Record<PortalTaskStatus, string> = {
  todo: kanbanLabels.todo,
  in_progress: kanbanLabels.in_progress,
  done: kanbanLabels.done,
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
  const overdueCount = tasks.filter((t) => isTaskOverdue(t)).length

  return (
    <div className="space-y-4">
      {/* Header matching Calendar view structure */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-foreground">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        {overdueCount > 0 && (
          <p className="text-sm text-destructive">{overdueCount} overdue</p>
        )}
      </div>

      {/* Columns */}
      <div className="grid gap-4 md:grid-cols-3">
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
                    {LABELS.emptyStates.noTasksInColumn}
                  </div>
                ) : null}
              </div>
            </section>
          )
        })}
      </div>

      {!hasTasks ? (
        <p className="text-sm text-muted-foreground">
          {LABELS.emptyStates.noTasksScheduled}
        </p>
      ) : null}
    </div>
  )
}
