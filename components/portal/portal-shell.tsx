'use client'

import { useMemo, useState } from 'react'

import type { PortalTask } from '@/lib/portal/types'
import { cn } from '@/lib/utils'

type PortalShellProps = {
  tasks: PortalTask[]
}

const tabLabels = ['Kanban', 'Calendar', 'Timeline'] as const
type PortalTab = (typeof tabLabels)[number]

export function PortalShell({ tasks }: PortalShellProps) {
  const [activeTab, setActiveTab] = useState<PortalTab>('Kanban')

  const taskColumns = useMemo(
    () => ({
      todo: tasks.filter((task) => task.status === 'todo'),
      in_progress: tasks.filter((task) => task.status === 'in_progress'),
      done: tasks.filter((task) => task.status === 'done'),
    }),
    [tasks]
  )

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
        <div className="grid gap-4 md:grid-cols-3">
          <article className="space-y-3 rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">To do</h3>
            <ul className="space-y-2">
              {taskColumns.todo.map((task) => (
                <li key={task.id} className="rounded-md border border-border p-3 text-sm text-foreground">
                  {task.title}
                </li>
              ))}
            </ul>
          </article>

          <article className="space-y-3 rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">In progress</h3>
            <ul className="space-y-2">
              {taskColumns.in_progress.map((task) => (
                <li key={task.id} className="rounded-md border border-border p-3 text-sm text-foreground">
                  {task.title}
                </li>
              ))}
            </ul>
          </article>

          <article className="space-y-3 rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Done</h3>
            <ul className="space-y-2">
              {taskColumns.done.map((task) => (
                <li key={task.id} className="rounded-md border border-border p-3 text-sm text-foreground">
                  {task.title}
                </li>
              ))}
            </ul>
          </article>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
          {activeTab} view is part of the client portal read-only surface.
        </div>
      )}
    </section>
  )
}
