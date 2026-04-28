import { createServiceRoleClient } from '@/lib/supabase/server'
import { withApiAuth, getPagination } from '@/lib/api/middleware'
import { errors, apiSuccess } from '@/lib/api/errors'
import { createProjectSchema } from '@/lib/api/validation'

// GET /api/v1/projects
export const GET = withApiAuth(async (request) => {
  const { page, limit, offset } = getPagination(request)
  const url = new URL(request.url)
  const clientId = url.searchParams.get('client_id')

  const supabase = createServiceRoleClient()
  let query = supabase
    .from('projects')
    .select('id, client_id, name, month, year, status, created_at, updated_at', { count: 'exact' })
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (clientId) {
    query = query.eq('client_id', clientId)
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
}, 'read:projects')

// POST /api/v1/projects
export const POST = withApiAuth(async (request) => {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errors.validationError('Invalid JSON body')
  }

  const parsed = createProjectSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validationError('Validation failed', parsed.error.format())
  }

  const supabase = createServiceRoleClient()

  // Verify client exists
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('id', parsed.data.client_id)
    .maybeSingle()

  if (!client) {
    return errors.validationError('Client not found')
  }

  const { data, error } = await supabase
    .from('projects')
    .insert(parsed.data)
    .select('id, client_id, name, month, year, status, created_at, updated_at')
    .single()

  if (error) {
    return errors.internalError(error.message)
  }

  return apiSuccess(data, 201)
}, 'write:projects')
