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

// ── Categorise tasks and assign colours (matches the reference design) ──
function categoriseTask(task: PortalTask): number {
  const title = task.title.toLowerCase()
  if (/standup|stand-up|stand ?up|sync /.test(title)) return 0
  if (/lunch|dinner|coffee|break|half marath/.test(title)) return 1
  if (/one.?on.?one|1on1|1:1/.test(title)) return 2
  if (/all.?hands|demo|meeting|catch ?up/.test(title)) return 3
  if (/plann|strateg|roadmap/.test(title)) return 4
  if (/design|content |creative/.test(title)) return 5
  if (/deep work|writing|coding/.test(title)) return 6
  if (/inspection|engagment|client/.test(title)) return 7
  if (/review|audit|quarterly/.test(title)) return 8
  let hash = 0
  for (let i = 0; i < task.title.length; i++) hash = (hash + task.title.charCodeAt(i) * 31) % 10
  return hash
}

function getCategoryColour(category: number) {
  const colours = [
    { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200/80' },
    { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200/80' },
    { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200/80' },
    { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200/80' },
    { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200/80' },
    { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200/80' },
    { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/80' },
    { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/80' },
    { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200/80' },
    { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200/80' },
  ]
  return colours[category % colours.length]
}

// ── Pill shown on day cell ──
function TaskPill({
  task,
  onClick,
}: {
  task: PortalTask
  onClick: () => void
}) {
  const cat = categoriseTask(task)
  const style = getCategoryColour(cat)

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
        'relative cursor-pointer rounded-lg border p-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isToday
          ? 'border-black/30 bg-[#222222]/[0.04]'
          : isCurrentMonth
            ? 'border-border bg-white hover:bg-muted/40'
            : 'border-border/50 bg-muted/20 hover:bg-muted/30'
      )}
    >
      {/* Day number */}
      <p
        className={cn(
          'mb-1.5 text-xs font-semibold',
          isToday
            ? 'flex h-6 w-6 items-center justify-center rounded-full bg-[#222222] text-white'
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
    <section className="space-y-4">
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
                  ? 'bg-[#222222] text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              )}
            >
              {nextMode === 'month' ? 'Month' : 'Week'}
            </button>
          ))}
        </div>
      </div>

      {/* Weekday labels */}
      <div className="overflow-x-auto">
        <div className="min-w-[560px] grid grid-cols-7 gap-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {weekDayLabels.map((label) => (
            <p key={label}>{label}</p>
          ))}
        </div>
      </div>

      {/* Month grid */}
      {mode === 'month' && (
        <div className="overflow-x-auto">
          <div className="min-w-[560px] space-y-2">
            {monthGrid.map((week, weekIndex) => (
              <div key={`month-week-${weekIndex}`} className="grid grid-cols-7 gap-2">
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
        </div>
      )}

      {/* Week strip */}
      {mode === 'week' && (
        <div className="overflow-x-auto">
          <div className="min-w-[560px] grid grid-cols-7 gap-2">
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
        </div>
      )}

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
          className="min-h-[44px] rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted/30"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={goToNext}
          className="min-h-[44px] rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted/30"
        >
          Next
        </button>
      </div>
    </section>
  )
}
