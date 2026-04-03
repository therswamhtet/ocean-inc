import { login } from './actions'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm p-6">
        <h1 className="text-2xl font-bold mb-6">Orca Digital</h1>
        {params.error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            {params.error}
          </div>
        )}
        <form action={login} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm mb-1">Email</label>
            <input id="email" name="email" type="email" required className="w-full border rounded p-2" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm mb-1">Password</label>
            <input id="password" name="password" type="password" required className="w-full border rounded p-2" />
          </div>
          <button type="submit" className="w-full bg-primary text-primary-foreground p-2 rounded">Sign In</button>
        </form>
      </div>
    </div>
  )
}
