# Codebase Concerns

**Analysis Date:** 2026-04-07

## Security Considerations

**Hardcoded secrets in `.env.local` with no `.env.example` template**
- Risk: Real credentials stored on disk (Supabase anon key, service role key, DB password, Vercel API key). No `.env.example` to guide new collaborators on required variables.
- Files: `.env.local`
- Current mitigation: Listed in `.gitignore` (line 34)
- Recommendations: Create `.env.example` with placeholder values. Rotate any keys that may have been checked into git history before the gitignore was added.

**`dangerouslySetInnerHTML` without sanitizing on task briefing**
- Risk: If an admin enters malicious HTML in a task brief, it will execute in the browser.
- Files: `app/admin/tasks/[taskId]/page.tsx` (line ~165) — renders `task.briefing` directly
- Current mitigation: Other usages of `dangerouslySetInnerHTML` go through `linkify()` which escapes HTML entities
- Recommendations: Run briefing through `linkify()` or sanitize before rendering

**No authentication guard on upload API route**
- Risk: Unauthenticated requests could upload files to the `design-files` bucket, potentially overwriting others' files (`upsert: true` is set)
- Files: `app/api/admin/upload/route.ts` — uses `createServiceRoleClient()` (bypasses RLS) without checking user
- Current mitigation: Route is not linked from any public UI
- Recommendations: Add `createClient()` auth check at the top of the POST handler before any storage operations

**Exposed service role key usage across many action files**
- Risk: `createServiceRoleClient()` bypasses all RLS. Used across many action handlers. A bug in auth gating or a future refactor could expose full database access.
- Files: `lib/supabase/server.ts`, `app/admin/clients/actions.ts`, `app/admin/clients/[clientId]/projects/[projectId]/actions.ts`
- Current mitigation: Server components authenticate user before calling service role client
- Recommendations: Add explicit env validation at startup. Audit every call site to confirm it's always behind an auth gate.

**RLS policy allows unauthenticated access to all clients**
- Risk: The `anon_select_clients` policy allows any unauthenticated user with the anon key to query ALL clients (not filtered by slug at RLS level)
- Files: `supabase/migrations/007_client_portal_read_policies.sql`
- Current mitigation: Slug filtering enforced in application query layer
- Recommendations: Add a policy that restricts anon reads to a specific slug match

**Password policy inconsistency**
- Risk: Settings page requires 6-char minimum, invite registration requires 8-char minimum
- Files: `app/admin/settings/actions.ts` (line 72), `app/invite/[token]/actions.ts` (line 61)
- Recommendations: Standardize to 8+ character minimum

## Missing Error Handling

**Notification actions silently ignore errors**
- Issue: DB updates in notification actions without checking error or returning feedback
- Files: `app/admin/notifications/actions.ts`, `app/team/notifications/actions.ts`
- Impact: If the database operation fails silently, users see no feedback
- Fix approach: Check for errors and return feedback to calling UI

**`updateTaskFilePathAction` and `updateTaskTimeAction` lack validation**
- Issue: File path and posting time parameters passed directly to database with no Zod validation
- Files: `app/admin/clients/[clientId]/projects/[projectId]/actions.ts` (lines 401-445)
- Impact: Arbitrary strings stored as file paths, invalid time strings stored silently
- Fix approach: Add Zod validation schemas for these parameters

**Server actions use `redirect()` for error control flow**
- Issue: Validation errors cause server-side redirects with query params rather than returning structured errors to the form
- Files: `app/invite/[token]/actions.ts`, various mutation actions
- Impact: Less graceful error handling, potential for inconsistent state on failure
- Fix approach: Return `{ success: false, error }` from mutations, show inline form errors

## Tech Debt

**Repeated auth pattern across all action files**
- Issue: Nearly every action file has the same pattern: `createClient()` → `auth.getUser()` → check → `createServiceRoleClient()`. Copy-pasted across 6+ files. `requireAdmin()` utility is defined in some files but not consistently used.
- Files: `app/admin/clients/actions.ts`, `app/admin/notifications/actions.ts`, `app/admin/clients/[clientId]/projects/[projectId]/actions.ts`, `app/admin/settings/actions.ts`, `app/admin/team/actions.ts`, `app/team/tasks/actions.ts`
- Impact: Easy to forget auth in new actions, hard to maintain consistently
- Fix approach: Extract shared `requireAdmin()` utility into `lib/supabase/auth.ts`, use everywhere

**Multiple use of `any` type for DB row mapping**
- Issue: Uses `any` for database row mapping, losing compile-time type safety
- Files: `app/admin/page.tsx` (line 89), `app/admin/tasks/page.tsx` (lines 63, 64, 69)
- Impact: Schema changes silently break these files
- Fix approach: Define typed row interfaces or use Supabase type generator

**`createTaskAction` overly complex (~100 lines, nested try/catch)**
- Issue: Handles auth, schema validation, team member auto-creation, task insertion, file path resolution, task assignment, cleanup on failure — all in one function
- Files: `app/admin/clients/[clientId]/projects/[projectId]/actions.ts` (lines 111-218)
- Impact: Hard to test, hard to reason about, large surface for bugs
- Fix approach: Split into composable functions: validate, resolve team member, create task, assign

**RLS migrations create/drop/replace policies across multiple files**
- Issue: Policies for the same tables exist across migrations 002, 009, and 011. Migration numbering is non-sequential (two files are `003_*`)
- Files: `supabase/migrations/002_rls_policies.sql`, `003_storage.sql`, `003_add_team_members_auth_id.sql`, `009_fix_rls_recursion.sql`, `011_fix_rls_cascade_delete.sql`
- Impact: Confusion on which policy is authoritative, risk of issues during DB rebuild
- Fix approach: Consolidate RLS policies into a single canonical migration

**`linkify` double-encodes URLs in href**
- Issue: The `linkify` function escapes HTML entities, then regex matches on the escaped text, so href values contain `&amp;` instead of `&`
- Files: `lib/utils.ts` (lines 19-24)
- Impact: Links with query parameters display incorrectly
- Fix approach: URL-encode the href separately from the visible text

## Known Bugs

**Race condition in registration flow**
- Symptoms: If process fails between auth user creation and token-used update, token is not marked used but user exists
- Trigger: Network error, timeout during `register` function execution
- Files: `app/invite/[token]/actions.ts` (lines 27-101 — `register` function)
- Workaround: Manual token cleanup required if registration fails mid-flight
- Root cause: No transaction wrapping auth user + team member creation + token update
- Fix approach: Wrap all three steps in a transaction or add idempotency checks

**`notifyAssignerAction` creates notification before status update**
- Symptoms: Notification sent but task status not changed to done if second DB call fails
- Trigger: Database failure between notification insert and status update
- Files: `app/team/tasks/actions.ts` (lines 130-177)
- Workaround: Notification is sent (user sees it) even though status unchanged
- Fix approach: Update status first, then send notification as idempotent retry

**Migration 013 doesn't backfill existing rows**
- Symptoms: Existing tasks have NULL `posting_time` (PostgreSQL DEFAULT doesn't retrofill)
- Trigger: Any display that expects `posting_time` to be non-null
- Files: `supabase/migrations/013_posting_time_column.sql` (line 4)
- Fix approach: Add `UPDATE tasks SET posting_time = '10:00:00' WHERE posting_time IS NULL;`

## Performance Bottlenecks

**Portal query fetches ALL tasks with no pagination**
- Problem: `getPortalDataBySlug` queries ALL tasks for all active projects of a client with no pagination or limit
- Files: `lib/portal/queries.ts` (lines 91-97)
- Cause: No caching layer, no pagination, every page load does fresh DB queries
- Improvement path: Add pagination and Next.js revalidation with cache tags

**Admin dashboard fires 7 parallel queries without caching**
- Problem: Admin dashboard makes 7 independent Supabase queries on every page load (5 head-count + 2 data queries)
- Files: `app/admin/page.tsx` (lines 37-67)
- Cause: No ISR or cache tags configured
- Improvement path: Use Next.js `revalidate` (ISR) or `cacheTags` to reduce database load

## Fragile Areas

**Invite registration flow with multiple DB writes**
- Files: `app/invite/[token]/actions.ts`
- Why fragile: Creates auth user, team member, marks token used — failure at any point leaves inconsistent state
- Common failures: Duplicate usernames, timeout between steps
- Safe modification: Add comprehensive error handling for each branch
- Test coverage: None (no tests for invite flow)

**Assignment auto-creation side effect**
- Files: `app/admin/clients/[clientId]/projects/[projectId]/actions.ts` (lines 318-399)
- Why fragile: Assigning a task can silently create a new team member entry — confusing behavior
- Common failures: Unexpected team members appearing
- Fix approach: Separate team member creation from task assignment

## Test Coverage Gaps

**No tests for any server action files**
- What's not tested: All `actions.ts` files — the entire business logic layer (CRUD, auth, validation, side effects)
- Directories: ALL `actions.ts` files under `app/`
- Risk: Business logic could break silently; only component rendering is tested
- Priority: High
- Difficulty to test: Requires mocking Supabase client chain and `redirect()` (already done in existing behavioral tests)

**No test for middleware auth flow**
- What's not tested: Which routes are protected, redirect behavior for unauthenticated users
- Files: `middleware.ts`
- Risk: Auth bypass if route patterns change
- Priority: High

**No tests for upload API route**
- What's not tested: File size limits, MIME filtering, authentication guard, error handling
- Files: `app/api/admin/upload/route.ts`
- Risk: Files could be uploaded without proper validation
- Priority: Medium

**No tests for client CRUD actions**
- What's not tested: `createClientAction`, `deleteClientAction`, `toggleClientStatusAction`
- Files: `app/admin/clients/actions.ts`
- Risk: Destructive operations untested
- Priority: Medium

---

*Concerns audit: 2026-04-07*
*Update as issues are fixed or new ones discovered*
