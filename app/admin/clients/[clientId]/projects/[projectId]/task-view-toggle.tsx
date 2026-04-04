'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export type TaskRow = {
  id: string
  title: string
  briefing: string | null
  caption: string | null
  design_file_path: string | null
  posting_date: string | null
  due_date: string | null
  deadline: string | null
  status: 'todo' | 'in_progress' | 'done'
  created_at: string
  assigned_to_name: string | null
}

type TaskViewToggleProps = {
  initialTasks: TaskRow[]
  projectId: string
  clientId: string
}

function TaskList({ tasks }: { tasks: TaskRow[]; projectId: string; clientId: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
      List view loading for {tasks.length} task{tasks.length === 1 ? '' : 's'}.
    </div>
  )
}

function KanbanBoard({ tasks }: { tasks: TaskRow[]; projectId: string; clientId: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
      Kanban board loading for {tasks.length} task{tasks.length === 1 ? '' : 's'}.
    </div>
  )
}

function TaskCreateForm({ projectId }: { projectId: string; clientId: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
      Task creation form for project {projectId} will load here.
    </div>
  )
}

export function TaskViewToggle({ initialTasks, projectId, clientId }: TaskViewToggleProps) {
  const [view, setView] = useState<'list' | 'kanban'>('list')

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex w-full rounded-lg border border-border p-1 sm:w-auto">
          {(['list', 'kanban'] as const).map((nextView) => (
            <button
              key={nextView}
              type="button"
              onClick={() => setView(nextView)}
              className={cn(
                'flex-1 rounded-md px-4 py-2 text-sm font-medium transition sm:flex-none',
                view === nextView
                  ? 'bg-[#222222] text-white'
                  : 'border border-transparent text-foreground hover:bg-muted/40'
              )}
            >
              {nextView === 'list' ? 'List' : 'Kanban'}
            </button>
          ))}
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>Create Task</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create task</DialogTitle>
              <DialogDescription>Add a new content task to this project.</DialogDescription>
            </DialogHeader>
            <TaskCreateForm projectId={projectId} clientId={clientId} />
          </DialogContent>
        </Dialog>
      </div>

      {view === 'list' ? (
        <TaskList tasks={initialTasks} projectId={projectId} clientId={clientId} />
      ) : (
        <KanbanBoard tasks={initialTasks} projectId={projectId} clientId={clientId} />
      )}
    </div>
  )
}
