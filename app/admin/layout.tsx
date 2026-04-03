import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
    <div className="min-h-screen">
      <header className="border-b p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <h1 className="text-lg font-semibold">Orca Digital</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <form action={async () => {
              'use server'
              const supabase = await createClient()
              await supabase.auth.signOut()
              redirect('/login')
            }}>
              <button type="submit" className="text-sm underline">Sign Out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4">
        {children}
      </main>
    </div>
  )
}
