'use client'

import * as React from 'react'
import { format, startOfMonth, endOfMonth, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth } from 'date-fns'

import { RichCalendar, type RichCalendarDayInfo, type RichCalendarDayEvent } from '@/components/rich-calendar'
import type { PortalTask } from '@/lib/portal/types'

// ── Categorise tasks for colour assignment ─────────────────────
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

function mapTaskToEvent(task: PortalTask): RichCalendarDayEvent {
  return {
    id: task.id,
    title: task.title,
    color: categoriseTask(task),
  }
}

type PortalRichCalendarViewProps = {
  tasks: PortalTask[]
  onTaskSelect: (task: PortalTask) => void
}

export function PortalRichCalendarView({ tasks, onTaskSelect }: PortalRichCalendarViewProps) {
  const [anchorDate, setAnchorDate] = React.useState(new Date())
  const [expandedDays, setExpandedDays] = React.useState<Set<string>>(new Set())

  // Group tasks by date
  const tasksByDate = React.useMemo(() => {
    const acc: Record<string, PortalTask[]> = {}
    for (const t of tasks) {
      if (!t.postingDate) continue
      const key = format(new Date(t.postingDate), 'yyyy-MM-dd')
      if (!acc[key]) acc[key] = []
      acc[key].push(t)
    }
    return acc
  }, [tasks])

  // Build enriched grid (month view only)
  function buildEnrichedGrid(anchor: Date, td: Record<string, PortalTask[]>): RichCalendarDayInfo[][] {
    const rangeStart = startOfMonth(anchor)
    const rangeEnd = endOfMonth(anchor)

    const gridStart = startOfWeek(rangeStart, { weekStartsOn: 0 })
    const gridEnd = endOfWeek(rangeEnd, { weekStartsOn: 0 })
    const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd })

    const weeks: RichCalendarDayInfo[][] = []
    for (let i = 0; i < allDays.length; i += 7) {
      const week: RichCalendarDayInfo[] = []
      for (const day of allDays.slice(i, i + 7)) {
        const key = format(day, 'yyyy-MM-dd')
        const dayEvents = (td[key] ?? []).map(mapTaskToEvent)
        week.push({
          date: day,
          isCurrentMonth: isSameMonth(day, anchor),
          isToday: isSameDay(day, new Date()),
          events: dayEvents,
        })
      }
      weeks.push(week)
    }
    return weeks
  }

  const enrichedGrid = React.useMemo(
    () => buildEnrichedGrid(anchorDate, tasksByDate),
    [anchorDate, tasksByDate]
  )

  // Build task lookup for clicking
  const taskMap = React.useMemo(() => {
    const map = new Map<string, PortalTask>()
    for (const t of tasks) {
      map.set(t.id, t)
    }
    return map
  }, [tasks])

  function handleEventClick(ev: RichCalendarDayEvent) {
    const task = taskMap.get(ev.id)
    if (task) onTaskSelect(task)
  }

  function handleExpand(dayKey: string, expanded: boolean) {
    setExpandedDays((prev) => {
      const next = new Set(prev)
      if (expanded) next.add(dayKey)
      else next.delete(dayKey)
      return next
    })
  }

  function goToPrev() {
    setAnchorDate((prev) => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() - 1)
      return d
    })
    setExpandedDays(new Set())
  }

  function goToNext() {
    setAnchorDate((prev) => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() + 1)
      return d
    })
    setExpandedDays(new Set())
  }

  return (
    <RichCalendar
      days={enrichedGrid}
      heading={format(anchorDate, 'MMMM yyyy')}
      onNavigatePrev={goToPrev}
      onNavigateNext={goToNext}
      onEventClick={handleEventClick}
      expandable
      onExpandDay={handleExpand}
      expandedDays={expandedDays}
      maxEvents={3}
    />
  )
}
