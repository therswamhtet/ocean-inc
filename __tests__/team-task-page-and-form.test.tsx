import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const getUser = vi.fn()
const single = vi.fn()
const from = vi.fn(() => ({
  select: vi.fn(() => ({ single })),
}))
const notFound = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND')
})

vi.mock('next/navigation', () => ({
  notFound,
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser },
    from,
  })),
}))

vi.mock('@/app/team/tasks/actions', () => ({
  updateTeamTaskContentAction: vi.fn(async () => ({ success: true })),
  updateTeamTaskFilePathAction: vi.fn(async () => ({ success: true })),
}))

describe('team task page and form', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    getUser.mockResolvedValue({
      data: {
        user: {
          id: 'member-1',
          app_metadata: { role: 'team_member' },
        },
      },
    })
  })

  it('fetches an assigned task by id and exposes project/client context', async () => {
    single.mockResolvedValue({
      data: {
        id: 'task-1',
        title: 'Launch asset',
        briefing: 'See https://example.com',
        caption: 'Draft',
        posting_date: '2026-04-10',
        due_date: '2026-04-09',
        deadline: '2026-04-12',
        status: 'todo',
        design_file_path: null,
        projects: {
          id: 'project-1',
          name: 'April Campaign',
          clients: { id: 'client-1', name: 'Ocean Inc' },
        },
      },
      error: null,
    })

    const module = await import('@/app/team/tasks/[taskId]/page')
    const view = await module.default({ params: Promise.resolve({ taskId: 'task-1' }) })
    const html = JSON.stringify(view)

    expect(html).toContain('April Campaign')
    expect(html).toContain('Ocean Inc')
  })

  it('resolves an inaccessible task to notFound', async () => {
    single.mockResolvedValue({ data: null, error: { message: 'Not found' } })

    const module = await import('@/app/team/tasks/[taskId]/page')

    await expect(module.default({ params: Promise.resolve({ taskId: 'task-404' }) })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })

  it('renders read-only context and copy/download affordances', async () => {
    const { TaskDetailForm } = await import('@/app/team/tasks/[taskId]/task-detail-form')

    render(
      <TaskDetailForm
        task={{
          id: 'task-1',
          title: 'Launch asset',
          briefing: 'Reference https://example.com',
          caption: 'Caption draft',
          postingDate: '2026-04-10',
          dueDate: '2026-04-09',
          deadline: '2026-04-12',
          status: 'in_progress',
          designFilePath: 'project-1/task-1/design.png',
          projectName: 'April Campaign',
          clientName: 'Ocean Inc',
        }}
      />
    )

    expect(screen.getByText('Launch asset')).toBeDefined()
    expect(screen.getByText('Briefing')).toBeDefined()
    expect(screen.getByRole('button', { name: /copy/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /design.png/i })).toBeDefined()
  })
})
