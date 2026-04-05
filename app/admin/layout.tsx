import { redirect } from 'next/navigation'

import { logout } from '@/app/login/actions'
import { MobileNav } from '@/app/admin/mobile-nav'
import { AdminSidebar } from '@/app/admin/sidebar'
import { NotificationBell } from '@/components/admin/notification-bell'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

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

  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, message, created_at, read')
    .order('created_at', { ascending: false })
    .limit(10)

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-border bg-[#FAF8F0] lg:flex lg:flex-col">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Orca Digital</p>
          </div>
          <NotificationBell notifications={notifications} unreadCount={unreadCount} />
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
        <header className="sticky top-0 z-30 border-b border-border bg-[#FAF8F0] lg:hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Orca Digital</p>
            <div className="flex items-center gap-2">
              <NotificationBell notifications={notifications} unreadCount={unreadCount} />
              <MobileNav email={user.email ?? ''} />
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
