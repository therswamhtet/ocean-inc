'use client'

import * as React from 'react'
import { format, startOfMonth, endOfMonth, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth } from 'date-fns'

import { RichCalendar, type RichCalendarDayInfo, type RichCalendarDayEvent } from '@/components/rich-calendar'

type TaskForCalendar = {
  id: string
  project_id: string | null
  title: string
  posting_date: string | null
  status: string
  projects: { id: string; name: string; client_id: string } | null
}

// ── Categorise tasks for colour assignment ─────────────────────
function adminCategoriseTask(task: TaskForCalendar): number {
  const title = task.title.toLowerCase()
  if (/standup|stand-up|sync /.test(title)) return 0
  if (/lunch|dinner|coffee|break/.test(title)) return 1
  if (/one.?on.?one|1on1|1:1/.test(title)) return 2
  if (/all.?hands|demo|meeting|catch ?up/.test(title)) return 3
  if (/plann|strateg|roadmap/.test(title)) return 4
  if (/design|content |creative/.test(title)) return 5
  if (/deep work|writing|coding/.test(title)) return 6
  if (/inspection|engagment|client/.test(title)) return 7
  if (/review|audit|quarterly/.test(title)) return 8
  const hash = task.title.split('').reduce((h, c) => (h + c.charCodeAt(0) * 31) % 10, 0)
  return hash
}

function mapTaskToEvent(task: TaskForCalendar): RichCalendarDayEvent {
  return {
    id: task.id,
    title: task.title,
    subtitle: task.projects?.name ?? '',
    color: adminCategoriseTask(task),
  }
}

type AdminCalendarProps = {
  tasks: TaskForCalendar[]
  currentMonth: Date
}

export function AdminCalendar({ tasks, currentMonth }: AdminCalendarProps) {
  const [anchorDate, setAnchorDate] = React.useState(currentMonth)
  const [expandedDays, setExpandedDays] = React.useState<Set<string>>(new Set())

  const monthStart = startOfMonth(anchorDate)

  // Build day info grid
  const monthEnd = endOfMonth(anchorDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd })

  // Group tasks by date
  const tasksByDate = React.useMemo(() => {
    const acc: Record<string, TaskForCalendar[]> = {}
    for (const t of (tasks ?? [])) {
      if (!t.posting_date) continue
      if (!acc[t.posting_date]) acc[t.posting_date] = []
      acc[t.posting_date].push(t)
    }
    return acc
  }, [tasks])

  const daysGrid = allDays.reduce<RichCalendarDayInfo[][]>((weeks, day, i) => {
    const key = format(day, 'yyyy-MM-dd')
    const dayEvents = (tasksByDate[key] ?? []).map(mapTaskToEvent)

    const dayInfo: RichCalendarDayInfo = {
      date: day,
      isCurrentMonth: isSameMonth(day, anchorDate),
      isToday: isSameDay(day, new Date()),
      events: dayEvents,
    }

    const weekIndex = Math.floor(i / 7)
    if (!weeks[weekIndex]) weeks[weekIndex] = []
    weeks[weekIndex].push(dayInfo)
    return weeks
  }, [])

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

  function handleExpand(dayKey: string, expanded: boolean) {
    setExpandedDays((prev) => {
      const next = new Set(prev)
      if (expanded) next.add(dayKey)
      else next.delete(dayKey)
      return next
    })
  }

  return (
    <RichCalendar
      days={daysGrid}
      heading={format(anchorDate, 'MMMM yyyy')}
      onNavigatePrev={goToPrev}
      onNavigateNext={goToNext}
      expandable
      onExpandDay={handleExpand}
      expandedDays={expandedDays}
      maxEvents={3}
      className="mx-auto max-w-full"
    />
  )
}
