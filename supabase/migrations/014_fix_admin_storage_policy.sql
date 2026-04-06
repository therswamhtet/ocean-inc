-- Migration: Fix admin storage upload policy
-- Addresses storage RLS that may cause upload errors

-- Refresh admin storage policy
DROP POLICY IF EXISTS admin_storage_all ON storage.objects;

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

-- Ensure bucket config is correct
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('design-files', 'design-files', false, 10485760, ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE
  SET file_size_limit = 10485760,
      allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
