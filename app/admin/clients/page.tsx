import { CreateClientDialog } from './create-dialog'
import { ClientCard } from './client-card'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { LABELS } from '@/lib/labels'

type ClientRow = {
  id: string
  name: string
  slug: string
  created_at: string
  color: string
  logo_path: string | null
  activeProjectsCount?: number
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

  // Use service role client for all queries to bypass RLS recursion issue
  // The admin policies have recursive EXISTS subqueries that cause infinite recursion
  const serviceRoleClient = createServiceRoleClient()

  // Fetch clients without join
  const { data, error } = await serviceRoleClient
    .from('clients')
    .select('id, name, slug, created_at, color, logo_path')
    .order('created_at', { ascending: false })
    .returns<ClientRow[]>()

  if (error) {
    throw new Error(error.message)
  }

  // Get project counts
  const { data: projectsData } = await serviceRoleClient
    .from('projects')
    .select('client_id, status')
    .eq('status', 'active')

  const projectCountByClient: Record<string, number> = {}
  for (const p of projectsData ?? []) {
    projectCountByClient[p.client_id] = (projectCountByClient[p.client_id] ?? 0) + 1
  }

  const clients = (data ?? []).map((client) => ({
    ...client,
    activeProjectsCount: projectCountByClient[client.id] ?? 0,
  }))

  return (
    <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Clients</h2>
          <p className="text-sm text-muted-foreground">
            Track every client and monitor active monthly projects in flight.
          </p>
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
