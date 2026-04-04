import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { PortalTaskDetailDialog } from '@/components/portal/task-detail-dialog'
import type { PortalTask } from '@/lib/portal/types'

const task: PortalTask = {
  id: 'task-1',
  projectId: 'project-1',
  title: 'Publish spring launch',
  caption: 'Final launch caption copy',
  designFilePath: 'project-1/task-1/launch.png',
  postingDate: '2026-04-18',
  status: 'in_progress',
}

describe('PortalTaskDetailDialog', () => {
  it('renders required read-only task detail fields and controls', () => {
    render(<PortalTaskDetailDialog open onOpenChange={vi.fn()} task={task} />)

    expect(screen.getByRole('heading', { name: task.title })).toBeDefined()
    expect(screen.getByText(task.caption ?? '')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Copy caption' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'launch.png' })).toBeDefined()
    expect(screen.getByText('2026-04-18')).toBeDefined()
    expect(screen.getByLabelText('In Progress')).toBeDefined()

    expect(screen.queryByRole('textbox')).toBeNull()
    expect(screen.queryByRole('button', { name: /save/i })).toBeNull()
  })
})
