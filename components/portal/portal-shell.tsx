'use client'

import { useState } from 'react'

import { PortalKanbanView } from '@/components/portal/kanban-view'
import type { PortalTask } from '@/lib/portal/types'
import { cn } from '@/lib/utils'

type PortalShellProps = {
  tasks: PortalTask[]
}

const tabLabels = ['Kanban', 'Calendar', 'Timeline'] as const
type PortalTab = (typeof tabLabels)[number]

export function PortalShell({ tasks }: PortalShellProps) {
  const [activeTab, setActiveTab] = useState<PortalTab>('Kanban')

  return (
    <section className="space-y-4">
      <div className="inline-flex w-full rounded-lg border border-border p-1 sm:w-auto">
        {tabLabels.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 rounded-md px-4 py-2 text-sm font-medium transition sm:flex-none',
              activeTab === tab
                ? 'bg-[#222222] text-white'
                : 'border border-transparent text-foreground hover:bg-muted/40'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Kanban' ? (
        <PortalKanbanView tasks={tasks} />
      ) : (
        <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
          {activeTab} view is part of the client portal read-only surface.
        </div>
      )}
    </section>
  )
}
