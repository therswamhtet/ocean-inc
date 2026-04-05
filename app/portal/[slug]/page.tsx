import { notFound } from 'next/navigation'

import { PortalShell } from '@/components/portal/portal-shell'
import { getPortalDataBySlug } from '@/lib/portal/queries'

export const dynamic = 'force-dynamic'

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const portalData = await getPortalDataBySlug(slug)

  if (!portalData) {
    notFound()
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2 rounded-lg border border-border p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Client portal</p>
        <h1 className="text-2xl font-semibold text-foreground">{portalData.client.name}</h1>
      </header>

      {portalData.activeProject ? (
        <>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">{portalData.activeProject.name}</h2>
            <p className="text-sm text-muted-foreground">Read-only project timeline and task progress.</p>
          </div>

          <PortalShell tasks={portalData.tasks} />
        </>
      ) : (
        <section className="rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground">
            No active project yet. Contact your account manager to get started.
          </p>
        </section>
      )}
    </div>
  )
}
