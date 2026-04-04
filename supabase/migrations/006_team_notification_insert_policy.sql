-- Team member notification INSERT policy (D-07)
-- Allows team members to insert notifications with team_member_id = NULL (admin notifications)

CREATE POLICY team_insert_notifications ON public.notifications
  FOR INSERT
  WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member'
    AND team_member_id IS NULL
  );
