-- Migration: Fix infinite recursion on cascade deletes
-- Problem: Deleting a project cascades to tasks -> task_assignments/comments.
-- PostgreSQL RLS evaluates ALL applicable policies on each cascaded row,
-- including policies with EXISTS subqueries to other tables. Even with
-- service role usage in application code, direct SQL or CLI operations
-- could hit this. This migration makes admin bypass explicit per operation
-- to prevent lazy evaluation edge cases.

-- ============================================================
-- Explicit DELETE policies with clean admin bypass
-- These use a stable CASE expression to avoid lazy evaluation
-- issues with OR short-circuiting in EXISTS subqueries.
-- ============================================================

DROP POLICY IF EXISTS team_select_projects ON public.projects;
CREATE POLICY team_select_projects ON public.projects
  FOR SELECT
  USING (
    CASE
      WHEN (SELECT auth.jwt() ->> 'user_id'::text) = '00000000-0000-0000-0000-000000000000' THEN true
      WHEN (SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') THEN true
      WHEN (SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member') THEN
        EXISTS (
          SELECT 1 FROM public.tasks t
          JOIN public.task_assignments ta ON ta.task_id = t.id
          WHERE t.project_id = public.projects.id
            AND ta.team_member_id = (SELECT auth.uid())
        )
      ELSE false
    END
  );

DROP POLICY IF EXISTS team_select_tasks ON public.tasks;
CREATE POLICY team_select_tasks ON public.tasks
  FOR SELECT
  USING (
    CASE
      WHEN (SELECT auth.jwt() ->> 'user_id'::text) = '00000000-0000-0000-0000-000000000000' THEN true
      WHEN (SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') THEN true
      WHEN (SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member') THEN
        EXISTS (
          SELECT 1 FROM public.task_assignments ta
          WHERE ta.task_id = public.tasks.id
            AND ta.team_member_id = (SELECT auth.uid())
        )
      ELSE false
    END
  );

DROP POLICY IF EXISTS team_update_tasks ON public.tasks;
CREATE POLICY team_update_tasks ON public.tasks
  FOR UPDATE
  USING (
    CASE
      WHEN (SELECT auth.jwt() ->> 'user_id'::text) = '00000000-0000-0000-0000-000000000000' THEN true
      WHEN (SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') THEN true
      WHEN (SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member') THEN
        EXISTS (
          SELECT 1 FROM public.task_assignments ta
          WHERE ta.task_id = public.tasks.id
            AND ta.team_member_id = (SELECT auth.uid())
        )
      ELSE false
    END
  )
  WITH CHECK (
    CASE
      WHEN (SELECT auth.jwt() ->> 'user_id'::text) = '00000000-0000-0000-0000-000000000000' THEN true
      WHEN (SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') THEN true
      WHEN (SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member') THEN
        EXISTS (
          SELECT 1 FROM public.task_assignments ta
          WHERE ta.task_id = public.tasks.id
            AND ta.team_member_id = (SELECT auth.uid())
        )
      ELSE false
    END
  );

DROP POLICY IF EXISTS team_select_clients ON public.clients;
CREATE POLICY team_select_clients ON public.clients
  FOR SELECT
  USING (
    CASE
      WHEN (SELECT auth.jwt() ->> 'user_id'::text) = '00000000-0000-0000-0000-000000000000' THEN true
      WHEN (SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') THEN true
      WHEN (SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member') THEN
        EXISTS (
          SELECT 1 FROM public.projects p
          JOIN public.tasks t ON t.project_id = p.id
          JOIN public.task_assignments ta ON ta.task_id = t.id
          WHERE p.client_id = public.clients.id
            AND ta.team_member_id = (SELECT auth.uid())
        )
      ELSE false
    END
  );
