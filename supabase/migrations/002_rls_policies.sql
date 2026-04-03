-- Enable RLS on all 8 tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ADMIN POLICIES (full CRUD on all tables)
-- ============================================================

CREATE POLICY admin_all ON public.clients
  FOR ALL
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY admin_all ON public.projects
  FOR ALL
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY admin_all ON public.tasks
  FOR ALL
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY admin_all ON public.task_assignments
  FOR ALL
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY admin_all ON public.comments
  FOR ALL
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY admin_all ON public.team_members
  FOR ALL
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY admin_all ON public.invite_tokens
  FOR ALL
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY admin_all ON public.notifications
  FOR ALL
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ============================================================
-- TEAM MEMBER POLICIES (assigned-only access)
-- ============================================================

-- clients: SELECT only, WHERE client has projects with tasks assigned to this member
CREATE POLICY team_select_clients ON public.clients
  FOR SELECT
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member'
    AND EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.tasks t ON t.project_id = p.id
      JOIN public.task_assignments ta ON ta.task_id = t.id
      WHERE p.client_id = public.clients.id
        AND ta.team_member_id = (select auth.uid())
    )
  );

-- projects: SELECT only, WHERE project has tasks assigned to this member
CREATE POLICY team_select_projects ON public.projects
  FOR SELECT
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member'
    AND EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.task_assignments ta ON ta.task_id = t.id
      WHERE t.project_id = public.projects.id
        AND ta.team_member_id = (select auth.uid())
    )
  );

-- tasks: SELECT + UPDATE, WHERE task has assignment to auth.uid()
CREATE POLICY team_select_tasks ON public.tasks
  FOR SELECT
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member'
    AND EXISTS (
      SELECT 1 FROM public.task_assignments ta
      WHERE ta.task_id = public.tasks.id
        AND ta.team_member_id = (select auth.uid())
    )
  );

CREATE POLICY team_update_tasks ON public.tasks
  FOR UPDATE
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member'
    AND EXISTS (
      SELECT 1 FROM public.task_assignments ta
      WHERE ta.task_id = public.tasks.id
        AND ta.team_member_id = (select auth.uid())
    )
  )
  WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member'
    AND EXISTS (
      SELECT 1 FROM public.task_assignments ta
      WHERE ta.task_id = public.tasks.id
        AND ta.team_member_id = (select auth.uid())
    )
  );

-- task_assignments: SELECT only, WHERE team_member_id = auth.uid()
CREATE POLICY team_select_task_assignments ON public.task_assignments
  FOR SELECT
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member'
    AND team_member_id = (select auth.uid())
  );

-- comments: SELECT on assigned tasks, INSERT on assigned tasks
CREATE POLICY team_select_comments ON public.comments
  FOR SELECT
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member'
    AND EXISTS (
      SELECT 1 FROM public.task_assignments ta
      WHERE ta.task_id = public.comments.task_id
        AND ta.team_member_id = (select auth.uid())
    )
  );

CREATE POLICY team_insert_comments ON public.comments
  FOR INSERT
  WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member'
    AND team_member_id = (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.task_assignments ta
      WHERE ta.task_id = public.comments.task_id
        AND ta.team_member_id = (select auth.uid())
    )
  );

-- team_members: SELECT only own row
CREATE POLICY team_select_own ON public.team_members
  FOR SELECT
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member'
    AND id = (select auth.uid())
  );

-- invite_tokens: no team member access (admin-only, covered by admin_all policy)

-- notifications: SELECT + UPDATE (mark read), WHERE team_member_id = auth.uid()
CREATE POLICY team_select_notifications ON public.notifications
  FOR SELECT
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member'
    AND team_member_id = (select auth.uid())
  );

CREATE POLICY team_update_notifications ON public.notifications
  FOR UPDATE
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member'
    AND team_member_id = (select auth.uid())
  )
  WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member'
    AND team_member_id = (select auth.uid())
  );
