import { createServiceRoleClient } from '@/lib/supabase/server'
import { withApiAuth } from '@/lib/api/middleware'
import { errors, apiSuccess } from '@/lib/api/errors'
import type { PortalData, PortalClient, PortalProject, PortalTask } from '@/lib/portal/types'

type ClientRow = {
  id: string
  name: string
  slug: string
  color: string
  is_active: boolean
  description: string | null
}

type TaskRow = {
  id: string
  project_id: string
  title: string
  caption: string | null
  design_file_path: string | null
  posting_date: string | null
  posting_time: string | null
  status: 'todo' | 'in_progress' | 'done'
}

// GET /api/v1/portal/:slug
export const GET = withApiAuth(async (_request, _context, routeContext) => {
  const { slug } = await routeContext.params
  const normalizedSlug = slug.trim()

  if (!normalizedSlug) {
    return errors.validationError('Slug is required')
  }

  const supabase = createServiceRoleClient()

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, name, slug, color, description, is_active')
    .eq('slug', normalizedSlug)
    .eq('is_active', true)
    .maybeSingle<ClientRow>()

  if (clientError || !client) {
    return errors.notFound('Client portal')
  }

  const portalClient: PortalClient = {
    id: client.id,
    name: client.name,
    slug: client.slug,
    color: client.color,
    description: client.description,
  }

  const { data: projects, error: projectError } = await supabase
    .from('projects')
    .select('id, client_id, name, month, year, status')
    .eq('client_id', client.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (projectError) {
    return errors.internalError(projectError.message)
  }

  if (!projects || projects.length === 0) {
    const data: PortalData = {
      client: portalClient,
      activeProjects: [],
      tasks: [],
    }
    return apiSuccess(data)
  }

  const portalProjects: PortalProject[] = projects.map((project) => ({
    id: project.id,
    clientId: project.client_id,
    name: project.name,
    month: project.month,
    year: project.year,
    status: project.status,
  }))

  const projectIds = projects.map((p) => p.id)

  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('id, project_id, title, caption, design_file_path, posting_date, posting_time, status')
    .in('project_id', projectIds)
    .order('posting_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })
    .returns<TaskRow[]>()

  if (tasksError) {
    return errors.internalError(tasksError.message)
  }

  const portalTasks: PortalTask[] = (tasks ?? []).map((task) => ({
    id: task.id,
    projectId: task.project_id,
    title: task.title,
    caption: task.caption,
    designFilePath: task.design_file_path,
    postingDate: task.posting_date,
    postingTime: task.posting_time,
    status: task.status,
  }))

  const data: PortalData = {
    client: portalClient,
    activeProjects: portalProjects,
    tasks: portalTasks,
  }

  return apiSuccess(data)
}, 'read:portal')
