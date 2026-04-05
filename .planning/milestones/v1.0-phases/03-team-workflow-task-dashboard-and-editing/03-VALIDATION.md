---
phase: 03
slug: team-workflow-task-dashboard-and-editing
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-04
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | other — ESLint + Next.js build + targeted Node verification script |
| **Config file** | `eslint.config.*` / Next.js default config; no dedicated test runner |
| **Quick run command** | `npx eslint <touched-files>` |
| **Full suite command** | `npm run build && node scripts/verify-team-rls.ts` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx eslint <touched-files>`
- **After every plan wave:** Run `npm run build`
- **Before `/gsd-verify-work`:** `npm run build && node scripts/verify-team-rls.ts`
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | TEAM-01, TEAM-02 | lint/build | `npx eslint app/page.tsx app/login/actions.ts app/team/layout.tsx app/team/sidebar.tsx` | ✅ | ⬜ pending |
| 03-01-02 | 01 | 1 | TEAM-01, TEAM-02 | build | `npm run build` | ✅ | ⬜ pending |
| 03-02-01 | 02 | 2 | TEAM-03, TEAM-04, TEAM-05, TEAM-08 | lint | `npx eslint app/team/tasks/actions.ts app/team/tasks/[taskId]/page.tsx app/team/tasks/[taskId]/task-detail-form.tsx` | ✅ | ⬜ pending |
| 03-02-02 | 02 | 2 | TEAM-03, TEAM-04, TEAM-05, TEAM-08 | build | `npm run build` | ✅ | ⬜ pending |
| 03-03-01 | 03 | 3 | TEAM-06, NOTIF-01, NOTIF-02 | lint/grep | `npx eslint app/team/tasks/actions.ts app/team/tasks/[taskId]/task-detail-form.tsx && rg -n "team_insert_notifications|team_member_id IS NULL" supabase/migrations` | ✅ | ⬜ pending |
| 03-03-02 | 03 | 3 | TEAM-06, NOTIF-01, NOTIF-02 | build | `npm run build` | ✅ | ⬜ pending |
| 03-04-01 | 04 | 1 | NOTIF-03, NOTIF-04, NOTIF-05 | lint | `npx eslint app/admin/layout.tsx app/admin/notifications/actions.ts` | ✅ | ⬜ pending |
| 03-04-02 | 04 | 1 | NOTIF-04 | build | `npm run build` | ✅ | ⬜ pending |
| 03-05-01 | 05 | 4 | TEAM-07 | script | `node scripts/verify-team-rls.ts` | ✅ | ⬜ pending |
| 03-05-02 | 05 | 4 | TEAM-07 | build+script | `npm run build && node scripts/verify-team-rls.ts` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Team task editing UX at 375px width | TEAM-03, TEAM-04, TEAM-05, TEAM-08 | Responsive layout and upload interaction are visual | Open `/team` and `/team/tasks/[taskId]` at 375px width, confirm card/list stack, copy button, uploader, and status control remain usable |
| Notify confirmation dialog wording and clarity | TEAM-06 | Dialog interaction/content is UX-specific | Open a team task, click **Notify Assigner**, confirm dialog text names the action and cancel/confirm both work |
| Admin bell badge visibility | NOTIF-04 | Badge placement is visual | Trigger an unread notification, open any `/admin` page, confirm bell icon shows unread count badge |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
