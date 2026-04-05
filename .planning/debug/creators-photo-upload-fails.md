---
status: investigating
trigger: Photo uploads in the Creators section fail with "Upload failed. Please try again." error. The photo record is created successfully in the database, but the actual file upload to storage fails.
created: 2026-04-05T00:00:00Z
updated: 2026-04-05T14:00:00Z
---

## Current Focus

hypothesis: The new storage policy migration has a syntax error causing PostgreSQL error 42P17 (invalid object definition) - likely circular reference or invalid policy syntax
test: Review migration 010_fix_team_storage_temp_uploads.sql for syntax errors
expecting: Find syntax issue in the policy definition that causes 42P17 error
next_action: Read the migration file and check for circular references or invalid syntax

## Symptoms

expected: Upload photo to Creators section, file gets stored in Supabase storage, and photo is viewable in the client portal
actual: Photo record created in database, but file upload fails with "Upload failed. Please try again." message
errors: Upload failed. Please try again.
reproduction: 
1. Go to Creators section
2. Try to upload a small JPEG file
3. Upload fails with error message
4. Photo record may be created but file not stored
timeline: Upload feature exists but never worked properly - failing during file upload to storage

## Eliminated

- hypothesis: The storage policy syntax is correct
  evidence: PostgreSQL error 42P17 indicates invalid object definition - the policy references `storage.objects.name` within a policy ON storage.objects, creating circular reference
  timestamp: 2026-04-05T14:01:00Z

## Evidence

- timestamp: 2026-04-05T00:05:00Z
  checked: Codebase for "Creators" section and photo upload feature
  found: No "Creators" section exists. No "photos" table in database. Only design-file-uploader.tsx has the error message "Upload failed. Please try again."
  implication: The issue may be with the design-file-uploader or this is a feature request to build a new Creators photo upload feature

- timestamp: 2026-04-05T00:06:00Z
  checked: design-file-uploader.tsx storage upload logic
  found: Line 52 constructs URL as `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/design-files/${path}` - missing '/public/' in the path
  implication: The upload URL format is incorrect for Supabase Storage REST API

- timestamp: 2026-04-05T00:07:00Z
  checked: Error handling in design-file-uploader.tsx
  found: Lines 74-82 check xhr.status but never log the actual error response body. The error message from Supabase is not captured.
  implication: Cannot diagnose why upload fails because actual error response is discarded

- timestamp: 2026-04-05T00:08:00Z
  checked: Storage bucket configuration
  found: design-files bucket is private (public: false) in migration 003_storage.sql. The URL for upload should work, but no logging of response body to diagnose.
  implication: Need to add better error logging to see actual Supabase error

- timestamp: 2026-04-05T00:09:00Z
  checked: Storage policies for team_storage_insert
  found: Policy requires path format `{project_id}/{task_id}/{filename}` AND user must be assigned to the task. Uploader creates temp paths `{project_id}/temp/{temp_id}/{filename}` when no taskId provided.
  implication: Upload fails because temp paths don't match the policy pattern. The response body is not logged so user sees generic error.

- timestamp: 2026-04-05T00:10:00Z
  checked: No "Creators" section or photo table exists in codebase
  found: The issue description mentions "Creators" section but no such section exists. Only design-file-uploader.tsx has matching error message.
  implication: User may be referring to design-file-uploader, OR this is a feature request for a new Creators photo upload feature

- timestamp: 2026-04-05T14:01:00Z
  checked: Migration file 010_fix_team_storage_temp_uploads.sql
  found: Line 20 references `storage.objects.name` within a policy ON storage.objects, and line 24 uses `storage.objects.name` in regex check. This creates a circular reference causing PostgreSQL error 42P17 (invalid object definition).
  implication: The policy cannot reference its own table in the WITH CHECK clause. Need to use column name directly without table qualification.

## Resolution

root_cause: Two issues found: (1) The storage policy `team_storage_insert` only allowed uploads to paths matching `{project_id}/{task_id}/{filename}` for assigned tasks, but the DesignFileUploader creates temp paths like `{project_id}/temp/{uuid}/{filename}` when no taskId is provided (e.g., during task creation). This caused uploads to fail for team members. (2) The uploader did not log or display actual error messages from Supabase, making debugging difficult.

fix: |
  1. Added better error logging and user-facing error messages in design-file-uploader.tsx to capture actual Supabase error responses
  2. Created migration 010_fix_team_storage_temp_uploads.sql to update the team_storage_insert policy to allow temp path uploads using regex pattern matching

verification: |
  1. Run `git diff` to verify changes
  2. Apply the migration: `supabase db push` or run the SQL in Supabase dashboard
  3. Test uploading a file in task creation form
  4. Check browser console for detailed error messages if issues persist

files_changed:
  - components/admin/design-file-uploader.tsx: Added error logging and descriptive error messages
  - supabase/migrations/010_fix_team_storage_temp_uploads.sql: Updated storage policy to allow temp uploads
