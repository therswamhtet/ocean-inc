import { createServiceRoleClient } from '@/lib/supabase/server'
import { withApiAuth, getPagination } from '@/lib/api/middleware'
import { errors, apiSuccess } from '@/lib/api/errors'
import { createCommentSchema } from '@/lib/api/validation'

// GET /api/v1/tasks/:id/comments
export const GET = withApiAuth(async (request, _context, routeContext) => {
  const { id: taskId } = await routeContext.params
  const { page, limit, offset } = getPagination(request)

  const supabase = createServiceRoleClient()

  // Verify task exists
  const { data: task } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', taskId)
    .maybeSingle()

  if (!task) {
    return errors.notFound('Task')
  }

  const { data, error, count } = await supabase
    .from('comments')
    .select('id, task_id, team_member_id, content, is_revision, created_at, updated_at', { count: 'exact' })
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return errors.internalError(error.message)
  }

  return apiSuccess(
    data ?? [],
    200,
    { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) }
  )
}, 'read:comments')

// POST /api/v1/tasks/:id/comments
export const POST = withApiAuth(async (request, _context, routeContext) => {
  const { id: taskId } = await routeContext.params
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errors.validationError('Invalid JSON body')
  }

  const parsed = createCommentSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validationError('Validation failed', parsed.error.format())
  }

  const supabase = createServiceRoleClient()

  // Verify task exists
  const { data: task } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', taskId)
    .maybeSingle()

  if (!task) {
    return errors.notFound('Task')
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      task_id: taskId,
      content: parsed.data.content,
      is_revision: parsed.data.is_revision,
    })
    .select('id, task_id, team_member_id, content, is_revision, created_at, updated_at')
    .single()

  if (error) {
    return errors.internalError(error.message)
  }

  return apiSuccess(data, 201)
}, 'write:comments')
