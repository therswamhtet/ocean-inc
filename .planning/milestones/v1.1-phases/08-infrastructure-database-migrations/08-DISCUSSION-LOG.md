# Phase 08: Infrastructure & Database Migrations - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-05
**Phase:** 08-infrastructure-database-migrations
**Areas discussed:** Client fields, Username system, Migration strategy

---

## Client Description

| Option | Description | Selected |
|--------|-------------|----------|
| Optional textarea in create dialog | Textarea (max ~200 chars) in existing create form, editable on client detail page too | ✓ |
| Simple text input in create dialog | Single line text input alongside name field — more minimal | |
| Edit-only after creation | No description during creation — only on client detail page | |

**User's choice:** Optional textarea in create dialog
**Notes:** Editable later on client detail page as well. Max ~200 chars.

## Blocked Clients — Toggle Method

| Option | Description | Selected |
|--------|-------------|----------|
| Toggle on client card/detail | Toggle/switch on client card and client detail page — visual, direct | ✓ |
| Dropdown menu action | Add to client card's kebab menu — less prominent | |
| Bulk management modal | Dedicated modal with checkboxes for multiple at once | |

**User's choice:** Toggle on client card/detail

## Blocked Clients — Portal Access

| Option | Description | Selected |
|--------|-------------|----------|
| Portal shows blocked message | Portal accessible at slug but shows blocked banner | |
| 404-style blocked page | 403/Not Found — as if client doesn't exist | ✓ |
| Portal fully accessible | Blocking is admin-only flag, no client impact | |

**User's choice:** 404-style blocked page
**Notes:** Blocked clients should behave as if they don't exist from the portal side.

---

## Username Format

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-generated from name | System generates slug from name, user can change | |
| User-chosen unique handle | User picks @handle — unique constraint, validated for availability | ✓ |
| Display name field | Simple display name, no unique constraint | |

**User's choice:** User-chosen unique handle

## Username — Registration Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Separate step after signup | "Set your username" page after account creation | |
| On the invite landing page | Add username field to existing invite registration form | ✓ |
| Editable on profile page | Default from name, editable later | |

**User's choice:** On the invite landing page
**Notes:** Same form as name and password, not an additional step.

## Username — Task Assignment Display

| Option | Description | Selected |
|--------|-------------|----------|
| Username only in assignments | Show just @username in task assignments | ✓ |
| Real name with username subtitle | Real name primary, username secondary | |
| Username as mention tag | @username main, name on hover | |

**User's choice:** Username only in assignments
**Notes:** Social-media style — clean identifier, not real name.

## Username — Post-Registration Editing

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — profile settings page | Add profile section for username change with availability check | ✓ |
| Yes — via admin only | Admin changes it in team management UI | |
| Username is permanent | Once chosen, cannot be changed | |

**User's choice:** Yes — profile settings page

---

## Migration Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Single migration 012 | One migration adding all columns across both tables | ✓ |
| Separate migrations per concern | 012 for clients, 013 for team_members | |
| Add RLS review too | Full RLS policy review alongside new columns | |

**User's choice:** Single migration 012

## Existing Members Migration

| Option | Description | Selected |
|--------|-------------|----------|
| Nullable, prompt on next login | NULL initially, prompt to set on /team dashboard | ✓ |
| Auto-generate from name | Generate from existing names to avoid empty state | |
| Require via admin | Admin sets username for existing members | |

**User's choice:** Nullable, prompt on next login

---

## Deferred Ideas

None — discussion stayed within phase scope.
