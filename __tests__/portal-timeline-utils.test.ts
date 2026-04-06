import { describe, expect, it } from 'vitest'

import { calculateTimelineOffset, groupTasksByMonth } from '@/lib/portal/timeline-utils'
import type { PortalTask } from '@/lib/portal/types'

describe('portal timeline utils', () => {
  it('groups tasks by month key from posting date', () => {
    const tasks: PortalTask[] = [
      {
        id: 'task-1',
        projectId: 'project-1',
        title: 'April item',
        caption: null,
        designFilePath: null,
        postingDate: '2026-04-04',
        postingTime: null,
        status: 'todo',
      },
      {
        id: 'task-2',
        projectId: 'project-1',
        title: 'May item',
        caption: null,
        designFilePath: null,
        postingDate: '2026-05-03',
        postingTime: null,
        status: 'in_progress',
      },
      {
        id: 'task-3',
        projectId: 'project-1',
        title: 'No date',
        caption: null,
        designFilePath: null,
        postingDate: null,
        postingTime: null,
        status: 'done',
      },
    ]

    const grouped = groupTasksByMonth(tasks)

    expect(Object.keys(grouped)).toEqual(['2026-04', '2026-05'])
    expect(grouped['2026-04']).toHaveLength(1)
    expect(grouped['2026-05']).toHaveLength(1)
  })

  it('calculates deterministic offset percentages within a month lane', () => {
    const earlyMonth = calculateTimelineOffset('2026-04-01', new Date('2026-04-01'))
    const lateMonth = calculateTimelineOffset('2026-04-30', new Date('2026-04-01'))

    expect(earlyMonth).toBeGreaterThanOrEqual(0)
    expect(lateMonth).toBeLessThanOrEqual(100)
    expect(lateMonth).toBeGreaterThan(earlyMonth)
  })
})
