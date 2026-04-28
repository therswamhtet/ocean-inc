import { createServiceRoleClient } from '@/lib/supabase/server'
import { withApiAuth } from '@/lib/api/middleware'
import { errors, apiSuccess } from '@/lib/api/errors'
import { updateTaskSchema } from '@/lib/api/validation'

// GET /api/v1/tasks/:id
export const GET = withApiAuth(async (_request, _context, routeContext) => {
  const { id } = await routeContext.params
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('tasks')
    .select(
      'id, project_id, title, briefing, caption, design_file_path, posting_date, posting_time, due_date, deadline, status, created_at, updated_at'
    )
    .eq('id', id)
    .maybeSingle()

  if (error) {
    return errors.internalError(error.message)
  }

  if (!data) {
    return errors.notFound('Task')
  }

  return apiSuccess(data)
}, 'read:tasks')

// PATCH /api/v1/tasks/:id
export const PATCH = withApiAuth(async (request, _context, routeContext) => {
  const { id } = await routeContext.params
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errors.validationError('Invalid JSON body')
  }

  const parsed = updateTaskSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validationError('Validation failed', parsed.error.format())
  }

  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('tasks')
    .update(parsed.data)
    .eq('id', id)
    .select(
      'id, project_id, title, briefing, caption, design_file_path, posting_date, posting_time, due_date, deadline, status, created_at, updated_at'
    )
    .single()

  if (error) {
    return errors.internalError(error.message)
  }

  if (!data) {
    return errors.notFound('Task')
  }

  return apiSuccess(data)
}, 'write:tasks')

// DELETE /api/v1/tasks/:id
export const DELETE = withApiAuth(async (_request, _context, routeContext) => {
  const { id } = await routeContext.params
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) {
    return errors.internalError(error.message)
  }

  return apiSuccess({ deleted: true })
}, 'write:tasks')
