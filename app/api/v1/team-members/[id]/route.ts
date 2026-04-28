import { createServiceRoleClient } from '@/lib/supabase/server'
import { withApiAuth } from '@/lib/api/middleware'
import { errors, apiSuccess } from '@/lib/api/errors'

// GET /api/v1/team-members/:id
export const GET = withApiAuth(async (_request, _context, routeContext) => {
  const { id } = await routeContext.params
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('team_members')
    .select('id, name, email, username, created_at, updated_at')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    return errors.internalError(error.message)
  }

  if (!data) {
    return errors.notFound('Team member')
  }

  return apiSuccess(data)
}, 'read:team_members')
