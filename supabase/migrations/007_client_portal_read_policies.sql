-- ============================================================
-- CLIENT PORTAL PUBLIC READ PATH (/portal/[slug])
-- ============================================================
-- Scope: enable anon SELECT for slug-scoped portal reads while
-- keeping INSERT/UPDATE/DELETE paths unavailable to anon.
-- Slug filtering is enforced in the portal query layer.

-- clients: slug lookup for /portal/[slug]
DROP POLICY IF EXISTS anon_select_clients ON public.clients;
CREATE POLICY anon_select_clients ON public.clients
  FOR SELECT
  USING ((SELECT auth.role()) = 'anon');

-- projects: portal surface only needs active projects
DROP POLICY IF EXISTS anon_select_projects ON public.projects;
CREATE POLICY anon_select_projects ON public.projects
  FOR SELECT
  USING (
    (SELECT auth.role()) = 'anon'
    AND status = 'active'
  );

-- tasks: portal tasks must belong to an active project
DROP POLICY IF EXISTS anon_select_tasks ON public.tasks;
CREATE POLICY anon_select_tasks ON public.tasks
  FOR SELECT
  USING (
    (SELECT auth.role()) = 'anon'
    AND EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.id = public.tasks.project_id
        AND p.status = 'active'
    )
  );
