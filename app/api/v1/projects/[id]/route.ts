import { createServiceRoleClient } from '@/lib/supabase/server'
import { withApiAuth } from '@/lib/api/middleware'
import { errors, apiSuccess } from '@/lib/api/errors'
import { updateProjectSchema } from '@/lib/api/validation'

// GET /api/v1/projects/:id
export const GET = withApiAuth(async (_request, _context, routeContext) => {
  const { id } = await routeContext.params
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('projects')
    .select('id, client_id, name, month, year, status, created_at, updated_at')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    return errors.internalError(error.message)
  }

  if (!data) {
    return errors.notFound('Project')
  }

  return apiSuccess(data)
}, 'read:projects')

// PATCH /api/v1/projects/:id
export const PATCH = withApiAuth(async (request, _context, routeContext) => {
  const { id } = await routeContext.params
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errors.validationError('Invalid JSON body')
  }

  const parsed = updateProjectSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validationError('Validation failed', parsed.error.format())
  }

  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('projects')
    .update(parsed.data)
    .eq('id', id)
    .select('id, client_id, name, month, year, status, created_at, updated_at')
    .single()

  if (error) {
    return errors.internalError(error.message)
  }

  if (!data) {
    return errors.notFound('Project')
  }

  return apiSuccess(data)
}, 'write:projects')

// DELETE /api/v1/projects/:id
export const DELETE = withApiAuth(async (_request, _context, routeContext) => {
  const { id } = await routeContext.params
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) {
    return errors.internalError(error.message)
  }

  return apiSuccess({ deleted: true })
}, 'write:projects')
