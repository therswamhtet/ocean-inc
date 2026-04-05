import { CreateClientDialog } from './create-dialog'
import { ClientCard } from './client-card'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { LABELS } from '@/lib/labels'

type ClientRow = {
  id: string
  name: string
  slug: string
  created_at: string
  color: string
  logo_path: string | null
  projects: Array<{ id: string; status: string | null }> | null
}

type ClientsPageProps = {
  searchParams: Promise<{
    created?: string
    deleted?: string
    error?: string
  }>
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // LEFT JOIN projects and derive COUNT(projects.id) FILTER (WHERE projects.status = 'active') in JS.
  const { data, error } = await supabase
    .from('clients')
    .select('id, name, slug, created_at, projects!left(id, status)')
    .order('created_at', { ascending: false })
    .returns<ClientRow[]>()

  if (error) {
    throw new Error(error.message)
  }

  const clients = (data ?? []).map((client) => {
    const activeProjectsCount = (client.projects ?? []).filter((project) => project.status === 'active').length

    return {
      ...client,
      activeProjectsCount,
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-white p-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Clients</p>
          <div>
            <h2 className="text-2xl font-semibold">Client directory</h2>
            <p className="text-sm text-muted-foreground">
              Track every client and monitor how many active monthly projects are in flight.
            </p>
          </div>
        </div>

        <CreateClientDialog errorMessage={params.error} />
      </div>

      {params.created ? (
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
          Client created successfully.
        </div>
      ) : null}

      {params.deleted ? (
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
          Client deleted successfully.
        </div>
      ) : null}

      {clients.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{LABELS.emptyStates.noClients}</CardTitle>
            <CardDescription>Create your first client to start organizing monthly projects.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              id={client.id}
              name={client.name}
              slug={client.slug}
              activeProjectsCount={client.activeProjectsCount}
              createdAt={client.created_at}
              color={client.color}
              logoPath={client.logo_path}
            />
          ))}
        </div>
      )}
    </div>
  )
}
