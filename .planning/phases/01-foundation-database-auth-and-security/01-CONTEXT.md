# Phase 1: Foundation — Database, Auth, and Security - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Secure database with correct RLS policies, working authentication for admin and team members, and global design system applied. This phase sets up the foundational infrastructure: database schema, Supabase SSR auth, admin login, team member invite registration, and design tokens.

</domain>

<decisions>
## Implementation Decisions

### Database schema details
- All tables have `created_at` and `updated_at` timestamps
- UUIDs for primary keys (recommended for Supabase)
- Hard delete (no soft deletes) — simpler for MVP
- Database-level foreign key constraints for referential integrity

### RLS policy granularity
- Team members can view client details (client name, slug) for tasks they're assigned to
- Team members cannot view other team members' profiles
- Team members can view comments on tasks they're assigned to
- Team members can view notifications (deviation from initial recommendation)

### Invite token lifecycle
- Tokens expire after 7 days
- Random string format (32 characters, cryptographically random)
- Show error page with clear message for invalid/expired tokens
- Tokens generated on admin click (when admin clicks 'Invite' button)

### Storage bucket configuration
- Maximum file size: 10MB
- Allowed file types: images only (.png, .jpg, .jpeg, .gif, .webp)
- Path structure: `{project_id}/{task_id}/{filename}`
- Direct signed URLs for admin and team member downloads (simpler, Supabase handles streaming)

### Claude's Discretion
- Exact database column definitions beyond required fields (e.g., additional metadata columns)
- Specific error message wording for token errors
- Implementation details of animated pulsing status dots (CSS keyframes)
- Exact mobile responsive breakpoints beyond 375px

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Database & Security Requirements
- `.planning/REQUIREMENTS.md` — DB-01 to DB-06 (database schema, RLS, storage), AUTH-01 to AUTH-08 (authentication flows), UI-01 to UI-05 (design system)
- `.planning/PROJECT.md` — Key decisions table, constraints (tech stack, design, mobile, auth, budget)

### Stack Patterns & Implementation Guide
- `.planning/research/STACK.md` — Supabase client setup (three-client pattern), RLS policy patterns, authentication patterns, file upload patterns, Server Actions pattern, version compatibility

### Design System Specifications
- `.planning/REQUIREMENTS.md` § UI-01 to UI-05 — Color values (#FFFFFF, #111111, #222222, #E5E5E5, #888888), Poppins font, status dot colors (#22C55E, #FACC15, #EF4444, #D1D5DB), no shadows/gradients, max 8px rounded corners, mobile responsive (375px)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No existing components/hooks/utilities — starting from scratch

### Established Patterns
- **Supabase three-client pattern**: `createServerClient` for server components/actions, `createBrowserClient` for client components, middleware for session refresh (from STACK.md)
- **RLS policy patterns**: Ownership-based (team members see assigned tasks), role-based (admin full access), user profile isolation (from STACK.md)
- **Authentication patterns**: Admin email/password via Server Actions, team member invite token registration, client portal slug-based access (from STACK.md)
- **File upload patterns**: Client-side upload for large files, server-side upload for validation, private bucket with signed URLs (from STACK.md)

### Integration Points
- Database schema connects to all future phases (admin CRUD, team workflow, client portal)
- Auth infrastructure protects admin and team routes (middleware)
- Storage bucket integrates with task creation (Phase 2) and client portal downloads (Phase 4)
- Design system tokens apply to all UI components across all phases

</code_context>

<specifics>
## Specific Ideas

No specific references or "I want it like X" moments from discussion.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-foundation-database-auth-and-security*
*Context gathered: 2026-04-04*