import { beforeEach, describe, expect, it, vi } from 'vitest'

const getUser = vi.fn()
const revalidatePath = vi.fn()
const single = vi.fn()
const maybeSingle = vi.fn()
const updateEq = vi.fn()
const update = vi.fn(() => ({ eq: updateEq }))
const select = vi.fn(() => ({ single, maybeSingle }))
const from = vi.fn(() => ({ select, update }))

vi.mock('next/cache', () => ({
  revalidatePath,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser,
    },
    from,
  })),
}))

describe('team task actions', () => {
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

    single.mockResolvedValue({
      data: {
        id: 'task-1',
        project_id: 'project-1',
      },
      error: null,
    })

    maybeSingle.mockResolvedValue({
      data: {
        id: 'task-1',
        project_id: 'project-1',
      },
      error: null,
    })

    updateEq.mockResolvedValue({ error: null })
  })

  it('saves caption-only changes without changing file or status', async () => {
    const { updateTeamTaskContentAction } = await import('@/app/team/tasks/actions')

    const result = await updateTeamTaskContentAction('task-1', {
      caption: 'Updated caption',
      status: 'todo',
    })

    expect(result).toEqual({ success: true })
    expect(update).toHaveBeenCalledWith({ caption: 'Updated caption', status: 'todo' })
    expect(revalidatePath).toHaveBeenCalledWith('/team')
    expect(revalidatePath).toHaveBeenCalledWith('/team/tasks/task-1')
  })

  it('changes status independently from caption edits', async () => {
    const { updateTeamTaskContentAction } = await import('@/app/team/tasks/actions')

    await updateTeamTaskContentAction('task-1', {
      caption: 'Existing caption',
      status: 'done',
    })

    expect(update).toHaveBeenCalledWith({ caption: 'Existing caption', status: 'done' })
  })

  it('updates only the file path when uploading a replacement', async () => {
    const { updateTeamTaskFilePathAction } = await import('@/app/team/tasks/actions')

    const result = await updateTeamTaskFilePathAction('task-1', 'project-1/task-1/design.png')

    expect(result).toEqual({ success: true })
    expect(update).toHaveBeenCalledWith({ design_file_path: 'project-1/task-1/design.png' })
  })
})
