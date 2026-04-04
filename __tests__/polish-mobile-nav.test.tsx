import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Phase 05 — Mobile Hamburger Navigation Test (05-02-01, 05-02-02)
 * Verifies: Admin and team sidebars have hamburger menu implementation for mobile.
 *
 * Checks:
 * 1. Admin layout has hamburger Menu icon trigger
 * 2. Admin mobile nav hidden at lg breakpoint, visible below
 * 3. Team layout has hamburger Menu icon trigger
 * 4. Team mobile nav hidden at lg breakpoint, visible below
 * 5. Both use Sheet component for slide-out panel
 * 6. Both have 44px min touch targets on hamburger button
 */

describe('Phase 05: Mobile Hamburger Navigation', () => {
  describe('Admin layout mobile nav', () => {
    const adminLayoutPath = join(process.cwd(), 'app', 'admin', 'layout.tsx')
    const content = readFileSync(adminLayoutPath, 'utf-8')

    it('imports Menu icon from lucide-react', () => {
      expect(content).toContain('Menu')
    })

    it('desktop sidebar hidden at mobile (< lg breakpoint)', () => {
      expect(content).toContain('lg:flex')
      expect(content).toContain('lg:flex-col')
    })

    it('hamburger button has Sheet component for slide-out panel', () => {
      expect(content).toContain('Sheet')
      expect(content).toContain('SheetTrigger')
      expect(content).toContain('SheetContent')
    })

    it('hamburger button has 44px minimum touch target', () => {
      expect(content).toContain('min-h-[44px]')
      expect(content).toContain('min-w-[44px]')
    })

    it('mobile header is hidden at lg+ breakpoint', () => {
      expect(content).toContain('lg:hidden')
    })

    it('mobile header contains Menu trigger button with aria-label', () => {
      expect(content).toContain('aria-label="Open navigation menu"')
    })
  })

  describe('Team layout mobile nav', () => {
    const teamLayoutPath = join(process.cwd(), 'app', 'team', 'layout.tsx')
    const content = readFileSync(teamLayoutPath, 'utf-8')

    it('imports Menu icon from lucide-react', () => {
      expect(content).toContain('Menu')
    })

    it('desktop sidebar hidden at mobile (< lg breakpoint)', () => {
      expect(content).toContain('lg:flex')
      expect(content).toContain('lg:flex-col')
    })

    it('hamburger button has Sheet component for slide-out panel', () => {
      expect(content).toContain('Sheet')
      expect(content).toContain('SheetTrigger')
      expect(content).toContain('SheetContent')
    })

    it('hamburger button has 44px minimum touch target', () => {
      expect(content).toContain('min-h-[44px]')
      expect(content).toContain('min-w-[44px]')
    })

    it('mobile header is hidden at lg+ breakpoint', () => {
      expect(content).toContain('lg:hidden')
    })

    it('mobile header contains Menu trigger button with aria-label', () => {
      expect(content).toContain('aria-label="Open navigation menu"')
    })
  })
})
