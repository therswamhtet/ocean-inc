---
phase: 01-foundation-database-auth-and-security
plan: "01"
subsystem: database
tags: [supabase, postgres, rls, storage, sql]

requires:
  - phase: none
    provides: n/a
provides:
  - 8-table PostgreSQL schema with UUID PKs, timestamps, FKs
  - Row-Level Security policies for admin and team_member roles
  - Private storage bucket for design files with access policies
  - Performance indexes on all RLS and query columns
  - Auth trigger to sync role metadata for RLS matching

affects:
  - 01-02 (Supabase SSR references this schema)
  - 01-03 (Admin login uses auth.users)
  - 01-04 (Invite flow inserts into team_members, invite_tokens)
  - Phase 2-4 (all CRUD operations depend on this schema)

tech-stack:
  added: [uuid-ossp extension]
  patterns:
    - "UUID primary keys with uuid_generate_v4()"
    - "created_at/updated_at timestamps with trigger function"
    - "RLS with (select auth.uid()) for statement-level caching"
    - "Role-based RLS via auth.jwt() -> 'app_metadata' ->> 'role'"
    - "Storage path pattern: {project_id}/{task_id}/{filename}"

key-files:
  created:
    - supabase/migrations/001_initial_schema.sql - 8 table definitions with triggers
    - supabase/migrations/002_rls_policies.sql - RLS enable + 20 policies
    - supabase/migrations/003_storage.sql - Private bucket + 3 storage policies
    - supabase/migrations/004_indexes.sql - 11 performance indexes
    - supabase/migrations/005_auth_triggers.sql - Role sync trigger for auth.users
  modified: []

key-decisions:
  - "Hard delete (no soft deletes) — simpler for MVP"
  - "Team members CAN view client details for assigned tasks"
  - "Team members CANNOT view other team members' profiles"
  - "No client-side RLS — portal uses service role (slug IS authorization)"
  - "Storage: 10MB max, images only, private bucket with signed URLs"

patterns-established:
  - "Supabase migration pattern: CREATE TABLE public.{name}"
  - "RLS policy naming: {role}_{action}_{table}"
  - "Statement-level auth caching: (select auth.uid())"
  - "Role check via JWT app_metadata instead of role table join"

requirements-completed: [DB-01, DB-02, DB-03, DB-04, DB-05, DB-06]

duration: 5min
completed: 2026-04-04
---

# Phase 01 Plan 01: Database Schema Summary

**8-table PostgreSQL schema with 20+ RLS policies, private storage bucket, and 11 performance indexes — full data layer for the Orca Digital project management platform**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-04T03:25:00Z
- **Completed:** 2026-04-04T03:30:00Z
- **Tasks:** 4 (+1 unplanned)
- **Files modified:** 5

## Accomplishments
- Complete 8-table schema: clients, projects, tasks, task_assignments, comments, team_members, invite_tokens, notifications
- 20+ RLS policies with admin (full CRUD) and team_member (assigned-only) access patterns
- Private storage bucket with 10MB limit, images-only, and path-enforced upload policies
- 11 performance indexes on all FK/RLS columns and common query columns
- Auth trigger to sync role from user_metadata to app_metadata for RLS matching

## Task Commits

1. **Task 1: Create initial database schema** - `526d5ed` (feat)
2. **Task 2: Create RLS policies** - `d9de398` (feat)
3. **Task 3: Create storage bucket** - `b8baeee` (feat)
4. **Task 4: Create performance indexes** - `5461327` (feat)
5. **Unplanned: Auth trigger for role sync** - `2bafd4f` (feat)

## Files Created/Modified
- `supabase/migrations/001_initial_schema.sql` - 8 tables with UUIDs, timestamps, triggers, FKs
- `supabase/migrations/002_rls_policies.sql` - RLS enabled on all tables, admin/team policies
- `supabase/migrations/003_storage.sql` - Private bucket with 10MB limit, images only
- `supabase/migrations/004_indexes.sql` - 11 indexes on FK and query columns
- `supabase/migrations/005_auth_triggers.sql` - Role sync trigger for auth.users

## Decisions Made
- Hard delete over soft delete — simpler for MVP, no audit trail needed
- No client-side RLS for portal — slug-based authorization via server component with service role
- Auth trigger approach for role sync — signUp() can't set app_metadata directly, trigger copies from user_metadata

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added auth user trigger for role metadata sync**
- **Found during:** Task 4 (after reviewing invite registration action)
- **Issue:** RLS policies check `auth.jwt() -> 'app_metadata' ->> 'role'` but signUp() only sets user_metadata. Team member registration would fail RLS checks.
- **Fix:** Added 005_auth_triggers.sql with handle_new_user() trigger that copies 'role' from raw_user_meta_data to raw_app_meta_data on auth.users insert
- **Files modified:** supabase/migrations/005_auth_triggers.sql
- **Verification:** Trigger fires BEFORE INSERT, ensuring app_metadata is set before RLS evaluates
- **Committed in:** 2bafd4f

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Auth trigger is essential for the invite registration flow (Plan 01-04) to work with RLS. Without it, team_member role wouldn't propagate to app_metadata.

## Issues Encountered
None

## Next Phase Readiness
- Database schema complete — all 8 tables, RLS, storage, indexes ready
- Ready for Plan 01-02 (Supabase SSR clients) which references this schema

---
*Phase: 01-foundation-database-auth-and-security*
*Completed: 2026-04-04*
