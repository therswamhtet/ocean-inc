'use client'

import { useState } from 'react'

import { LayoutGrid, List, FileText } from 'lucide-react'

import { KanbanBoard } from '@/components/admin/kanban-board'
import { TaskCreateForm } from '@/components/admin/task-create-form'
import { TaskList } from '@/components/admin/task-list'
import { LABELS } from '@/lib/labels'
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
  posting_time: string | null
  due_date: string | null
  deadline: string | null
  status: 'todo' | 'in_progress' | 'done'
  created_at: string
}

type TabId = 'board' | 'timeline' | 'files'

type TaskViewToggleProps = {
  initialTasks: TaskRow[]
  projectId: string
  clientId: string
}

const tabs: { id: TabId; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'board', label: 'Task Board', icon: LayoutGrid },
  { id: 'timeline', label: 'Timeline', icon: List },
  { id: 'files', label: 'Files', icon: FileText },
]

export function TaskViewToggle({ initialTasks, projectId, clientId }: TaskViewToggleProps) {
  const [activeTab, setActiveTab] = useState<TabId>('board')
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-4">
      {/* Tab navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex gap-0 border-b border-border" role="tablist">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'text-muted-foreground border-transparent hover:text-foreground hover:border-muted-foreground/50'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>

        {/* New task button — only show for Task Board */}
        {activeTab === 'board' && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>{LABELS.task.create}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create task</DialogTitle>
                <DialogDescription>Add a new content task to this project.</DialogDescription>
              </DialogHeader>
              <TaskCreateForm
                projectId={projectId}
                onSuccess={() => {
                  setOpen(false)
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tab content */}
      {activeTab === 'board' && <KanbanBoard tasks={initialTasks} projectId={projectId} />}
      {activeTab === 'timeline' && <TaskList tasks={initialTasks} projectId={projectId} />}
      {activeTab === 'files' && <FilesPlaceholder />}
    </div>
  )
}

function FilesPlaceholder() {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-border">
      <div className="text-center">
        <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">Files view coming soon</p>
        <p className="mt-1 text-xs text-muted-foreground/70">Manage design files and assets for this project</p>
      </div>
    </div>
  )
}
