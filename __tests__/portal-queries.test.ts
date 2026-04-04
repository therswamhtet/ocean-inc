import { beforeEach, describe, expect, it, vi } from 'vitest'

const createClient = vi.fn()

const clientEq = vi.fn()
const clientMaybeSingle = vi.fn()

const projectEqStatus = vi.fn()
const projectEqClient = vi.fn(() => ({ eq: projectEqStatus }))
const projectMaybeSingle = vi.fn()

const tasksEq = vi.fn()
const tasksOrderCreated = vi.fn()
const tasksOrderPosting = vi.fn(() => ({ order: tasksOrderCreated }))
const tasksReturns = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient,
}))

describe('getPortalDataBySlug', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    clientEq.mockReturnValue({ maybeSingle: clientMaybeSingle })

    projectEqStatus.mockReturnValue({ maybeSingle: projectMaybeSingle })

    tasksOrderCreated.mockReturnValue({ returns: tasksReturns })
    tasksEq.mockReturnValue({ order: tasksOrderPosting })

    createClient.mockResolvedValue({
      from: (table: string) => {
        if (table === 'clients') {
          return {
            select: () => ({ eq: clientEq }),
          }
        }

        if (table === 'projects') {
          return {
            select: () => ({ eq: projectEqClient }),
          }
        }

        return {
          select: () => ({ eq: tasksEq }),
        }
      },
    })
  })

  it('returns null for an unknown slug without throwing', async () => {
    clientMaybeSingle.mockResolvedValue({ data: null, error: null })

    const { getPortalDataBySlug } = await import('@/lib/portal/queries')

    await expect(getPortalDataBySlug('missing-slug')).resolves.toBeNull()
    expect(projectEqClient).not.toHaveBeenCalled()
    expect(tasksEq).not.toHaveBeenCalled()
  })

  it('returns client data with active project and tasks for valid slug', async () => {
    clientMaybeSingle.mockResolvedValue({
      data: { id: 'client-1', name: 'Ocean Inc', slug: 'ocean-1234' },
      error: null,
    })

    projectMaybeSingle.mockResolvedValue({
      data: {
        id: 'project-1',
        client_id: 'client-1',
        name: 'April Campaign',
        month: 4,
        year: 2026,
        status: 'active',
      },
      error: null,
    })

    tasksReturns.mockResolvedValue({
      data: [
        {
          id: 'task-1',
          project_id: 'project-1',
          title: 'Launch reel',
          caption: 'Draft caption',
          design_file_path: 'project-1/task-1/reel.png',
          posting_date: '2026-04-15',
          status: 'todo',
        },
      ],
      error: null,
    })

    const { getPortalDataBySlug } = await import('@/lib/portal/queries')
    const result = await getPortalDataBySlug('ocean-1234')

    expect(projectEqStatus).toHaveBeenCalledWith('status', 'active')
    expect(result).toEqual({
      client: {
        id: 'client-1',
        name: 'Ocean Inc',
        slug: 'ocean-1234',
      },
      activeProject: {
        id: 'project-1',
        clientId: 'client-1',
        name: 'April Campaign',
        month: 4,
        year: 2026,
        status: 'active',
      },
      tasks: [
        {
          id: 'task-1',
          projectId: 'project-1',
          title: 'Launch reel',
          caption: 'Draft caption',
          designFilePath: 'project-1/task-1/reel.png',
          postingDate: '2026-04-15',
          status: 'todo',
        },
      ],
    })
  })
})
