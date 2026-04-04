# Orca Digital — Project Management & Client Portal

## What This Is

An internal project management tool with a read-only client-facing portal for Orca Digital, a digital marketing agency. The agency manages monthly social media content projects for clients — each month is a "project" containing "tasks" (social media posts with captions, design files, and posting dates). Three user types: Admin (full control), Team Members (assigned tasks only), and Clients (read-only portal via magic link).

## Core Value

Admins can create and manage social media content tasks, assign them to team members, and give clients a clean read-only view of their project progress — all in one place.

## Requirements

### Validated

- [x] Admin can manage clients (create, view projects) — Phase 02
- [x] Admin can create projects per client (monthly social media content cycles) — Phase 02
- [x] Admin can create and manage tasks (posts with caption, design file, dates, briefing) — Phase 02
- [x] Admin can assign tasks to team members — Phase 02
- [x] Admin can view dashboard with project/task metrics — Phase 02
- [x] Admin can manage team members (invite, view assignments) — Phase 02
- [x] Admin can view and manage notifications — Phase 02/03
- [x] Team members register via one-time invite token — Phase 02
- [x] Team members see only their assigned tasks — Phase 03
- [x] Team members can upload design files and edit captions — Phase 03
- [x] Team members can mark tasks as done and notify admin — Phase 03
- [x] Supabase RLS enforces role-based data access — Phase 03
- [x] Admin authentication via email + password — Phase 01

### Active

- [ ] Team members can comment on tasks
- [ ] Client portal is accessible via unique slug URL (no login)
- [ ] Client portal shows active project with Kanban, Calendar, and Timeline views
- [ ] Client can view task details (caption, design file, posting date, status)

### Out of Scope

- Email notifications — app notifications only for MVP
- Direct social media integration — not needed; this is content management, not publishing
- Payment system — not part of agency workflow
- Client login/accounts — magic link via unique slug only
- Multiple admin accounts — single admin account is sufficient
- Activity log / audit trail — not needed for MVP
- Search functionality — deferred until scale demands it
- File versioning — single file per task is sufficient

## Context

- Monthly social media content projects — each project = one month for one client
- Tasks = individual social media posts with caption, design file, posting date
- Clients have three viewing modes: Kanban, Calendar (week + month), Timeline
- Status indicators: todo, in_progress, done, overdue (with animated pulsing dots)
- Briefing text supports clickable links
- Caption field always has a "Copy" button
- Design file always has a "Download" button

## Constraints

- **Tech stack**: Next.js 15 (App Router + API Routes + Server Actions), Tailwind CSS, shadcn/ui, Supabase (DB + Auth + Storage), Vercel hosting — mandated for consistency
- **Design**: Black and white only, Poppins font, no shadows, no gradients, no decorative elements, minimal rounded corners (max 8px) — strict brand guideline
- **Mobile**: Must work on 375px width screens — agency clients access via phone
- **Auth**: Supabase Auth with RLS — security requirement for team member data isolation
- **Budget**: No paid third-party services beyond Supabase and Vercel — keep costs minimal

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Supabase for DB + Auth + Storage | Single service covers all backend needs, generous free tier, excellent Next.js integration | Validated in Phase 02/03 — fully operational |
| Client portal via slug (no auth) | Reduces friction for clients, no password management needed | Pending Phase 04 |
| Team member invite tokens | One-time use tokens prevent unauthorized access without email service | Validated in Phase 02 — implemented |
| No email notifications | Avoids email service dependency for MVP; in-app notifications sufficient | Validated in Phase 03 — in-app notifications only |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-04 after Phase 03 completion — Team workspace with task dashboard, detail view, and notification workflows validated*
