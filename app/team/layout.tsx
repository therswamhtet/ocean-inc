import { redirect } from 'next/navigation'

import { logout } from '@/app/login/actions'
import { TeamMobileNav } from '@/app/team/mobile-nav'
import { TeamSidebar } from '@/app/team/sidebar'
import { createClient } from '@/lib/supabase/server'

export default async function TeamLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  if (user.app_metadata.role !== 'team_member') {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-border bg-white lg:flex lg:flex-col">
        <div className="border-b border-border px-6 py-5">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Orca Digital</p>
          <h1 className="mt-2 text-lg font-semibold">Team Workspace</h1>
        </div>

        <div className="flex-1 px-4 py-5">
          <TeamSidebar />
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
              <h1 className="text-base font-semibold">Team</h1>
            </div>

            <TeamMobileNav email={user.email ?? ''} />
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
