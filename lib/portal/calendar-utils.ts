import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isValid,
  startOfMonth,
  startOfWeek,
} from 'date-fns'

import type { PortalTask } from '@/lib/portal/types'

function normalizeDate(input: Date) {
  const parsed = new Date(input)
  if (!isValid(parsed)) {
    return new Date()
  }

  return parsed
}

export function buildWeekGrid(anchorDate: Date) {
  const safeAnchor = normalizeDate(anchorDate)
  const weekStart = startOfWeek(safeAnchor)

  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
}

export function buildMonthGrid(anchorDate: Date) {
  const safeAnchor = normalizeDate(anchorDate)
  const monthStart = startOfMonth(safeAnchor)
  const monthEnd = endOfMonth(safeAnchor)

  const gridStart = startOfWeek(monthStart)
  const gridEnd = endOfWeek(monthEnd)
  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const weeks: Date[][] = []
  for (let index = 0; index < allDays.length; index += 7) {
    weeks.push(allDays.slice(index, index + 7))
  }

  return weeks
}

export function groupTasksByPostingDate(tasks: PortalTask[]) {
  return tasks.reduce<Record<string, PortalTask[]>>((acc, task) => {
    if (!task.postingDate) {
      return acc
    }

    const parsed = new Date(task.postingDate)
    if (!isValid(parsed)) {
      return acc
    }

    const key = format(parsed, 'yyyy-MM-dd')
    if (!acc[key]) {
      acc[key] = []
    }

    acc[key].push(task)
    return acc
  }, {})
}
