'use client'

import { useState } from 'react'

import { PortalCalendarView } from '@/components/portal/calendar-view'
import { PortalKanbanView } from '@/components/portal/kanban-view'
import { PortalTaskDetailDialog } from '@/components/portal/task-detail-dialog'
import type { PortalTask } from '@/lib/portal/types'
import { cn } from '@/lib/utils'

type PortalShellProps = {
  tasks: PortalTask[]
}

const tabLabels = ['Kanban', 'Calendar'] as const
type PortalTab = (typeof tabLabels)[number]

export function PortalShell({ tasks }: PortalShellProps) {
  const [activeTab, setActiveTab] = useState<PortalTab>('Kanban')
  const [selectedTask, setSelectedTask] = useState<PortalTask | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  function handleTaskSelect(task: PortalTask) {
    setSelectedTask(task)
    setIsDialogOpen(true)
  }

  function handleDialogOpenChange(open: boolean) {
    setIsDialogOpen(open)

    if (!open) {
      setSelectedTask(null)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex w-full gap-2 sm:inline-flex sm:w-auto" role="tablist">
        {tabLabels.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 min-h-[44px] rounded-md px-4 py-2 text-sm font-medium transition sm:flex-none',
              activeTab === tab
                ? 'bg-[#b45309] text-white'
                : 'border border-transparent text-foreground hover:bg-muted/40'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Kanban' ? (
        <PortalKanbanView tasks={tasks} onTaskSelect={handleTaskSelect} />
      ) : (
        <PortalCalendarView tasks={tasks} onTaskSelect={handleTaskSelect} />
      )}

      <PortalTaskDetailDialog open={isDialogOpen} onOpenChange={handleDialogOpenChange} task={selectedTask} />
    </section>
  )
}
