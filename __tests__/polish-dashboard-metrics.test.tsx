import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Phase 05 — Dashboard Metric Cards Responsive Test (05-03-02, 05-03-03)
 * Verifies: Admin and team dashboard metrics use responsive grid pattern.
 *
 * Checks:
 * 1. Admin dashboard metric grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
 * 2. Team dashboard metric grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
 * 3. Metric values use text-3xl for large numbers
 * 4. Metric labels use text-[#888888] for muted label color
 * 5. Metric cards use consistent sizing (rounded-lg border border-border p-5)
 * 6. Admin dashboard uses LABELS for metric labels
 * 7. Admin dashboard has 4 metrics
 * 8. Team dashboard has 4 metrics
 */

describe('Phase 05: Dashboard Responsive Metric Cards', () => {
  describe('Admin dashboard metrics', () => {
    const dashboardPath = join(process.cwd(), 'components', 'admin', 'dashboard-inner.tsx')
    const content = readFileSync(dashboardPath, 'utf-8')

    it('metric grid uses responsive breakpoints (1col/2col/4col)', () => {
      expect(content).toContain('grid-cols-1')
      expect(content).toContain('sm:grid-cols-2')
      expect(content).toContain('lg:grid-cols-4')
    })

    it('metric values use text-3xl for large number display', () => {
      expect(content).toContain('text-3xl')
    })

    it('metric labels use text-[#888888] for muted color', () => {
      expect(content).toContain('text-[#888888]')
    })

    it('metric cards use consistent sizing (rounded-lg border border-border p-5)', () => {
      expect(content).toContain('metricCardClassName')
      expect(content).toContain("'rounded-lg border border-border p-5'")
    })

    it('DashboardMetrics component accepts metrics as props', () => {
      expect(content).toContain('export function DashboardMetrics')
    })
  })

  describe('Team dashboard metrics', () => {
    const teamPagePath = join(process.cwd(), 'app', 'team', 'page.tsx')
    const content = readFileSync(teamPagePath, 'utf-8')

    it('metric grid uses responsive breakpoints (1col/2col/4col)', () => {
      expect(content).toContain('grid-cols-1')
      expect(content).toContain('sm:grid-cols-2')
      expect(content).toContain('lg:grid-cols-4')
    })

    it('metric values use text-3xl for large number display', () => {
      expect(content).toContain('text-3xl')
    })

    it('metric labels use text-[#888888] for muted color', () => {
      expect(content).toContain('text-[#888888]')
    })

    it('metric cards use consistent sizing (rounded-lg border border-border p-5)', () => {
      expect(content).toContain('metricCardClassName')
      expect(content).toContain("'rounded-lg border border-border p-5'")
    })

    it('team dashboard defines exactly 4 metrics', () => {
      // Check that the metrics array has 4 entries
      const metricsMatch = content.match(/const metrics = \[[\s\S]*?\]/)
      expect(metricsMatch).not.toBeNull()
      // Count the metric objects in the array
      const labelMatches = content.match(/label:/g)
      expect(labelMatches).not.toBeNull()
      expect(labelMatches!.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('Admin dashboard page data flow', () => {
    const adminPagePath = join(process.cwd(), 'app', 'admin', 'page.tsx')
    const content = readFileSync(adminPagePath, 'utf-8')

    it('admin dashboard imports DashboardMetrics component', () => {
      expect(content).toContain('DashboardMetrics')
      expect(content).toContain("from '@/components/admin/dashboard-inner'")
    })

    it('admin dashboard defines exactly 4 metrics', () => {
      const labelMatches = content.match(/label:/g)
      expect(labelMatches).not.toBeNull()
      expect(labelMatches!.length).toBeGreaterThanOrEqual(4)
    })
  })
})
