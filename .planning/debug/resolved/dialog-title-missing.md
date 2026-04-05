---
status: verifying
trigger: "Console error: DialogContent requires a DialogTitle for accessibility. Error occurs in components/ui/sheet.tsx used by app/admin/mobile-nav.tsx"
created: 2026-04-05T00:00:00Z
updated: 2026-04-05T00:00:00Z
---

## Current Focus

hypothesis: SheetContent in mobile-nav.tsx is missing SheetTitle, causing Radix UI accessibility warning
test: Applied fix by adding sr-only SheetTitle to mobile-nav.tsx
expecting: Console error should disappear when Sheet is rendered
next_action: Verify fix resolves the accessibility warning

## Symptoms

expected: Sheet component should render without console warnings/errors
actual: Console error: "DialogContent requires a DialogTitle for the component to be accessible for screen reader users."
errors: |
  `DialogContent` requires a `DialogTitle` for the component to be accessible for screen reader users.
  
  If you want to hide the `DialogTitle`, you can wrap it with our VisuallyHidden component.
  
  For more information, see https://radix-ui.com/primitives/docs/components/dialog
  
  at _c1 (components/ui/sheet.tsx:46:5)
  at _c1 (components/ui/sheet.tsx:44:3)
  at MobileNav (app/admin/mobile-nav.tsx:27:7)
  at AdminLayout (app/admin/layout.tsx:46:13)
reproduction: Open the admin page, the MobileNav component renders a Sheet without a SheetTitle, triggering the Radix UI accessibility warning.
started: Issue is present in current codebase - SheetContent is used in mobile-nav.tsx without SheetTitle

## Eliminated

## Evidence

- timestamp: 2026-04-05
  checked: components/ui/sheet.tsx
  found: SheetTitle component is exported (lines 69-75) and is built on top of SheetPrimitive.Title from Radix UI
  implication: SheetTitle is available and should be used with SheetContent

- timestamp: 2026-04-05
  checked: app/admin/mobile-nav.tsx
  found: SheetContent is used at line 27 without SheetTitle. Currently imports Sheet, SheetContent, SheetTrigger only.
  implication: Missing SheetTitle causes Radix UI accessibility warning

- timestamp: 2026-04-05
  checked: sheet.tsx line 58
  found: Code already uses `sr-only` class for accessibility text ("Close" button)
  implication: Can use Tailwind's `sr-only` class to visually hide SheetTitle while keeping it accessible

## Resolution

root_cause: SheetContent component in mobile-nav.tsx doesn't include SheetTitle, which is required by Radix UI Dialog primitive for accessibility
fix: Added SheetTitle with sr-only class to SheetContent in mobile-nav.tsx. The title "Navigation Menu" is accessible to screen readers but visually hidden.
verification: Fix applied - SheetTitle now included inside SheetContent
files_changed: ["app/admin/mobile-nav.tsx"]
