import { login } from './actions'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginAnimations } from './login-animations'

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
    <div className="flex min-h-screen items-center justify-center dot-grid-subtle">
      <LoginAnimations error={params.error} />
    </div>
  )
}
