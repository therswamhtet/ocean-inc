import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PortalKanbanView } from '@/components/portal/kanban-view'
import type { PortalTask } from '@/lib/portal/types'

const tasks: PortalTask[] = [
  {
    id: 'task-1',
    projectId: 'project-1',
    title: 'Draft caption',
    caption: 'First pass',
    designFilePath: null,
    postingDate: '2099-04-12',
    status: 'todo',
  },
  {
    id: 'task-2',
    projectId: 'project-1',
    title: 'Polish visual',
    caption: null,
    designFilePath: null,
    postingDate: '2000-04-01',
    status: 'in_progress',
  },
  {
    id: 'task-3',
    projectId: 'project-1',
    title: 'Publish post',
    caption: null,
    designFilePath: null,
    postingDate: '2000-04-03',
    status: 'done',
  },
]

describe('PortalKanbanView', () => {
  it('renders the three locked columns', () => {
    render(<PortalKanbanView tasks={tasks} />)

    expect(screen.getByRole('heading', { name: 'To Do' })).toBeDefined()
    expect(screen.getByRole('heading', { name: 'In Progress' })).toBeDefined()
    expect(screen.getByRole('heading', { name: 'Done' })).toBeDefined()
    expect(screen.queryByRole('heading', { name: 'Overdue' })).toBeNull()
  })

  it('keeps overdue tasks in their status column while showing overdue visual dot', () => {
    render(<PortalKanbanView tasks={tasks} />)

    const inProgressColumn = screen.getByRole('region', { name: 'In Progress' })
    expect(within(inProgressColumn).getByText('Polish visual')).toBeDefined()

    const overdueDot = within(inProgressColumn).getByLabelText('Overdue')
    expect(overdueDot.className).toContain('animate-pulse-status')
  })
})
