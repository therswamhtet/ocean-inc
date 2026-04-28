import { createServiceRoleClient } from '@/lib/supabase/server'
import { withApiAuth, getPagination } from '@/lib/api/middleware'
import { errors, apiSuccess } from '@/lib/api/errors'
import { createClientSchema } from '@/lib/api/validation'

// GET /api/v1/clients
export const GET = withApiAuth(async (request) => {
  const { page, limit, offset } = getPagination(request)
  const supabase = createServiceRoleClient()

  const { data, error, count } = await supabase
    .from('clients')
    .select('id, name, slug, color, description, is_active, created_at, updated_at', { count: 'exact' })
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) {
    return errors.internalError(error.message)
  }

  return apiSuccess(
    data ?? [],
    200,
    { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) }
  )
}, 'read:clients')

// POST /api/v1/clients
export const POST = withApiAuth(async (request) => {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errors.validationError('Invalid JSON body')
  }

  const parsed = createClientSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validationError('Validation failed', parsed.error.format())
  }

  const supabase = createServiceRoleClient()

  // Generate unique slug
  const { randomBytes } = await import('node:crypto')
  let slug: string
  let attempts = 0
  do {
    slug = randomBytes(8).toString('hex')
    attempts++
  } while (attempts < 5)

  const { data, error } = await supabase
    .from('clients')
    .insert({
      name: parsed.data.name,
      slug,
      color: parsed.data.color,
      description: parsed.data.description ?? null,
    })
    .select('id, name, slug, color, description, is_active, created_at, updated_at')
    .single()

  if (error) {
    if (error.code === '23505') {
      return errors.validationError('A client with this name already exists')
    }
    return errors.internalError(error.message)
  }

  return apiSuccess(data, 201)
}, 'write:clients')
