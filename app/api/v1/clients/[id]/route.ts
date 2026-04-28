import { createServiceRoleClient } from '@/lib/supabase/server'
import { withApiAuth } from '@/lib/api/middleware'
import { errors, apiSuccess } from '@/lib/api/errors'
import { updateClientSchema } from '@/lib/api/validation'

// GET /api/v1/clients/:id
export const GET = withApiAuth(async (_request, _context, routeContext) => {
  const { id } = await routeContext.params
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('clients')
    .select('id, name, slug, color, description, is_active, created_at, updated_at')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    return errors.internalError(error.message)
  }

  if (!data) {
    return errors.notFound('Client')
  }

  return apiSuccess(data)
}, 'read:clients')

// PATCH /api/v1/clients/:id
export const PATCH = withApiAuth(async (request, _context, routeContext) => {
  const { id } = await routeContext.params
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errors.validationError('Invalid JSON body')
  }

  const parsed = updateClientSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validationError('Validation failed', parsed.error.format())
  }

  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('clients')
    .update(parsed.data)
    .eq('id', id)
    .select('id, name, slug, color, description, is_active, created_at, updated_at')
    .single()

  if (error) {
    return errors.internalError(error.message)
  }

  if (!data) {
    return errors.notFound('Client')
  }

  return apiSuccess(data)
}, 'write:clients')

// DELETE /api/v1/clients/:id
export const DELETE = withApiAuth(async (_request, _context, routeContext) => {
  const { id } = await routeContext.params
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) {
    return errors.internalError(error.message)
  }

  return apiSuccess({ deleted: true })
}, 'write:clients')
