import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Phase 05 — Share Link Test (05-01-03)
 * Verifies: Share link generates absolute URLs and includes feedback mechanism.
 *
 * Checks:
 * 1. Share link uses window.location.origin for absolute URL generation
 * 2. URL includes /portal/ prefix with slug
 * 3. Clipboard write mechanism present
 * 4. "Copied" feedback with timeout mechanism
 * 5. aria-live region for accessibility
 */

describe('Phase 05: Share Link Absolute URLs', () => {
  const shareButtonPath = join(process.cwd(), 'components', 'admin', 'share-link-button.tsx')
  const content = readFileSync(shareButtonPath, 'utf-8')

  it('generates absolute URL using window.location.origin', () => {
    expect(content).toContain('window.location.origin')
  })

  it('includes /portal/ path with slug in generated URL', () => {
    expect(content).toContain('/portal/')
    expect(content).toContain('${slug}')
  })

  it('uses navigator.clipboard.writeText for copying', () => {
    expect(content).toContain('navigator.clipboard.writeText')
  })

  it('has "Copied" feedback state with 2000ms timeout', () => {
    expect(content).toContain('copied')
    expect(content).toContain('2000') // 2 second timeout
  })

  it('has aria-live region for accessibility feedback', () => {
    expect(content).toContain('aria-live')
  })

  it('share link button is used in clients page', () => {
    const clientsContent = readFileSync(join(process.cwd(), 'app', 'admin', 'clients', 'page.tsx'), 'utf-8')
    expect(clientsContent).toContain('ShareLinkButton')
    expect(clientsContent).toContain("from '@/components/admin/share-link-button'")
  })

  it('ShareLinkButton receives slug prop from client data', () => {
    const clientsContent = readFileSync(join(process.cwd(), 'app', 'admin', 'clients', 'page.tsx'), 'utf-8')
    expect(clientsContent).toContain('ShareLinkButton slug={')
  })
})
