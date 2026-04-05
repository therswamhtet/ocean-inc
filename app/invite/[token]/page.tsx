import { validateToken } from '@/lib/invite/validate'
import { InviteRegistrationForm } from './invite-registration-form'

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
            <InviteRegistrationForm
              token={token}
              email={validation.email}
              initialError={sp.error}
            />
          </>
        )}
      </div>
    </div>
  )
}
