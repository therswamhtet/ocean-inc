# External Integrations

**Analysis Date:** 2026-04-07

## APIs & External Services

**Supabase PostgreSQL** — Primary data store
- Connection: `DATABASE_URL` env var (direct PostgreSQL to `db.asorhjaanlrmqgdsuogh.supabase.co:5432`)
- Client: `@supabase/supabase-js` 2.x
- Server: `lib/supabase/server.ts` — `createClient()` (RLS-aware) and `createServiceRoleClient()` (bypasses RLS)
- Browser: `lib/supabase/client.ts` — `createBrowserClient()`
- Middleware session: `lib/supabase/middleware.ts` — `updateSession()`

**Vercel** — Hosting platform
- API key: `VERCEL_API_KEY` env var
- Deployment: Automatic on main branch push (Next.js native integration)
- Project config: `.vercel/project.json`

**Supabase Storage** — File storage (design files)
- Bucket: `design-files` (private, 10MB limit, image types only)
- Migration: `supabase/migrations/003_storage.sql`
- Upload API: `app/api/admin/upload/route.ts` — POST endpoint, multipart form, <= 10MB images
- Upload component: `components/admin/design-file-uploader.tsx`

## Data Storage

**Tables** (defined in `supabase/migrations/`):
- `clients` — Client management (name, slug, color, description, is_active, logo)
- `projects` — Projects tied to clients (name, month, year, status)
- `tasks` — Content tasks (title, briefing, caption, design file path, posting date/time, due date, deadline, status)
- `team_members` — Team member registry (email, name, auth_id)
- `task_assignments` — Many-to-many join between tasks and team members
- `comments` — Comments on tasks
- `invite_tokens` — Invitations system (token, email, used, expires_at)
- `notifications` — Notification system (message, read flag)

**Migrations:** 14 files (`supabase/migrations/001_init` through `014_fix_admin_storage_policy.sql`)

**RLS Policies:** Row-Level Security throughout — `supabase/migrations/002_rls_policies.sql`, `009_fix_rls_recursion.sql`, `007_client_portal_read_policies.sql`, etc.

## Authentication & Identity

**Supabase Auth** — Cookie-based session management via `@supabase/ssr`
- Middleware auth guard: `middleware.ts` — routes under `/admin`, `/team` require authentication
- Public routes: `/login`, `/invite`, `/portal`
- Invite-based onboarding: `lib/invite/validate.ts`, `app/invite/[token]/`
- Login: `app/login/actions.ts` — email/password → role-based redirect
  - `team_member` → `/team`
  - other → `/admin`
- Service role client used for portal data lookup: `lib/portal/queries.ts` — bypasses RLS since portal is public

### OAuth Integrations
- Not detected

## Monitoring & Observability

**Error Tracking:** Not detected
**Analytics:** Not detected
**Logs:** Vercel stdout/stderr only — no dedicated logging service

## CI/CD & Deployment

**Hosting:**
- Vercel — Next.js app hosting
- Automatic deployment on main branch push

**CI Pipeline:** Not detected (no `.github/workflows/`, no `vercel.json`, no Dockerfile)

## Webhooks & Callbacks

**Incoming:** Not detected
**Outgoing:** Not detected

## Not Detected

- Payment processing (no Stripe, PayPal)
- Email service (no SendGrid, Resend, Mailgun)
- Analytics (no Google Analytics, PostHog, Mixpanel)
- Third-party API clients (no OpenAI, AWS, GitHub API)
- CI/CD pipeline (no GitHub Actions, Jenkins)
- i18n/internationalization library
- CMS (no Strapi, Sanity, Contentful)

---

*Integration audit: 2026-04-07*
*Update when adding/removing external services*
