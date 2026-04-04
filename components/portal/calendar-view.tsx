'use client'

import { useMemo, useState } from 'react'
import { format, isSameMonth } from 'date-fns'

import { StatusDot } from '@/components/ui/status-dot'
import { buildMonthGrid, buildWeekGrid, groupTasksByPostingDate } from '@/lib/portal/calendar-utils'
import type { PortalTask } from '@/lib/portal/types'
import { cn } from '@/lib/utils'

type CalendarMode = 'month' | 'week'

type PortalCalendarViewProps = {
  tasks: PortalTask[]
}

const weekDayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function PortalCalendarView({ tasks }: PortalCalendarViewProps) {
  const [mode, setMode] = useState<CalendarMode>('month')
  const [anchorDate, setAnchorDate] = useState(new Date())

  const groupedTasks = useMemo(() => groupTasksByPostingDate(tasks), [tasks])
  const monthGrid = useMemo(() => buildMonthGrid(anchorDate), [anchorDate])
  const weekGrid = useMemo(() => buildWeekGrid(anchorDate), [anchorDate])

  const hasTasks = tasks.length > 0

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-foreground">{format(anchorDate, 'MMMM yyyy')}</p>

        <div className="inline-flex w-full rounded-lg border border-border p-1 sm:w-auto">
          {(['month', 'week'] as const).map((nextMode) => (
            <button
              key={nextMode}
              type="button"
              onClick={() => setMode(nextMode)}
              className={cn(
                'flex-1 rounded-md px-4 py-2 text-sm font-medium transition sm:flex-none',
                mode === nextMode
                  ? 'bg-[#222222] text-white'
                  : 'border border-transparent text-foreground hover:bg-muted/40'
              )}
            >
              {nextMode === 'month' ? 'Month' : 'Week'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {weekDayLabels.map((label) => (
          <p key={label}>{label}</p>
        ))}
      </div>

      {mode === 'month' ? (
        <div className="space-y-2">
          {monthGrid.map((week, weekIndex) => (
            <div key={`month-week-${weekIndex}`} className="grid grid-cols-7 gap-2">
              {week.map((day) => {
                const key = format(day, 'yyyy-MM-dd')
                const dayTasks = groupedTasks[key] ?? []

                return (
                  <article
                    key={key}
                    className={cn(
                      'min-h-28 rounded-sm border border-border p-2',
                      isSameMonth(day, anchorDate) ? 'bg-background' : 'bg-muted/30'
                    )}
                  >
                    <p className="mb-2 text-xs text-muted-foreground">{format(day, 'd')}</p>

                    <div className="space-y-1">
                      {dayTasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-1.5 rounded-sm border border-border px-1.5 py-1">
                          <StatusDot status={task.status} />
                          <p className="truncate text-xs text-foreground">{task.title}</p>
                        </div>
                      ))}
                    </div>
                  </article>
                )
              })}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {weekGrid.map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const dayTasks = groupedTasks[key] ?? []

            return (
              <article key={key} className="min-h-40 rounded-sm border border-border p-2">
                <p className="mb-2 text-xs text-muted-foreground">
                  {format(day, 'EEE')} {format(day, 'd')}
                </p>

                <div className="space-y-1">
                  {dayTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-1.5 rounded-sm border border-border px-1.5 py-1">
                      <StatusDot status={task.status} />
                      <p className="truncate text-xs text-foreground">{task.title}</p>
                    </div>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      )}

      {!hasTasks ? <p className="text-sm text-muted-foreground">No tasks with posting dates are available yet.</p> : null}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setAnchorDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
          className="rounded-sm border border-border px-3 py-2 text-sm text-foreground hover:bg-muted/30"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => setAnchorDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
          className="rounded-sm border border-border px-3 py-2 text-sm text-foreground hover:bg-muted/30"
        >
          Next
        </button>
      </div>
    </section>
  )
}
