import { createServiceRoleClient } from '@/lib/supabase/server'
import { withApiAuth, getPagination } from '@/lib/api/middleware'
import { errors, apiSuccess } from '@/lib/api/errors'
import { createTaskSchema } from '@/lib/api/validation'

// GET /api/v1/tasks
export const GET = withApiAuth(async (request) => {
  const { page, limit, offset } = getPagination(request)
  const url = new URL(request.url)
  const projectId = url.searchParams.get('project_id')
  const status = url.searchParams.get('status')

  const supabase = createServiceRoleClient()
  let query = supabase
    .from('tasks')
    .select(
      'id, project_id, title, briefing, caption, design_file_path, posting_date, posting_time, due_date, deadline, status, created_at, updated_at',
      { count: 'exact' }
    )
    .order('posting_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })

  if (projectId) {
    query = query.eq('project_id', projectId)
  }
  if (status) {
    query = query.eq('status', status)
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1)

  if (error) {
    return errors.internalError(error.message)
  }

  return apiSuccess(
    data ?? [],
    200,
    { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) }
  )
}, 'read:tasks')

// POST /api/v1/tasks
export const POST = withApiAuth(async (request) => {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errors.validationError('Invalid JSON body')
  }

  const parsed = createTaskSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validationError('Validation failed', parsed.error.format())
  }

  const supabase = createServiceRoleClient()

  // Verify project exists
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', parsed.data.project_id)
    .maybeSingle()

  if (!project) {
    return errors.validationError('Project not found')
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert(parsed.data)
    .select(
      'id, project_id, title, briefing, caption, design_file_path, posting_date, posting_time, due_date, deadline, status, created_at, updated_at'
    )
    .single()

  if (error) {
    return errors.internalError(error.message)
  }

  return apiSuccess(data, 201)
}, 'write:tasks')
