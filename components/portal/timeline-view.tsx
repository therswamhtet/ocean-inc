import { format } from 'date-fns'

import { StatusDot } from '@/components/ui/status-dot'
import { calculateTimelineOffset, groupTasksByMonth } from '@/lib/portal/timeline-utils'
import type { PortalTask } from '@/lib/portal/types'

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
    return <p className="text-sm text-muted-foreground">No tasks with posting dates are available yet.</p>
  }

  return (
    <section className="space-y-4">
      {monthEntries.map(([monthKey, monthTasks]) => {
        const monthAnchor = getMonthAnchor(monthKey)

        return (
          <article key={monthKey} className="grid gap-3 md:grid-cols-[160px_minmax(0,1fr)] md:items-start">
            <div className="rounded-sm border border-border bg-background px-3 py-2">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{format(monthAnchor, 'MMMM yyyy')}</p>
              <p className="text-xs text-muted-foreground">{monthTasks.length} tasks</p>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[640px] space-y-2 rounded-sm border border-border bg-muted/20 p-3">
                {monthTasks.map((task) => {
                  const postingDate = getPostingDate(task.postingDate)

                  if (!postingDate) {
                    return null
                  }

                  const leftOffset = calculateTimelineOffset(format(postingDate, 'yyyy-MM-dd'), monthAnchor)
                  const transform = leftOffset > 85 ? 'translate(-100%, -50%)' : 'translate(0, -50%)'

                  return (
                    <div key={task.id} className="relative h-12 rounded-sm border border-border bg-background">
                      <p className="absolute left-2 top-1 text-[11px] text-muted-foreground">{format(postingDate, 'MMM d')}</p>

                      <button
                        type="button"
                        onClick={() => onTaskSelect(task)}
                        className="absolute top-1/2 flex max-w-[78%] items-center gap-2 rounded-sm border border-border bg-background px-2 py-1 text-left hover:bg-muted/20"
                        style={{ left: `${leftOffset}%`, transform }}
                      >
                        <StatusDot status={task.status} />
                        <p className="truncate text-xs font-medium text-foreground">{task.title}</p>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </article>
        )
      })}
    </section>
  )
}
