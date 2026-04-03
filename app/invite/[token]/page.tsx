import { validateToken } from '@/lib/invite/validate'
import { register } from './actions'

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { token } = await params
  const sp = await searchParams
  const validation = await validateToken(token)

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm p-6">
        <h1 className="text-2xl font-bold mb-2">Join Orca Digital</h1>

        {!validation.valid ? (
          <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
            {validation.error}
          </div>
        ) : (
          <>
            <p className="text-muted-foreground text-sm mb-6">
              Registering as: {validation.email}
            </p>
            {sp.error && (
              <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
                {sp.error}
              </div>
            )}
            <form action={register.bind(null, token)} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm mb-1">Full Name</label>
                <input id="name" name="name" type="text" required minLength={2} className="w-full border rounded p-2" />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm mb-1">Password</label>
                <input id="password" name="password" type="password" required minLength={8} className="w-full border rounded p-2" />
              </div>
              <button type="submit" className="w-full bg-primary text-primary-foreground p-2 rounded">Create Account</button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
