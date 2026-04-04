import { Bell, Menu } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { logout } from '@/app/login/actions'
import { AdminSidebar } from '@/app/admin/sidebar'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Query unread notification count for the bell badge
  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('read', false)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-border bg-white lg:flex lg:flex-col">
        <div className="border-b border-border px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Orca Digital</p>
              <h1 className="mt-2 text-lg font-semibold">Admin Console</h1>
            </div>
            <Link
              href="/admin/notifications"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-foreground transition hover:bg-muted/30"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {(unreadCount ?? 0) > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center px-1 text-[10px]"
                >
                  {unreadCount}
                </Badge>
              )}
            </Link>
          </div>
        </div>

        <div className="flex-1 px-4 py-5">
          <AdminSidebar />
        </div>

        <div className="border-t border-border px-6 py-4 text-sm">
          <p className="truncate text-foreground">{user.email}</p>
          <form action={logout} className="mt-3">
            <button type="submit" className="text-muted-foreground underline underline-offset-4 transition hover:text-foreground">
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 border-b border-border bg-white lg:hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Orca Digital</p>
              <h1 className="text-base font-semibold">Admin</h1>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/notifications"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-foreground transition hover:bg-muted/30"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {(unreadCount ?? 0) > 0 && (
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
              <SheetContent side="left" className="w-60 bg-white p-0">
                <div className="border-b border-border px-6 py-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Orca Digital</p>
                  <h1 className="mt-2 text-lg font-semibold">Admin Console</h1>
                </div>

                <div className="flex-1 px-4 py-5">
                  <AdminSidebar mobile />
                </div>

                <div className="border-t border-border px-6 py-4 text-sm">
                  <p className="truncate text-foreground">{user.email}</p>
                  <form action={logout} className="mt-3">
                    <button type="submit" className="text-muted-foreground underline underline-offset-4">
                      Sign Out
                    </button>
                  </form>
                </div>
              </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
