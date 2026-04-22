'use client'

import { useMemo, useState, useTransition } from 'react'
import { closestCorners, DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, useDroppable, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import { updateTaskStatusAction } from '@/app/admin/clients/[clientId]/projects/[projectId]/actions'
import type { TaskRow } from '@/app/admin/clients/[clientId]/projects/[projectId]/task-view-toggle'
import { KanbanCard } from '@/components/admin/kanban-card'
import { cn } from '@/lib/utils'

type TaskStatus = 'todo' | 'in_progress' | 'done'

type KanbanColumn = {
  status: TaskStatus
  label: string
  dotColor: string
  count: number
}

type KanbanBoardProps = {
  tasks: TaskRow[]
  projectId: string
  clientId: string
}

const columns: KanbanColumn[] = [
  { status: 'todo', label: 'To Do', dotColor: 'bg-status-todo', count: 0 },
  { status: 'in_progress', label: 'In Progress', dotColor: 'bg-status-in-progress', count: 0 },
  { status: 'done', label: 'Done', dotColor: 'bg-status-done', count: 0 },
]

function KanbanColumn({
  column,
  tasks,
  projectId,
  clientId,
}: {
  column: KanbanColumn
  tasks: TaskRow[]
  projectId: string
  clientId: string
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `column:${column.status}` })

  return (
    <section className="flex flex-col rounded-lg border border-border bg-surface-raised">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className={`h-2 w-2 rounded-full ${column.dotColor}`} />
        <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{column.label}</h3>
        <span className="ml-auto rounded-full bg-surface border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            'flex min-h-40 flex-col gap-3 p-3 transition',
            isOver && 'bg-surface-raised'
          )}
        >
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} projectId={projectId} clientId={clientId} />
          ))}

          {tasks.length === 0 ? (
            <div className="flex min-h-32 items-center justify-center rounded-md border border-dashed border-border">
              <p className="text-sm text-muted-foreground">No tasks</p>
            </div>
          ) : null}
        </div>
      </SortableContext>
    </section>
  )
}

export function KanbanBoard({ tasks, projectId, clientId }: KanbanBoardProps) {
  const [items, setItems] = useState(tasks)
  const [isPending, startTransition] = useTransition()
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor))

  const tasksByStatus = useMemo(
    () => ({
      todo: items.filter((task) => task.status === 'todo'),
      in_progress: items.filter((task) => task.status === 'in_progress'),
      done: items.filter((task) => task.status === 'done'),
    }),
    [items]
  )

  function resolveStatus(overId: string | undefined) {
    if (!overId) {
      return null
    }

    if (overId.startsWith('column:')) {
      return overId.replace('column:', '') as TaskStatus
    }

    const overTask = items.find((task) => task.id === overId)
    return overTask?.status ?? null
  }

  function handleDragEnd(event: DragEndEvent) {
    const taskId = String(event.active.id)
    const newStatus = resolveStatus(event.over?.id ? String(event.over.id) : undefined)
    const currentTask = items.find((task) => task.id === taskId)

    if (!currentTask || !newStatus || currentTask.status === newStatus) {
      return
    }

    const previousItems = items
    const optimisticItems = items.map((task) =>
      task.id === taskId ? { ...task, status: newStatus } : task
    )

    setItems(optimisticItems)

    startTransition(async () => {
      const result = await updateTaskStatusAction(taskId, newStatus)

      if (!result.success) {
        setItems(previousItems)
      }
    })
  }

  return (
    <div className="space-y-3">
      <DndContext collisionDetection={closestCorners} sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid gap-4 lg:grid-cols-3">
          {columns.map((column) => (
            <KanbanColumn
              key={column.status}
              column={column}
              tasks={tasksByStatus[column.status]}
              projectId={projectId}
              clientId={clientId}
            />
          ))}
        </div>
      </DndContext>

      {isPending ? <p className="text-sm text-muted-foreground">Saving board changes…</p> : null}
    </div>
  )
}
