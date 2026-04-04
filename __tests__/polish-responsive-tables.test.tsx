import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Phase 05 — Responsive Tables and Portal Tabs Test (05-02-03, 05-02-04)
 * Verifies: Table-to-card mobile patterns and portal tab responsiveness.
 *
 * Checks:
 * 1. Task list has desktop table hidden on mobile (md:block) and cards on mobile (md:hidden)
 * 2. Project list under client has same pattern
 * 3. Portal tabs stretch full-width on mobile, inline on desktop
 * 4. Portal tabs have 44px min touch targets
 */

describe('Phase 05: Responsive Tables and Portal Tabs', () => {
  describe('Task list responsive pattern', () => {
    const taskListPath = join(process.cwd(), 'components', 'admin', 'task-list.tsx')
    const content = readFileSync(taskListPath, 'utf-8')

    it('table hidden on mobile, shown at md+ breakpoint', () => {
      expect(content).toContain('md:block')
      expect(content).toContain('md:hidden')
    })

    it('mobile cards have same data fields as table columns', () => {
      expect(content).toContain('LABELS.task.postingDate')
      expect(content).toContain('LABELS.task.assignee')
      expect(content).toContain('LABELS.task.dueDate')
      expect(content).toContain('StatusDot')
    })

    it('mobile action buttons have min-h-[44px] touch targets', () => {
      expect(content).toContain('min-h-[44px]')
    })

    it('mobile buttons have Edit and Delete actions', () => {
      expect(content).toContain('Edit')
      expect(content).toContain('Delete')
    })
  })

  describe('Project list responsive pattern', () => {
    const clientPagePath = join(process.cwd(), 'app', 'admin', 'clients', '[clientId]', 'page.tsx')
    const content = readFileSync(clientPagePath, 'utf-8')

    it('table hidden on mobile, shown at md+ breakpoint', () => {
      expect(content).toContain('md:block')
      expect(content).toContain('md:hidden')
    })

    it('mobile project cards have consistent card tokens', () => {
      expect(content).toContain('rounded-lg border border-border')
    })
  })

  describe('Portal tabs responsive', () => {
    const portalShellPath = join(process.cwd(), 'components', 'portal', 'portal-shell.tsx')
    const content = readFileSync(portalShellPath, 'utf-8')

    it('portal tabs have responsive layout (full-width on mobile, inline on desktop)', () => {
      // Tabs should stretch full-width on mobile and be inline on larger screens
      expect(content).toContain('sm:inline-flex')
      expect(content).toContain('sm:w-auto')
    })

    it('portal tab buttons have min-h-[44px] touch targets', () => {
      expect(content.includes('min-h-[44px]')).toBe(true)
    })
  })

  describe('Team member list responsive pattern', () => {
    const teamPagePath = join(process.cwd(), 'app', 'admin', 'team', 'page.tsx')
    const content = readFileSync(teamPagePath, 'utf-8')

    it('team member table hidden on mobile, shown at md+ breakpoint', () => {
      expect(content).toContain('md:block')
      expect(content).toContain('md:hidden')
    })

    it('mobile team member cards have consistent card tokens', () => {
      expect(content).toContain('rounded-lg border border-border')
    })
  })
})
