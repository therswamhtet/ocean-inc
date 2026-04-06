import { describe, expect, it } from 'vitest'

import { buildMonthGrid, buildWeekGrid, groupTasksByPostingDate } from '@/lib/portal/calendar-utils'
import type { PortalTask } from '@/lib/portal/types'

describe('portal calendar utils', () => {
  it('buildWeekGrid returns exactly 7 days', () => {
    const week = buildWeekGrid(new Date('2026-04-15'))

    expect(week).toHaveLength(7)
    expect(week[0]).toBeInstanceOf(Date)
    expect(week[6]).toBeInstanceOf(Date)
  })

  it('buildMonthGrid returns full week rows covering the month', () => {
    const grid = buildMonthGrid(new Date('2026-04-15'))

    expect(grid.length).toBeGreaterThan(3)
    expect(grid.length).toBeLessThan(7)
    expect(grid.every(Boolean)).toBe(true)
    expect(grid.every((week) => week.length === 7)).toBe(true)
  })

  it('groups tasks by posting_date while ignoring null dates', () => {
    const tasks: PortalTask[] = [
      {
        id: 'task-1',
        projectId: 'project-1',
        title: 'Publish reel',
        caption: null,
        designFilePath: null,
        postingDate: '2026-04-15',
        postingTime: null,
        status: 'todo',
      },
      {
        id: 'task-2',
        projectId: 'project-1',
        title: 'Publish carousel',
        caption: null,
        designFilePath: null,
        postingDate: '2026-04-15',
        postingTime: null,
        status: 'in_progress',
      },
      {
        id: 'task-3',
        projectId: 'project-1',
        title: 'No posting date',
        caption: null,
        designFilePath: null,
        postingDate: null,
        postingTime: null,
        status: 'done',
      },
    ]

    const grouped = groupTasksByPostingDate(tasks)

    expect(Object.keys(grouped)).toEqual(['2026-04-15'])
    expect(grouped['2026-04-15']).toHaveLength(2)
  })
})
