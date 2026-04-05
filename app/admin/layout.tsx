import { redirect } from 'next/navigation'

import { logout } from '@/app/login/actions'
import { MobileNav } from '@/app/admin/mobile-nav'
import { AdminSidebar } from '@/app/admin/sidebar'
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-border bg-white lg:flex lg:flex-col">
        <div className="border-b border-border px-6 py-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Orca Digital</p>
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
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Orca Digital</p>

            <MobileNav email={user.email ?? ''} />
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
