'use client'

import { useMemo, useState } from 'react'
import { format, isSameMonth, isSameDay } from 'date-fns'

import { buildMonthGrid, buildWeekGrid, groupTasksByPostingDate } from '@/lib/portal/calendar-utils'
import type { PortalTask } from '@/lib/portal/types'
import { cn } from '@/lib/utils'

type CalendarMode = 'month' | 'week'

type PortalCalendarViewProps = {
  tasks: PortalTask[]
  onTaskSelect: (task: PortalTask) => void
}

const weekDayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ── Status-based colours ────────────────────────────────────────
function getStatusColour(status: PortalTask['status']) {
  switch (status) {
    case 'in_progress':
      return { bg: 'bg-[#3B82F6]/10', text: 'text-[#3B82F6]', border: 'border-[#3B82F6]/20' }
    case 'done':
      return { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]', border: 'border-[#10B981]/20' }
    case 'todo':
    default:
      return { bg: 'bg-[#6B7280]/10', text: 'text-[#6B7280]', border: 'border-[#6B7280]/20' }
  }
}

// ── Pill shown on day cell ──
function TaskPill({
  task,
  onClick,
}: {
  task: PortalTask
  onClick: () => void
}) {
  const style = getStatusColour(task.status)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        'flex w-full min-w-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-left text-[11px] font-medium leading-tight transition',
        style.bg,
        style.border,
        style.text,
        'hover:opacity-80',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
      title={task.title}
    >
      <span className="truncate">{task.title}</span>
    </button>
  )
}

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ── Mobile day card ──
function MobileDayCard({
  day,
  tasks,
  isCurrentMonth,
  isToday,
  expanded,
  onExpand,
  onTaskSelect,
  maxVisible = 5,
}: {
  day: Date
  tasks: PortalTask[]
  isCurrentMonth: boolean
  isToday: boolean
  expanded: boolean
  onExpand: () => void
  onTaskSelect: (task: PortalTask) => void
  maxVisible?: number
}) {
  const visible = expanded ? tasks : tasks.slice(0, maxVisible)
  const overflow = !expanded && tasks.length > maxVisible ? tasks.length - maxVisible : 0

  return (
    <div
      onClick={tasks.length > 0 ? onExpand : undefined}
      className={cn(
        'rounded-xl border p-4 transition-colors',
        isToday
          ? 'border-foreground/25 bg-foreground/[0.03]'
          : isCurrentMonth
            ? 'border-border bg-surface'
            : 'border-border/40 bg-muted/[0.06]'
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-bold',
          isToday
            ? 'bg-foreground text-background'
            : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/40'
        )}>
          {format(day, 'd')}
        </span>
        <div className="min-w-0">
          <p className={cn(
            'text-sm font-semibold',
            isToday ? 'text-foreground' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/40'
          )}>
            {DAY_SHORT[day.getDay()]}
          </p>
        </div>
        {tasks.length > 0 && (
          <span className="ml-auto shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
            {tasks.length}
          </span>
        )}
      </div>

      {tasks.length > 0 ? (
        <div className="space-y-2">
          {visible.map((task) => {
            const style = getStatusColour(task.status)
            return (
              <button
                key={task.id}
                type="button"
                onClick={(e) => { e.stopPropagation(); onTaskSelect(task) }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg border bg-surface px-3 py-2.5 text-left transition active:scale-[0.99]',
                  style.bg, style.border, style.text
                )}
              >
                <span className="truncate text-sm font-medium">{task.title}</span>
              </button>
            )
          })}
          {overflow > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onExpand() }}
              className="w-full text-center text-sm font-medium text-muted-foreground py-2 rounded-lg border border-dashed border-border hover:bg-muted/[0.08] transition"
            >
              Show {overflow} more task{overflow > 1 ? 's' : ''}
            </button>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground/50 ml-12">No tasks</p>
      )}
    </div>
  )
}

// ── Day cell (uses <div> to allow nested <button> pills) ──
function MonthDayCell({
  day,
  tasks,
  isCurrentMonth,
  isToday,
  expanded,
  onExpand,
  onTaskSelect,
  maxVisible = 3,
}: {
  day: Date
  tasks: PortalTask[]
  isCurrentMonth: boolean
  isToday: boolean
  expanded: boolean
  onExpand: () => void
  onTaskSelect: (task: PortalTask) => void
  maxVisible?: number
}) {
  const visible = expanded ? tasks : tasks.slice(0, maxVisible)
  const overflowCount = tasks.length > maxVisible && !expanded ? tasks.length - maxVisible : 0

  return (
    <div
      id={`day-${format(day, 'yyyy-MM-dd')}`}
      onClick={onExpand}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onExpand()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${format(day, 'd')} – ${tasks.length} task(s)`}
      aria-expanded={expanded}
      className={cn(
        'relative cursor-pointer border p-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isToday
          ? 'border-foreground/20 bg-foreground/[0.04]'
          : isCurrentMonth
            ? 'border-border bg-surface hover:bg-surface-raised'
            : 'border-border/50 bg-surface-raised hover:bg-surface-raised'
      )}
    >
      {/* Day number */}
      <p
        className={cn(
          'mb-1.5 text-xs font-semibold',
          isToday
            ? 'flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background'
            : isCurrentMonth
              ? 'text-foreground'
              : 'text-muted-foreground'
        )}
      >
        {format(day, 'd')}
      </p>

      {/* Tasks container with overflow clip */}
      <div className="space-y-1 overflow-hidden">
        {visible.map((task) => (
          <TaskPill key={task.id} task={task} onClick={() => onTaskSelect(task)} />
        ))}

        {/* Expanded: collapse button */}
        {expanded && overflowCount <= 0 && (
          <button
            type="button"
            className="text-[11px] text-muted-foreground underline underline-offset-2 w-full text-left"
            onClick={(e) => {
              e.stopPropagation()
              onExpand()
            }}
          >
            Collapse
          </button>
        )}

        {/* Overflow indicator */}
        {!expanded && overflowCount > 0 && (
          <p className="text-[11px] text-muted-foreground">
            +{overflowCount} more…
          </p>
        )}
      </div>
    </div>
  )
}

// ── Main component ──
export function PortalCalendarView({ tasks, onTaskSelect }: PortalCalendarViewProps) {
  const [mode, setMode] = useState<CalendarMode>('month')
  const [anchorDate, setAnchorDate] = useState(new Date())
  const [expandedDate, setExpandedDate] = useState<string | null>(null)

  const groupedTasks = useMemo(() => groupTasksByPostingDate(tasks), [tasks])
  const monthGrid = useMemo(() => buildMonthGrid(anchorDate), [anchorDate])
  const weekGrid = useMemo(() => buildWeekGrid(anchorDate), [anchorDate])

  const hasTasks = tasks.length > 0

  function goToPrevious() {
    setAnchorDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
    setExpandedDate(null)
  }

  function goToNext() {
    setAnchorDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
    setExpandedDate(null)
  }

  return (
    <section className="space-y-4 bg-surface p-4 rounded-lg">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-foreground">{format(anchorDate, 'MMMM yyyy')}</p>

        <div className="inline-flex w-full rounded-lg border border-border p-1 sm:w-auto">
          {(['month', 'week'] as const).map((nextMode) => (
            <button
              key={nextMode}
              type="button"
              onClick={() => {
                setMode(nextMode)
                setExpandedDate(null)
              }}
              className={cn(
                'flex-1 min-h-[44px] rounded-md px-4 py-2 text-sm font-medium transition sm:flex-none',
                mode === nextMode
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-raised'
              )}
            >
              {nextMode === 'month' ? 'Month' : 'Week'}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: full grid (hidden on mobile) */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-7 gap-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {weekDayLabels.map((label) => (
            <p key={label}>{label}</p>
          ))}
        </div>

        {mode === 'month' && (
          <div className="mt-2 space-y-1">
            {monthGrid.map((week, weekIndex) => (
              <div key={`month-week-${weekIndex}`} className="grid grid-cols-7 gap-1">
                {week.map((day) => {
                  const key = format(day, 'yyyy-MM-dd')
                  const dayTasks = groupedTasks[key] ?? []
                  const isToday = isSameDay(day, new Date())

                  return (
                    <MonthDayCell
                      key={key}
                      day={day}
                      tasks={dayTasks}
                      isCurrentMonth={isSameMonth(day, anchorDate)}
                      isToday={isToday}
                      expanded={expandedDate === key}
                      onExpand={() =>
                        setExpandedDate(expandedDate === key ? null : key)
                      }
                      onTaskSelect={onTaskSelect}
                      maxVisible={3}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        )}

        {mode === 'week' && (
          <div className="mt-2 grid grid-cols-7 gap-1">
            {weekGrid.map((day) => {
              const key = format(day, 'yyyy-MM-dd')
              const dayTasks = groupedTasks[key] ?? []
              const isToday = isSameDay(day, new Date())

              return (
                <MonthDayCell
                  key={key}
                  day={day}
                  tasks={dayTasks}
                  isCurrentMonth
                  isToday={isToday}
                  expanded={expandedDate === key}
                  onExpand={() =>
                    setExpandedDate(expandedDate === key ? null : key)
                  }
                  onTaskSelect={onTaskSelect}
                  maxVisible={999}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Mobile: vertical card feed (visible on small screens only) */}
      <div className="block sm:hidden space-y-3">
        {mode === 'month' && monthGrid.flat()
          .filter((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const dayTasks = groupedTasks[key] ?? []
            return dayTasks.length > 0 || isSameDay(day, new Date())
          })
          .map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const dayTasks = groupedTasks[key] ?? []
            const isToday = isSameDay(day, new Date())

            return (
              <MobileDayCard
                key={key}
                day={day}
                tasks={dayTasks}
                isCurrentMonth={isSameMonth(day, anchorDate)}
                isToday={isToday}
                expanded={expandedDate === key}
                onExpand={() =>
                  setExpandedDate(expandedDate === key ? null : key)
                }
                onTaskSelect={onTaskSelect}
                maxVisible={5}
              />
            )
          })}
        {mode === 'week' && weekGrid
          .filter((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const dayTasks = groupedTasks[key] ?? []
            return dayTasks.length > 0 || isSameDay(day, new Date())
          })
          .map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const dayTasks = groupedTasks[key] ?? []
            const isToday = isSameDay(day, new Date())

            return (
              <MobileDayCard
                key={key}
                day={day}
                tasks={dayTasks}
                isCurrentMonth
                isToday={isToday}
                expanded={expandedDate === key}
                onExpand={() =>
                  setExpandedDate(expandedDate === key ? null : key)
                }
                onTaskSelect={onTaskSelect}
                maxVisible={999}
              />
            )
          })}
      </div>

      {/* Empty state */}
      {!hasTasks ? (
        <p className="text-sm text-muted-foreground">
          No tasks with posting dates are available yet.
        </p>
      ) : null}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goToPrevious}
          className="min-h-[44px] rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface-raised"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={goToNext}
          className="min-h-[44px] rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface-raised"
        >
          Next
        </button>
      </div>
    </section>
  )
}
