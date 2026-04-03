# Pitfalls Research

**Domain:** Next.js 15 + Supabase project management & client portal (multi-role, magic-link client access)
**Researched:** 2026-04-04
**Confidence:** HIGH (verified against official Supabase documentation and Next.js patterns)

## Critical Pitfalls

### Pitfall 1: RLS Policies with `auth.uid()` That Silently Fail for Unauthenticated Sessions

**What goes wrong:**
The client portal uses magic-link slug access with no login. When an unauthenticated user accesses data, `auth.uid()` returns `null`. Policies written as `auth.uid() = client_id` silently match zero rows because `null = anything` is `null` (not `true`), so the query returns empty results with no error. This makes debugging extremely difficult — it appears as though data simply doesn't exist.

**Why it happens:**
Developers write RLS policies assuming all access is authenticated. The client portal's magic-link pattern is explicitly unauthenticated, so the `anon` role is used. Without explicit null guards, ownership checks fail silently.

**How to avoid:**
For the client portal, use a magic token stored in `raw_app_meta_data` and explicitly guard against null sessions:
```sql
-- Correct pattern for authenticated access:
auth.uid() IS NOT NULL AND auth.uid() = user_id

-- For the client portal (unauthenticated, slug-based):
-- Use a security definer function that validates the slug token
-- and returns permitted client_id, rather than relying on auth.uid()
```
For the client portal specifically, do NOT rely on RLS with `anon` role alone. Instead, use a Server Action that validates the slug token server-side and queries with the service_role key (scoped narrowly to that client's data only).

**Warning signs:**
- Client portal shows empty data despite database having rows
- `SELECT * FROM tasks` returns 0 rows in RLS-enabled queries
- No permission denied errors — just empty results
- Query works with service_role but not with anon key

**Phase to address:** Phase 1 (Authentication & RLS Foundation) — must be resolved before any data access is built.

---

### Pitfall 2: Session Spoofing via Client-Side Cookie Manipulation

**What goes wrong:**
Next.js Server Components read user sessions from cookies. These cookies can be spoofed by anyone who modifies their browser cookies. If server-side authorization checks read session data without cryptographic verification, an attacker can impersonate any role (admin, team member, client) and access all data.

**Why it happens:**
Developers assume that because a cookie exists in a Server Component, it was legitimately set by Supabase. Next.js docs explicitly warn: "The server gets the user session from the cookies, which can be spoofed by anyone."

**How to avoid:**
Always verify the JWT signature server-side using `supabase.auth.getClaims()` instead of reading raw cookie data or using `supabase.auth.getSession()` in server code:
```typescript
// WRONG — no cryptographic verification
const { data: { session } } = await supabase.auth.getSession()

// CORRECT — validates JWT against Supabase's published public keys
const {
  data: { user },
} = await supabase.auth.getUser()

// In middleware:
const { data, error } = await supabase.auth.getClaims()
// This validates the JWT signature every time
```
Never trust `getSession()` in middleware or Server Components. Always use `getUser()` or `getClaims()` for server-side authorization decisions.

**Warning signs:**
- Authorization checks use `getSession()` in middleware or Server Components
- No JWT signature verification on server-side reads
- Role-based access decisions based solely on cookie presence
- `raw_user_meta_data` used for authorization decisions

**Phase to address:** Phase 1 (Authentication & RLS Foundation) — must be resolved before any protected routes.

---

### Pitfall 3: Stale JWT Tokens After Role/Metadata Changes

**What goes wrong:**
When an admin changes a team member's role, revokes access, or reassigns tasks, the JWT token held by the affected user's browser remains valid until it expires. The user continues operating under their old permissions. Similarly, when a client's project is updated, the client portal's token may not reflect the new data immediately.

**Why it happens:**
Supabase JWTs contain user metadata embedded at token generation time. Changes to `raw_app_meta_data` or profile data do not invalidate existing tokens — they only take effect on the next token refresh. JWT tokens are not always fresh.

**How to avoid:**
For role changes that require immediate effect:
1. Use short token expiry (default is 1 hour for Supabase — acceptable)
2. For immediate revocation, call `supabase.auth.signOut()` server-side using the service_role key with the user's session
3. For the client portal with magic-link slugs, revalidate the token on every page load since there's no persistent session

For this project specifically: when an admin modifies team member permissions, trigger a forced session refresh by invalidating the user's refresh token via the Auth Admin API.

**Warning signs:**
- Users report seeing old permissions after admin changes
- Role changes don't take effect until user manually refreshes
- No server-side mechanism to revoke active sessions
- Team members can still access data after being removed

**Phase to address:** Phase 2 (Team Management & Task Assignment) — needed when role changes become operational.

---

### Pitfall 4: RLS on UPDATE Without Matching SELECT Policy

**What goes wrong:**
A team member can upload a design file or update a task caption, but the operation fails or behaves unexpectedly. This happens because PostgreSQL requires both a `USING` policy (for the SELECT that reads the row before update) AND a `WITH CHECK` policy (for the new values) for UPDATE operations to work correctly. Having only one causes the UPDATE to silently fail or partially succeed.

**Why it happens:**
Developers create a single RLS policy per operation type. For UPDATE, Postgres needs two checks: the row must be visible to the user (USING) AND the new values must pass validation (WITH CHECK).

**How to avoid:**
Always define both clauses for UPDATE policies:
```sql
CREATE POLICY "Team members can update assigned tasks"
ON tasks
FOR UPDATE
TO authenticated
USING (
  -- Can only update tasks assigned to them
  assigned_to = auth.uid()
)
WITH CHECK (
  -- New values must still satisfy the same constraint
  assigned_to = auth.uid()
);
```
Also, `WITH CHECK` is critical for INSERT — it validates that newly created rows satisfy ownership constraints so a user can't insert a row they won't be able to see afterward.

**Warning signs:**
- UPDATE queries fail with "permission denied" despite SELECT working
- Task edits don't save for team members
- File uploads succeed but subsequent reads fail
- Inconsistent behavior between INSERT and UPDATE on the same table

**Phase to address:** Phase 2 (Team Management & Task Assignment) — when team member task editing is implemented.

---

### Pitfall 5: Unprotected Tables and Buckets — Missing RLS Enablement

**What goes wrong:**
Tables created via SQL migration scripts do not have RLS enabled automatically. If you create a table and forget `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`, the table is fully accessible to the `anon` role — anyone with your project's public `anon` key can read, modify, or delete all data. Similarly, Supabase Storage buckets default to public unless explicitly configured otherwise.

**Why it happens:**
Supabase's dashboard UI may enable RLS by default for tables created through the UI, but raw SQL scripts and migrations do not. Developers working locally with SQL don't encounter this, so it surfaces only in production. Storage buckets have a different default (public) that catches teams off guard.

**How to avoid:**
Every migration script must explicitly enable RLS:
```sql
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
);

-- ALWAYS include these two lines after table creation:
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "..." ON tasks FOR SELECT TO anon USING (...);
```
For storage buckets, explicitly set them to private and add RLS policies:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('design-files', 'design-files', false);

-- Then add storage RLS policies
CREATE POLICY "Only assigned team members can upload design files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'design-files'
  AND (auth.jwt() -> 'app_metadata' -> 'role')::text = '"team_member"'
);
```
Use Postgres event triggers to automatically enable RLS on new tables.

**Warning signs:**
- Migration files lack `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- Storage buckets created without `public = false`
- Tables work perfectly locally (supabase-js bypasses RLS with service_role) but leak data in production
- No RLS policies defined for a table at all

**Phase to address:** Phase 1 (Authentication & RLS Foundation) — every table and bucket must be secured from the start.

---

### Pitfall 6: Service Role Key Leaked to Client

**What goes wrong:**
The Supabase service_role key bypasses ALL RLS policies. If this key is exposed to the browser (via `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` or leaked in a Server Action response), anyone can read, modify, or delete all data in the database — RLS provides zero protection.

**Why it happens:**
Developers confuse the `anon` key (safe for browser, respects RLS) with the `service_role` key (bypasses RLS, server-only). Next.js environment variable prefixes make this easy to do accidentally: any variable prefixed with `NEXT_PUBLIC_` is embedded in the client bundle.

**How to avoid:**
- The service_role key must NEVER have a `NEXT_PUBLIC_` prefix
- Only use service_role in Server Actions and Route Handlers, and only for specific operations that genuinely need RLS bypass (e.g., the client portal slug validation)
- Audit all environment variables in production builds: `NEXT_PUBLIC_` should only contain `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Use Supabase Vault for the service_role key in production

**Warning signs:**
- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` exists in `.env` or `.env.local`
- Any Server Action returns the service_role key to the client
- Environment variables not properly scoped between client and server
- Bundle analysis reveals Supabase admin keys in client JavaScript

**Phase to address:** Phase 1 (Authentication & RLS Foundation) — must be verified before any code ships.

---

### Pitfall 7: N+1 Queries from Server Components Bypassing Efficient RLS Patterns

**What goes wrong:**
Server Components fetch data row-by-row instead of using set-based queries. Each task triggers a separate database call to check RLS, causing severe performance degradation. At scale (dozens of clients with monthly projects), this turns a single page load into hundreds of database queries.

**Why it happens:**
Next.js Server Components encourage component-level data fetching. Developers put `getTask(taskId)` inside a TaskCard component that renders in a loop. Postgres evaluates RLS policies per-row, but fetching one row at a time eliminates Postgres's ability to optimize.

**How to avoid:**
Fetch all data in a single query at the page level, not per component:
```typescript
// GOOD — single query, RLS evaluated efficiently
const { data: tasks } = await supabase
  .from('tasks')
  .select('*, client:clients(name), project:projects(month)')
  .eq('assigned_to', user.id)
  .order('posting_date')

// BAD — one query per task in a loop
tasks.map(task => <TaskCard id={task.id} />)
// Inside TaskCard: const { data } = await getTask(id)
```
Also, mirror RLS policy conditions in your client queries so Postgres can build efficient execution plans. Writing queries without explicit filters severely degrades speed since policies act as hidden WHERE clauses.

**Warning signs:**
- Page load times increase linearly with number of tasks
- Database query count visible in Supabase dashboard is in the hundreds for a single page
- TaskCard or similar components make individual database calls
- No `select()` with relations — instead, manual joins in application code

**Phase to address:** Phase 3 (Dashboard & Client Portal) — when multi-task, multi-client views are built.

---

### Pitfall 8: Next.js Caching Stale Data After Mutations

**What goes wrong:**
After an admin creates a task or a team member marks a task as done, the dashboard or client portal still shows the old state. Next.js 15's caching layer serves stale data because it doesn't know the underlying Supabase data changed.

**Why it happens:**
Next.js 15 caches Server Component responses and `fetch()` results by default. Server Actions that mutate data via Supabase do not automatically invalidate Next.js cache. The `revalidatePath()` call is easy to forget.

**How to avoid:**
Every Server Action that mutates Supabase data must explicitly revalidate:
```typescript
'use server'
import { revalidatePath } from 'next/cache'

export async function updateTaskStatus(taskId: string, status: string) {
  await supabase.from('tasks').update({ status }).eq('id', taskId)
  revalidatePath('/dashboard')
  revalidatePath('/team')
  // Or use revalidateTag for more granular control
  revalidateTag('tasks')
}
```
For the client portal accessed via slug, use `export const dynamic = 'force-dynamic'` on the page to disable caching entirely, since client data changes frequently and stale data is unacceptable.

**Warning signs:**
- Task status changes don't appear until hard refresh
- Admin creates a task but it doesn't show on dashboard
- Client portal shows outdated project status
- `revalidatePath` or `revalidateTag` missing from Server Actions

**Phase to address:** Phase 3 (Dashboard & Client Portal) — when real-time data accuracy matters.

---

### Pitfall 9: Magic Link Slug Collision and Predictability

**What goes wrong:**
The client portal uses unique slug URLs (e.g., `/portal/acme-corp`) for access without login. If slugs are predictable (company names, sequential IDs), an attacker can enumerate client portals and access other clients' project data. If slugs collide when two clients have similar names, one client sees another's data.

**Why it happens:**
Slugs based on company names are human-readable but predictable. Using auto-incrementing IDs or company names as slugs creates an enumeration attack surface. The project has no client authentication layer to fall back on — the slug is the ONLY access control.

**How to avoid:**
Use cryptographically random slugs, not company names:
```typescript
// Generate slug on client creation
import { randomBytes } from 'crypto'
const slug = randomBytes(16).toString('hex') // e.g., "a1b2c3d4e5f6..."
// Display as: /portal/a1b2c3d4e5f6 (still unique, not guessable)
```
Alternatively, use a shorter but still unpredictable format:
```typescript
// 8-character alphanumeric slug: ~218 trillion possibilities
const slug = Math.random().toString(36).substring(2, 10)
```
Add rate limiting on the slug validation endpoint to prevent brute-force enumeration. Validate the slug on every request, not just on initial page load.

**Warning signs:**
- Slugs are human-readable company names (e.g., `/portal/orca-digital-client`)
- No rate limiting on slug validation
- Slugs can be changed by clients or guessed
- No audit of who accessed which portal and when

**Phase to address:** Phase 1 (Authentication & RLS Foundation) — must be resolved before any client portal is accessible.

---

### Pitfall 10: Supabase Storage RLS Not Protecting Design Files

**What goes wrong:**
Design files uploaded to Supabase Storage are accessible to anyone with the file URL. Storage bucket RLS is separate from database RLS — having RLS on the `tasks` table does NOT protect the actual files stored in the storage bucket. A team member or client could access another client's design files by guessing or iterating file paths.

**Why it happens:**
Developers assume database RLS extends to storage objects. It does not. Supabase Storage has its own RLS system on the `storage.objects` table that must be configured independently. Additionally, public buckets serve files without any authentication check.

**How to avoid:**
1. Set all storage buckets to private (`public = false`)
2. Create RLS policies on `storage.objects` that mirror your database access control:
```sql
-- Only team members assigned to a task can access its design files
CREATE POLICY "Team members can access files for their assigned tasks"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'design-files'
  AND EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = (storage.foldername(name))[1]::uuid
    AND tasks.assigned_to = auth.uid()
  )
);
```
3. Generate signed URLs with short expiry for file downloads rather than making files publicly readable:
```typescript
const { data } = await supabase.storage
  .from('design-files')
  .createSignedUrl(filePath, 60) // 60 seconds
```

**Warning signs:**
- Storage bucket created with `public = true`
- No RLS policies on `storage.objects` table
- Direct file URLs are shareable and never expire
- File access not tied to task ownership or client association

**Phase to address:** Phase 2 (Team Management & Task Assignment) — when file upload/download is implemented.

---

### Pitfall 11: `raw_user_meta_data` Used for Authorization Decisions

**What goes wrong:**
Storing role information (admin, team_member, client) in `raw_user_meta_data` creates a vulnerability because this field can be modified by authenticated end users through profile update APIs. An attacker could elevate their own role from `team_member` to `admin`.

**Why it happens:**
Supabase's `raw_user_meta_data` is designed for user-settable profile information (display name, avatar). Developers use it for roles because it's the most convenient place to store user metadata accessible via `auth.jwt()`. Supabase docs explicitly warn: "this information can be modified by authenticated end users."

**How to avoid:**
Use `raw_app_meta_data` for authorization-critical data instead. Better yet, create a separate `profiles` table with RLS:
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  role text NOT NULL CHECK (role IN ('admin', 'team_member')),
  client_id uuid REFERENCES clients(id)
);

-- RLS: only admins can modify roles
CREATE POLICY "Only admins can manage roles"
ON profiles FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);
```
Then check roles via a `security definer` function rather than reading from JWT claims directly.

**Warning signs:**
- Role stored in `raw_user_meta_data`
- JWT claims used directly for authorization without database verification
- No database-level constraint on role values
- Team member registration flow allows self-assignment of roles

**Phase to address:** Phase 1 (Authentication & RLS Foundation) — role system must be secured before any user creation.

---

### Pitfall 12: Missing Database Indexes on RLS Policy Columns

**What goes wrong:**
As the number of tasks, clients, and team members grows, queries become progressively slower. Every RLS policy check triggers a full table scan because the columns used in policy expressions (`assigned_to`, `client_id`, etc.) lack indexes. At 1000+ tasks, dashboard queries that took 50ms now take 2+ seconds.

**Why it happens:**
Postgres RLS policies add implicit WHERE clauses. If the columns in those clauses aren't indexed, every query scans the entire table before the policy filters it down. This is invisible during development with small datasets.

**How to avoid:**
Add indexes on every column referenced in RLS policy expressions:
```sql
-- For policies that check assigned_to
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);

-- For policies that check client_id
CREATE INDEX idx_tasks_client_id ON tasks(client_id);

-- For storage object policies
CREATE INDEX idx_storage_objects_bucket_id ON storage.objects(bucket_id);
```
This is not premature optimization — it's required for RLS to perform correctly at any meaningful scale.

**Warning signs:**
- Queries slow down as data grows
- Supabase dashboard shows slow query warnings
- No indexes on foreign key columns or columns used in RLS policies
- Full table scans visible in `EXPLAIN ANALYZE` output

**Phase to address:** Phase 1 (Authentication & RLS Foundation) — indexes should be created alongside tables in migrations.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip RLS on "internal-only" tables | Faster initial development | Data leakage if table accidentally exposed to anon key | Never — all tables need RLS |
| Store roles in `raw_user_meta_data` | No extra table needed | Role escalation vulnerability; migration required later | Never for authorization-critical roles |
| Use company name as client portal slug | Human-readable URLs | Enumeration attack; rework when security is discovered | Never — use random slugs |
| Single `supabase` client instance everywhere | Simpler code | Session mixing between requests in server environment | Never — separate browser and server clients |
| Skip `revalidatePath()` after mutations | Less code to write | Stale data shown to users until cache expires naturally | Only for data that changes rarely |
| Use `getSession()` in middleware | Simpler code | No JWT verification; spoofable sessions | Never in server-side code |
| Public storage bucket for design files | Files accessible without signed URLs | Anyone with URL can access files; no audit trail | Only for truly public assets (logos, brand files) |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase + Next.js middleware | Calling `getSession()` instead of `getUser()` | Always use `getUser()` or `getClaims()` for cryptographic verification |
| Supabase + Next.js Server Components | Expecting Server Components to write cookies | Use middleware to write cookies; wrap `setAll` calls in try/catch in Server Components |
| Supabase + Next.js Server Components | Using a single Supabase client | Create separate browser client (singleton) and server client (per-request) |
| Supabase Storage | Assuming DB RLS protects files | Storage has separate RLS on `storage.objects` — configure independently |
| Next.js Server Actions | Forgetting `revalidatePath()` after mutations | Always revalidate affected paths and tags after data changes |
| Next.js + Supabase cookies | Missing cache-control headers on cookie responses | Set `Cache-Control: private, no-store` to prevent CDN session leakage |
| Supabase client portal | Using `anon` key for magic-link access | Use Server Action with service_role (scoped) to validate slug and return only permitted data |
| Team member invite tokens | Storing tokens in plain text | Hash tokens (like passwords) and use single-use with expiry |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| N+1 queries from component-level fetching | Page load degrades with each additional task | Fetch all data at page level, pass as props | ~20+ tasks per view |
| Missing indexes on RLS policy columns | Queries that were instant become slow | Index all columns in policy expressions at table creation | ~500+ rows per table |
| Large JWT tokens from embedding team memberships | Cookie size exceeds 4KB limit | Don't embed memberships in JWT; query profiles table instead | ~10+ teams per user |
| No `TO` clause on RLS policies | Every query checks policies for all roles | Use `TO authenticated` or `TO anon` to skip irrelevant policies | Any table with mixed authenticated/anon access |
| Unwrapped `auth.uid()` calls in policies | Per-row function evaluation overhead | Wrap as `(select auth.uid()) = user_id` | ~1000+ rows per query |
| Client portal with no cache strategy | Every page load hits database | Use `force-dynamic` for portal pages since data is small scale | Always — no caching at all |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` in env | Complete RLS bypass; full database access | Never prefix service_role with `NEXT_PUBLIC_` |
| No rate limiting on client portal slug validation | Brute-force enumeration of all client portals | Implement rate limiting (max 10 attempts per minute per IP) |
| Predictable client portal slugs | Easy enumeration of other clients' data | Use cryptographically random slugs (16+ hex chars) |
| Missing `WITH CHECK` on INSERT policies | Users can insert rows they can't see (orphan data) | Always define `WITH CHECK` for INSERT and UPDATE |
| Views without `security_invoker = true` | Views bypass RLS and expose all data | Set `security_invoker = true` on all views (Postgres 15+) |
| Security definer functions in public schema | Any user can call privileged functions | Place in private schema; restrict EXECUTE to specific roles |
| Team member invite tokens without expiry | Old invite links can be reused indefinitely | Set 48-hour expiry on tokens; single-use only |
| No audit of who accessed client portals | No visibility into unauthorized access attempts | Log all portal access attempts (can be deferred post-MVP) |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Team member registration flow unclear about one-time token | Token expires or is reused, team member can't register | Show clear error: "This invite link has expired or already been used" |
| Client portal slug is long random string | Clients can't remember or type their URL | Provide a short branded display name alongside the random slug |
| No loading states during Server Action mutations | Users think action failed and click again | Show optimistic UI or loading spinner during mutations |
| File download fails silently on expired signed URLs | Client sees broken download button | Regenerate signed URL on click; show clear error if permissions denied |
| Kanban/Calendar views load slowly on mobile (375px) | Abandoned by clients on phones | Use pagination or virtualization; lazy-load task cards |

## "Looks Done But Isn't" Checklist

- [ ] **RLS on all tables:** Table exists but `ENABLE ROW LEVEL SECURITY` was never called — verify with `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'`
- [ ] **RLS on storage buckets:** Database RLS is configured but `storage.objects` has no policies — verify bucket is private and policies exist
- [ ] **Server-side auth verification:** Middleware uses `getUser()` not `getSession()` — verify JWT is cryptographically validated
- [ ] **Service role key isolation:** `NEXT_PUBLIC_` prefix only on `SUPABASE_URL` and `SUPABASE_ANON_KEY` — verify bundle doesn't contain service_role
- [ ] **Cache invalidation:** Every Server Action with mutations calls `revalidatePath()` or `revalidateTag()` — verify no stale data after mutations
- [ ] **Slug randomness:** Client portal slugs are not guessable — verify slugs use random generation, not company names
- [ ] **Profile-based roles:** Roles stored in `profiles` table, not `raw_user_meta_data` — verify no role data in user metadata
- [ ] **WITH CHECK on INSERT/UPDATE:** All INSERT and UPDATE policies have both USING and WITH CHECK — verify no write-only policies missing checks
- [ ] **Indexes on RLS columns:** All columns in policy expressions have indexes — verify with `EXPLAIN ANALYZE` on filtered queries
- [ ] **Token expiry on signed URLs:** File download URLs expire within 60 seconds — verify `createSignedUrl` has short duration

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| RLS not enabled on tables | HIGH | Enable RLS, then add policies; brief outage during migration; audit all data access patterns |
| Service role key leaked | CRITICAL | Rotate keys immediately; audit all access logs; rotate all user sessions |
| Stale JWT after role change | MEDIUM | Force sign-out affected users via Auth Admin API; shorten token expiry going forward |
| Predictable slugs discovered | MEDIUM | Generate new random slugs for all clients; update redirect mappings; notify clients of new URLs |
| Missing storage RLS | HIGH | Set buckets to private; add storage RLS policies; regenerate all file access patterns |
| N+1 queries at scale | MEDIUM | Refactor to page-level data fetching; add missing indexes; no schema changes needed |
| Roles in raw_user_meta_data | HIGH | Migrate to profiles table; update all RLS policies; reissue JWTs for all users |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| RLS silent failures (Pitfall 1) | Phase 1 | Test all policies with `anon` role; verify null handling |
| Session spoofing (Pitfall 2) | Phase 1 | Attempt cookie manipulation; verify `getUser()` is used |
| Stale JWTs (Pitfall 3) | Phase 2 | Change role, verify immediate effect without manual refresh |
| UPDATE without SELECT policy (Pitfall 4) | Phase 2 | Test all CRUD operations for each role |
| Unprotected tables/buckets (Pitfall 5) | Phase 1 | Query `pg_tables` for missing RLS; verify bucket privacy |
| Service role leak (Pitfall 6) | Phase 1 | Audit env vars; analyze client bundle for exposed keys |
| N+1 queries (Pitfall 7) | Phase 3 | Monitor query count in Supabase dashboard per page load |
| Stale cache (Pitfall 8) | Phase 3 | Mutate data, verify immediate reflection without refresh |
| Slug predictability (Pitfall 9) | Phase 1 | Attempt to guess or enumerate valid slugs |
| Storage RLS missing (Pitfall 10) | Phase 2 | Access file URLs without auth; verify denied |
| Role in user metadata (Pitfall 11) | Phase 1 | Verify roles are in `profiles` table, not JWT claims |
| Missing indexes (Pitfall 12) | Phase 1 | Run `EXPLAIN ANALYZE` on policy-filtered queries |

## Sources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security) — HIGH confidence (official docs)
- [Supabase Next.js App Router Guide](https://supabase.com/docs/guides/auth/server-side/nextjs) — HIGH confidence (official docs)
- Supabase Storage Documentation — MEDIUM confidence (limited detail on specific storage RLS patterns)
- Next.js 15 App Router caching behavior — HIGH confidence (official Next.js documentation patterns)

---
*Pitfalls research for: Next.js 15 + Supabase project management & client portal*
*Researched: 2026-04-04*
