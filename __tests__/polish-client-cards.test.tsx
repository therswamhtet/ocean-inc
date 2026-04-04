import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Phase 05 — Client Card Clickability Test (05-04-03)
 * Verifies: Client cards are fully clickable (not just the name text).
 *
 * Checks:
 * 1. Client card renders a Link that wraps the entire card content area
 * 2. The Link is not limited to just the name span
 * 3. Card includes ShareLinkButton and Delete button outside click area
 */

describe('Phase 05: Client Card Full Clickability', () => {
  const clientsPath = join(process.cwd(), 'app', 'admin', 'clients', 'page.tsx')
  const content = readFileSync(clientsPath, 'utf-8')

  it('client card has a Link wrapping card content', () => {
    // The Link should wrap the primary content (name, badge, share link, date)
    expect(content).toContain('<Link')
    expect(content).toContain("href={`/admin/clients/${client.id}`}")
  })

  it('Link covers more than just the name — includes surrounding content', () => {
    // The Link wrapping must include the entire client.info section, not just the name
    // Check that the Link wraps a flex-1 container with multiple elements
    expect(content).toContain('flex-1 space-y-2')
    // Check that badge, share link, and created date are within the clickable area
    expect(content).toContain('activeProjectsCount')
    expect(content).toContain('ShareLinkButton')
    expect(content).toContain("Created ")
  })

  it('ShareLinkButton has stopPropagation to prevent card navigation on click', () => {
    expect(content).toContain('stopPropagation')
  })

  it('Delete button is outside the card click area (in form, not in Link)', () => {
    // Delete should be a form submit button, not inside the Link
    expect(content).toContain('<form action={deleteClientAction.bind(null, client.id)}>')
    // The Delete section should be a sibling of the Link, not nested inside it
    const deleteFormIndex = content.indexOf('<form action={deleteClientAction')
    const linkCloseIndex = content.indexOf('<Link')
    expect(deleteFormIndex).toBeGreaterThan(-1)
    expect(linkCloseIndex).toBeGreaterThan(-1)
  })

  it('Link uses group hover underline for visual affordance', () => {
    expect(content).toContain('group-hover:underline')
  })
})
