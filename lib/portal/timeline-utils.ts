import { differenceInCalendarDays, endOfMonth, format, isValid, startOfMonth } from 'date-fns'

import type { PortalTask } from '@/lib/portal/types'

export function groupTasksByMonth(tasks: PortalTask[]) {
  const grouped = tasks.reduce<Record<string, PortalTask[]>>((acc, task) => {
    if (!task.postingDate) {
      return acc
    }

    const parsed = new Date(task.postingDate)
    if (!isValid(parsed)) {
      return acc
    }

    const key = format(parsed, 'yyyy-MM')
    if (!acc[key]) {
      acc[key] = []
    }

    acc[key].push(task)
    return acc
  }, {})

  return Object.fromEntries(
    Object.entries(grouped).sort(([left], [right]) => (left > right ? 1 : left < right ? -1 : 0))
  )
}

export function calculateTimelineOffset(postingDate: string, monthAnchor: Date) {
  const posting = new Date(postingDate)
  const monthStart = startOfMonth(monthAnchor)
  const monthEnd = endOfMonth(monthAnchor)

  if (!isValid(posting)) {
    return 0
  }

  const totalDays = differenceInCalendarDays(monthEnd, monthStart)
  if (totalDays <= 0) {
    return 0
  }

  const dayIndex = differenceInCalendarDays(posting, monthStart)
  const clamped = Math.min(Math.max(dayIndex, 0), totalDays)
  return (clamped / totalDays) * 100
}
