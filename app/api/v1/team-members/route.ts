import { createServiceRoleClient } from '@/lib/supabase/server'
import { withApiAuth, getPagination } from '@/lib/api/middleware'
import { errors, apiSuccess } from '@/lib/api/errors'

// GET /api/v1/team-members
export const GET = withApiAuth(async (request) => {
  const { page, limit, offset } = getPagination(request)
  const supabase = createServiceRoleClient()

  const { data, error, count } = await supabase
    .from('team_members')
    .select('id, name, email, username, created_at, updated_at', { count: 'exact' })
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
}, 'read:team_members')
