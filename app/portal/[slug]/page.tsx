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
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 bg-surface">
      <header className="flex items-center gap-3 space-y-2 rounded-lg border border-border p-5 bg-surface">
        <div className="h-5 w-1 flex-shrink-0 rounded-sm" style={{ backgroundColor: portalData.client.color }} />
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{portalData.client.name}</h1>
          {portalData.client.description && (
            <p className="text-sm text-muted-foreground">{portalData.client.description}</p>
          )}
        </div>
      </header>

      {portalData.activeProjects && portalData.activeProjects.length > 0 ? (
        portalData.activeProjects.map((project) => {
          const projectTasks = portalData.tasks.filter(
            (task) => task.projectId === project.id
          )
          return (
            <div key={project.id} className="space-y-4">
              <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{project.name}</h2>
              <PortalShell key={project.id} tasks={projectTasks} />
            </div>
          )
        })
      ) : (
        <section className="rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground">
            No active project yet. Contact your account manager to get started.
          </p>
        </section>
      )}

      {/* Orca Digital Info Footer */}
      <footer className="rounded-lg border border-border bg-surface-raised p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Orca Digital</p>
            <p className="text-sm text-foreground leading-relaxed">
              We are happy to help with your social media content. Reach out anytime for updates or questions.
            </p>
          </div>
          <div className="shrink-0 sm:text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Office Hours</p>
            <p className="mt-1 text-sm text-foreground">Tuesday — Saturday</p>
            <p className="text-sm text-muted-foreground">Off days: Sunday &amp; Monday</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
