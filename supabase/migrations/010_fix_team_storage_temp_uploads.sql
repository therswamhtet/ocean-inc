-- Fix storage policy to allow team members to upload temp files
-- This is needed when creating new tasks before the task exists

-- Drop the existing insert policy
DROP POLICY IF EXISTS team_storage_insert ON storage.objects;

-- Create updated policy that allows team members to insert to both task paths and temp paths
-- Note: Use column name directly (not storage.objects.name) to avoid circular reference error 42P17
CREATE POLICY team_storage_insert ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'design-files'
    AND (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member'
    AND (
      -- Allow task paths for assigned tasks: {project_id}/{task_id}/{filename}
      EXISTS (
        SELECT 1
        FROM public.task_assignments ta
        JOIN public.tasks t ON t.id = ta.task_id
        WHERE ta.team_member_id = (select auth.uid())
          AND (name LIKE t.project_id::text || '/' || t.id::text || '/%')
      )
      OR
      -- Allow temp paths for new task creation: {project_id}/temp/{uuid}/{filename}
      (name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/temp/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.+')
    )
  );
