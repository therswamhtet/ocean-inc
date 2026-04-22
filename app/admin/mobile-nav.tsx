'use client'

import { Menu } from 'lucide-react'

import { AdminSidebar } from '@/app/admin/sidebar'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export function MobileNav({ email }: { email: string; unreadCount?: number }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-border bg-surface text-foreground transition hover:bg-surface-raised"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-60 bg-surface p-0 border-r border-border">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="border-b border-border px-6 py-5">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Orca Digital
          </p>
        </div>

        <div className="flex-1 px-4 py-5">
          <AdminSidebar mobile />
        </div>

        <div className="border-t border-border px-6 py-4 text-sm">
          <p className="truncate text-foreground">{email}</p>
          <form action="/login" method="POST" className="mt-3">
            <button
              type="submit"
              className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
            >
              Sign Out
            </button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
