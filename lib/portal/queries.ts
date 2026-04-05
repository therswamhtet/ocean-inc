import { createClient } from '@/lib/supabase/server'
import type { PortalClient, PortalData, PortalProject, PortalTask, PortalTaskStatus } from '@/lib/portal/types'

type ClientRow = {
  id: string
  name: string
  slug: string
  color: string
}

type ProjectRow = {
  id: string
  client_id: string
  name: string
  month: number
  year: number
  status: 'active'
}

type TaskRow = {
  id: string
  project_id: string
  title: string
  caption: string | null
  design_file_path: string | null
  posting_date: string | null
  status: PortalTaskStatus
}

export async function getPortalDataBySlug(slug: string): Promise<PortalData | null> {
  const normalizedSlug = slug.trim()

  if (!normalizedSlug) {
    return null
  }

  const supabase = await createClient()

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, name, slug')
    .eq('slug', normalizedSlug)
    .maybeSingle<ClientRow>()

  if (clientError || !client) {
    return null
  }

  const portalClient: PortalClient = {
    id: client.id,
    name: client.name,
    slug: client.slug,
    color: client.color,
  }

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, client_id, name, month, year, status')
    .eq('client_id', client.id)
    .eq('status', 'active')
    .maybeSingle<ProjectRow>()

  if (projectError) {
    throw new Error(projectError.message)
  }

  if (!project) {
    return {
      client: portalClient,
      activeProject: null,
      tasks: [],
    }
  }

  const portalProject: PortalProject = {
    id: project.id,
    clientId: project.client_id,
    name: project.name,
    month: project.month,
    year: project.year,
    status: project.status,
  }

  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('id, project_id, title, caption, design_file_path, posting_date, status')
    .eq('project_id', project.id)
    .order('posting_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })
    .returns<TaskRow[]>()

  if (tasksError) {
    throw new Error(tasksError.message)
  }

  const portalTasks: PortalTask[] = (tasks ?? []).map((task) => ({
    id: task.id,
    projectId: task.project_id,
    title: task.title,
    caption: task.caption,
    designFilePath: task.design_file_path,
    postingDate: task.posting_date,
    status: task.status,
  }))

  return {
    client: portalClient,
    activeProject: portalProject,
    tasks: portalTasks,
  }
}
