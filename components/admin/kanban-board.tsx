'use client'

import { useMemo, useState, useTransition } from 'react'
import { closestCorners, DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, useDroppable, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import type { TaskRow } from '@/app/admin/clients/[clientId]/projects/[projectId]/task-view-toggle'
import { KanbanCard } from '@/components/admin/kanban-card'
import { cn } from '@/lib/utils'

type TaskStatus = 'todo' | 'in_progress' | 'done'

type KanbanBoardProps = {
  tasks: TaskRow[]
  projectId: string
}

const columnOrder: TaskStatus[] = ['todo', 'in_progress', 'done']

const columnLabels: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
}

async function updateTaskStatusAction(taskId: string, newStatus: TaskStatus) {
  void taskId
  void newStatus

  return { success: true }
}

function KanbanColumn({
  status,
  tasks,
  projectId,
}: {
  status: TaskStatus
  tasks: TaskRow[]
  projectId: string
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `column:${status}` })

  return (
    <section className="rounded-lg border border-border bg-muted/20 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{columnLabels[status]}</h3>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>

      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            'flex min-h-40 flex-col gap-3 rounded-md border border-dashed border-transparent p-1 transition',
            isOver && 'border-border bg-background/70'
          )}
        >
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} projectId={projectId} />
          ))}

          {tasks.length === 0 ? (
            <div className="rounded-sm border border-dashed border-border px-3 py-8 text-center text-sm text-muted-foreground">
              Drop a task here.
            </div>
          ) : null}
        </div>
      </SortableContext>
    </section>
  )
}

export function KanbanBoard({ tasks, projectId }: KanbanBoardProps) {
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
          {columnOrder.map((status) => (
            <KanbanColumn key={status} status={status} tasks={tasksByStatus[status]} projectId={projectId} />
          ))}
        </div>
      </DndContext>

      {isPending ? <p className="text-sm text-muted-foreground">Saving board changes…</p> : null}
    </div>
  )
}
