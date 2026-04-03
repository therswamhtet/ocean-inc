-- Create private storage bucket for design files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'design-files',
  'design-files',
  false,
  10485760, -- 10MB
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']
);

-- Admin: full access on design-files bucket
CREATE POLICY admin_storage_all ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'design-files'
    AND (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    bucket_id = 'design-files'
    AND (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Team members: SELECT on design-files bucket
CREATE POLICY team_storage_select ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'design-files'
    AND (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member'
  );

-- Team members: INSERT on design-files bucket for assigned task paths
-- Path structure: {project_id}/{task_id}/{filename}
CREATE POLICY team_storage_insert ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'design-files'
    AND (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'team_member'
    AND EXISTS (
      SELECT 1
      FROM public.task_assignments ta
      JOIN public.tasks t ON t.id = ta.task_id
      WHERE ta.team_member_id = (select auth.uid())
        AND (storage.objects.name LIKE t.project_id::text || '/' || t.id::text || '/%')
    )
  );
