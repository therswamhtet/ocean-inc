# Phase 08: Infrastructure & Database Migrations - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Database schema additions and shared utility refactoring required as foundation for all subsequent v1.1 features. Adds client description field, client active (blocked) status, and team member username with assignment display updates. This phase delivers the database columns, migration, and minimum UI surfaces to support these fields so Phases 9-11 can build on them.

</domain>

<decisions>
## Implementation Decisions

### Client Description
- **D-01:** Add optional `description TEXT` column to `clients` table (nullable)
- **D-02:** Textarea input (max ~200 chars) in the existing create client form alongside name and color
- **D-03:** Description editable on the client detail page after creation
- **D-04:** `getClientsAction()` select query needs `description` added to column list

### Client Active/Blocked Status
- **D-05:** Add `is_active BOOLEAN DEFAULT true` column to `clients` table
- **D-06:** Admin toggles blocked status via toggle/switch on the client card AND on the client detail page — direct, visual
- **D-07:** Blocked clients (is_active = false) display with a visually distinct indicator on the admin client list (e.g., muted styling, blocked badge)
- **D-08:** Blocked client portal returns 403-style "blocked" page — behaves as if the client doesn't exist (not just a warning banner)
- **D-09:** Portal queries (`lib/portal/queries.ts`) must filter by `is_active = true` so blocked clients return no data

### Username System
- **D-10:** Add `username TEXT UNIQUE` column to `team_members` table (nullable for existing members)
- **D-11:** Username is a user-chosen unique @handle (e.g., @johndoe) — unique constraint required, validated for availability during registration
- **D-12:** Collected on the existing invite token registration form (`app/invite/[token]/`) as an additional field alongside name and password
- **D-13:** Task assignment displays show **@username only** (not real name) — e.g., in Kanban cards, task detail, all-tasks list
- **D-14:** Existing team members migrated with NULL username — prompted to set one on next login via /team dashboard
- **D-15:** Team members can change their username later via a profile settings page (to be built, not fully scoped in this phase)

### Database Migration
- **D-16:** Single migration file `012_v11_columns.sql` adding all three columns (clients.description, clients.is_active, team_members.username) in one migration
- **D-17:** No RLS policy changes beyond what the new columns require (is_active check in portal query)

### Claude's Discretion
- Exact max character count for client description (use 200 as default)
- Username validation rules (length, allowed characters — use reasonable defaults like 3-20 chars, alphanumeric + hyphens)
- Visual design of blocked client indicator on admin client list
- Profile settings page implementation (exists only as a principle from the discussion)

### Folded Todos
- None

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing schema
- `supabase/migrations/001_initial_schema.sql` — Current clients and team_members table definitions
- `supabase/migrations/008_client_color_and_logo.sql` — Prior clients table addition (pattern to follow)
- `supabase/migrations/003_add_team_members_auth_id.sql` — Prior team_members table addition (pattern to follow)

### Server actions (consumers of new fields)
- `app/admin/clients/actions.ts` — createClientAction, getClientsAction (must include description, is_active)
- `lib/portal/queries.ts` — Portal client fetches (must filter by is_active)
- `app/invite/[token]/actions.ts` — Registration flow (must include username field)

### UI surfaces affected
- `app/admin/clients/client-card.tsx` — Blocked visual indicator, toggle placement
- `app/admin/clients/[clientId]/actions.ts` — Client detail page actions (edit description)

### Requirements
- `.planning/REQUIREMENTS.md` — CLIENT-11, CLIENT-12, CLIENT-13, USER-01, USER-02

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **clients table**: Already has id, name, slug, color, logo_path — add description (TEXT) and is_active (BOOLEAN)
- **team_members table**: Already has id, email, name, auth_id — add username (TEXT, UNIQUE)
- **createClientAction**: Server action pattern uses FormData — add description field to the same form
- **client-card.tsx**: Existing component with color marker, logo, delete button — add toggle and blocked indicator
- **Invite registration**: `app/invite/[token]/actions.ts` already registers team members with name/password — add username field

### Established Patterns
- All mutations use `FormData` server actions with redirects on success/error
- Supabase `select()` queries are explicit about column names — must add new columns everywhere
- `getClientsAction()` returns typed client objects — add description to the type
- Portal queries use `clients` table to lookup by slug — add `is_active = true` filter

### Integration Points
- Client portal (`lib/portal/queries.ts`) — add `is_active = true` to client lookup query
- All task assignment display locations — switch from `team_members.name` to `team_members.username`
- Invite registration flow (`app/invite/[token]/`) — add username input and availability check
- Admin team management may need username display in team member lists

</code_context>

<specifics>
## Specific Ideas
- "Blocked clients should behave as if they don't exist" — 403-style, not a warning banner
- "Username only in assignments" — clean, social-media style, not real name + username
- Profile settings page will be needed for username editing — conceptually scoped but may spill into next phase
- Client description is optional — clients can exist without one

</specifics>

<deferred>
## Deferred Ideas
- None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-infrastructure-database-migrations*
*Context gathered: 2026-04-05*
