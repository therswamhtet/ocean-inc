-- Migration: Fix RLS policy recursion by adding explicit admin bypasses
-- Problem: When admin queries tables, Supabase evaluates ALL applicable SELECT policies.
-- The team_* policies have subqueries that were being evaluated even for admin users,
-- causing infinite recursion through the EXISTS subqueries.

-- Apply this migration by running in Supabase SQL Editor or via CLI

-- Fix team_select_projects
DROP POLICY IF EXISTS team_select_projects ON public.projects;
CREATE POLICY team_select_projects ON public.projects
  FOR SELECT
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (
      (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member'
      AND EXISTS (
        SELECT 1 FROM public.tasks t
        JOIN public.task_assignments ta ON ta.task_id = t.id
        WHERE t.project_id = public.projects.id
          AND ta.team_member_id = (select auth.uid())
      )
    )
  );

-- Fix team_select_tasks
DROP POLICY IF EXISTS team_select_tasks ON public.tasks;
CREATE POLICY team_select_tasks ON public.tasks
  FOR SELECT
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (
      (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member'
      AND EXISTS (
        SELECT 1 FROM public.task_assignments ta
        WHERE ta.task_id = public.tasks.id
          AND ta.team_member_id = (select auth.uid())
      )
    )
  );

-- Fix team_update_tasks
DROP POLICY IF EXISTS team_update_tasks ON public.tasks;
CREATE POLICY team_update_tasks ON public.tasks
  FOR UPDATE
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (
      (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member'
      AND EXISTS (
        SELECT 1 FROM public.task_assignments ta
        WHERE ta.task_id = public.tasks.id
          AND ta.team_member_id = (select auth.uid())
      )
    )
  )
  WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (
      (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member'
      AND EXISTS (
        SELECT 1 FROM public.task_assignments ta
        WHERE ta.task_id = public.tasks.id
          AND ta.team_member_id = (select auth.uid())
      )
    )
  );

-- Fix team_select_task_assignments
DROP POLICY IF EXISTS team_select_task_assignments ON public.task_assignments;
CREATE POLICY team_select_task_assignments ON public.task_assignments
  FOR SELECT
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (
      (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member'
      AND team_member_id = (select auth.uid())
    )
  );

-- Fix team_select_comments
DROP POLICY IF EXISTS team_select_comments ON public.comments;
CREATE POLICY team_select_comments ON public.comments
  FOR SELECT
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (
      (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member'
      AND EXISTS (
        SELECT 1 FROM public.task_assignments ta
        WHERE ta.task_id = public.comments.task_id
          AND ta.team_member_id = (select auth.uid())
      )
    )
  );

-- Fix team_insert_comments
DROP POLICY IF EXISTS team_insert_comments ON public.comments;
CREATE POLICY team_insert_comments ON public.comments
  FOR INSERT
  WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (
      (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member'
      AND team_member_id = (select auth.uid())
      AND EXISTS (
        SELECT 1 FROM public.task_assignments ta
        WHERE ta.task_id = public.comments.task_id
          AND ta.team_member_id = (select auth.uid())
      )
    )
  );

-- Fix team_select_own
DROP POLICY IF EXISTS team_select_own ON public.team_members;
CREATE POLICY team_select_own ON public.team_members
  FOR SELECT
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (
      (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member'
      AND id = (select auth.uid())
    )
  );

-- Fix team_select_notifications
DROP POLICY IF EXISTS team_select_notifications ON public.notifications;
CREATE POLICY team_select_notifications ON public.notifications
  FOR SELECT
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (
      (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member'
      AND team_member_id = (select auth.uid())
    )
  );

-- Fix team_update_notifications
DROP POLICY IF EXISTS team_update_notifications ON public.notifications;
CREATE POLICY team_update_notifications ON public.notifications
  FOR UPDATE
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (
      (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member'
      AND team_member_id = (select auth.uid())
    )
  )
  WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (
      (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member'
      AND team_member_id = (select auth.uid())
    )
  );
