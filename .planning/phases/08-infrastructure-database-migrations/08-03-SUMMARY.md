---
plan: 08-03
phase: 08-infrastructure-database-migrations
completed: 2026-04-05
status: complete
---

# Plan 08-03: Portal Blocking for Inactive Clients

## What was built

Portal queries now filter out blocked clients so they return 404. getPortalDataBySlug includes .eq('is_active', true) filter.

## Key Files
- `lib/portal/queries.ts` — portal data query includes is_active filter
- `app/portal/[slug]/page.tsx` — shows 404 for blocked clients
- `app/portal/[slug]/layout.tsx` — layout updated if needed

## Decisions
Per D-08, D-09: portal behaves as if blocked client doesn't exist — no "you're blocked" message.
