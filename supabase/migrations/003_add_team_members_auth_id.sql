-- Migration: Add auth_id to team_members and fix "assign to myself"
-- Problem: team_members had no link to auth.users, so "assign to myself"
-- could never resolve which team_member belongs to the logged-in user.

-- Step 1: Add auth_id column with a unique constraint
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS auth_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Step 2: Create unique index to prevent duplicate auth_id mappings
CREATE UNIQUE INDEX IF NOT EXISTS team_members_auth_id_key
  ON public.team_members(auth_id)
  WHERE auth_id IS NOT NULL;

COMMENT ON COLUMN public.team_members.auth_id IS 'Links to auth.users.id. Enables "assign to myself" to resolve without email matching.';
