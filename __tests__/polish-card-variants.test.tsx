import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { globSync } from 'glob'

/**
 * Phase 05 — ContentCard Consistency Test (05-04-01, 05-04-02)
 * Verifies: ContentCard component exists and is used appropriately.
 * Also verifies no "admin console" terminology remains.
 *
 * Checks:
 * 1. components/ui/content-card.tsx exists with correct interface
 * 2. ContentCard has all 4 variants: default, metric, kanban, mobile
 * 3. ContentCard uses cn utility for className merging
 * 4. No "admin console" or "Admin Console" text anywhere in the codebase
 * 5. Admin layout uses LABELS.common.adminPanel (not "Admin Console")
 */

describe('Phase 05: ContentCard Component Consistency', () => {
  describe('ContentCard component', () => {
    const cardPath = join(process.cwd(), 'components', 'ui', 'content-card.tsx')
    const content = readFileSync(cardPath, 'utf-8')

    it('ContentCard component exists', () => {
      expect(content).toContain('export function ContentCard')
    })

    it('ContentCard has all 4 variants', () => {
      expect(content).toContain("'default'")
      expect(content).toContain("'metric'")
      expect(content).toContain("'kanban'")
      expect(content).toContain("'mobile'")
    })

    it('ContentCard uses cn utility for className merging', () => {
      expect(content).toContain("from '@/lib/utils'")
      expect(content).toContain('cn(')
    })

    it('ContentCard has consistent base tokens (rounded-lg border border-border)', () => {
      expect(content).toContain("'rounded-lg border border-border transition'")
    })

    it('metric variant uses p-5 padding', () => {
      expect(content).toMatch(/metric:\s*'p-5'/)
    })

    it('kanban variant uses p-3 padding', () => {
      expect(content).toMatch(/kanban:\s*'p-3/)
    })

    it('mobile variant uses p-3 padding', () => {
      expect(content).toMatch(/mobile:\s*'p-3'/)
    })

    it('default variant uses p-4 padding with hover', () => {
      expect(content).toMatch(/default:\s*'p-4 hover:bg-muted\/30'/)
    })
  })

  describe('ContentCard integration', () => {
    it('ContentCard is exported and available for import', () => {
      const content = readFileSync(join(process.cwd(), 'components', 'ui', 'content-card.tsx'), 'utf-8')
      expect(content).toContain('export function ContentCard')
    })

    it('dashboard-inner.tsx metric cards match ContentCard metric variant tokens', () => {
      const content = readFileSync(join(process.cwd(), 'components', 'admin', 'dashboard-inner.tsx'), 'utf-8')
      // Dashboard uses 'rounded-lg border border-border p-5' which matches ContentCard metric variant
      expect(content).toContain("'rounded-lg border border-border p-5'")
    })
  })
})

describe('Phase 05: Terminology — No "admin console" text', () => {
  it('no hardcoded "Admin Console" exists in admin layout', () => {
    const content = readFileSync(join(process.cwd(), 'app', 'admin', 'layout.tsx'), 'utf-8')
    expect(content).not.toMatch(/["']Admin Console["']/)
  })

  it('no hardcoded "admin console" exists anywhere in app/', () => {
    const appFiles = globSync('app/**/*.{tsx,ts}', {
      cwd: process.cwd(),
      ignore: ['node_modules/**', '.next/**'],
    })

    for (const file of appFiles) {
      const content = readFileSync(join(process.cwd(), file), 'utf-8')
      expect(content).not.toMatch(/["']Admin Console["']/)
    }
  })

  it('no hardcoded "admin console" exists anywhere in components/', () => {
    const componentFiles = globSync('components/**/*.{tsx,ts}', {
      cwd: process.cwd(),
      ignore: ['node_modules/**', '.next/**'],
    })

    for (const file of componentFiles) {
      const content = readFileSync(join(process.cwd(), file), 'utf-8')
      expect(content).not.toMatch(/["']Admin Console["']/)
    }
  })

  it('admin layout uses LABELS.common.adminPanel for terminology', () => {
    const content = readFileSync(join(process.cwd(), 'app', 'admin', 'layout.tsx'), 'utf-8')
    expect(content).toContain('LABELS.common.adminPanel')
  })
})
