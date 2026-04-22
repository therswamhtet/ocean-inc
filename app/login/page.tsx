import { login } from './actions'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginAnimations } from './login-animations'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/admin')
  }

  const params = await searchParams

  return (
    <div className="relative flex min-h-screen items-center justify-center dot-grid-subtle">
      <div className="absolute right-4 top-4">
        <ThemeToggle size="sm" />
      </div>
      <LoginAnimations error={params.error} />
    </div>
  )
}
