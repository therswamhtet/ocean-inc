'use client'

import { Menu } from 'lucide-react'
import Link from 'next/link'

import { AdminSidebar } from '@/app/admin/sidebar'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { LABELS } from '@/lib/labels'

export function MobileNav({ email, unreadCount }: { email: string; unreadCount?: number }) {
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
      <SheetContent side="left" className="w-60 bg-background p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="border-b border-border px-6 py-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Orca Digital</p>
        </div>

        <div className="flex-1 px-4 py-5">
          <AdminSidebar mobile />
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
