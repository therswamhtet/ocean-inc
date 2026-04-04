'use client'

import { Bell, Menu } from 'lucide-react'
import Link from 'next/link'

import { AdminSidebar } from '@/app/admin/sidebar'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { LABELS } from '@/lib/labels'

export function MobileNav({ email, unreadCount }: { email: string; unreadCount: number }) {
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/admin/notifications"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-foreground transition hover:bg-muted/30"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center px-1 text-[10px]"
          >
            {unreadCount}
          </Badge>
        )}
      </Link>

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
            <h1 className="mt-2 text-lg font-semibold">{LABELS.common.adminPanel}</h1>
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
    </div>
  )
}
