import { format } from 'date-fns'

import { LABELS } from '@/lib/labels'
import { groupTasksByMonth } from '@/lib/portal/timeline-utils'
import type { PortalTask } from '@/lib/portal/types'
import { cn } from '@/lib/utils'

const statusPill: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  todo: { label: 'To Do', dot: 'bg-[#999999]', bg: 'bg-[#999999]/10', text: 'text-[#666666]' },
  in_progress: { label: 'In Progress', dot: 'bg-[#D4A843]', bg: 'bg-[#D4A843]/10', text: 'text-[#D4A843]' },
  done: { label: 'Done', dot: 'bg-[#4A9E5C]', bg: 'bg-[#4A9E5C]/10', text: 'text-[#4A9E5C]' },
}

type PortalTimelineViewProps = {
  tasks: PortalTask[]
  onTaskSelect: (task: PortalTask) => void
}

function getMonthAnchor(monthKey: string) {
  const parsed = new Date(`${monthKey}-01`)

  if (Number.isNaN(parsed.getTime())) {
    return new Date()
  }

  return parsed
}

function getPostingDate(postingDate: string | null) {
  if (!postingDate) {
    return null
  }

  const parsed = new Date(postingDate)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed
}

export function PortalTimelineView({ tasks, onTaskSelect }: PortalTimelineViewProps) {
  const grouped = groupTasksByMonth(tasks)
  const monthEntries = Object.entries(grouped)

  if (monthEntries.length === 0) {
    return <p className="text-sm text-muted-foreground">{LABELS.emptyStates.noPortalTasks}</p>
  }

  return (
    <section className="space-y-4">
      {monthEntries.map(([monthKey, monthTasks]) => {
        const monthAnchor = getMonthAnchor(monthKey)

        return (
          <article key={monthKey}>
            <div className="mb-3 rounded-lg border border-border bg-surface px-3 py-2 inline-block">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{format(monthAnchor, 'MMMM yyyy')}</p>
              <p className="text-xs text-muted-foreground">{monthTasks.length} tasks</p>
            </div>

            <div className="space-y-2">
              {monthTasks.map((task) => {
                const postingDate = getPostingDate(task.postingDate)
                if (!postingDate) return null

                const s = statusPill[task.status] ?? statusPill.todo

                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => onTaskSelect(task)}
                    className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-left transition hover:bg-surface-raised active:scale-[0.99]"
                  >
                    <span className={cn('shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', s.bg, s.text)}>
                      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
                      {s.label}
                    </span>
                    <span className="min-w-0 truncate text-sm font-medium text-foreground">{task.title}</span>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">{format(postingDate, 'MMM d')}</span>
                  </button>
                )
              })}
            </div>
          </article>
        )
      })}
    </section>
  )
}
