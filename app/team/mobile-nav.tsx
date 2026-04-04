'use client'

import { Menu } from 'lucide-react'

import { TeamSidebar } from '@/app/team/sidebar'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'

export function TeamMobileNav({ email }: { email: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-border bg-white text-foreground"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-60 bg-white p-0">
        <div className="border-b border-border px-6 py-5">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Orca Digital</p>
          <h1 className="mt-2 text-lg font-semibold">Team Workspace</h1>
        </div>

        <div className="flex-1 px-4 py-5">
          <TeamSidebar mobile />
        </div>

        <div className="border-t border-border px-6 py-4 text-sm">
          <p className="truncate text-foreground">{email}</p>
          <form action="/login" method="POST" className="mt-3">
            <button type="submit" className="text-muted-foreground underline underline-offset-4">
              Sign Out
            </button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
