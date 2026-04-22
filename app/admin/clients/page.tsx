import { CreateClientDialog } from './create-dialog'
import { ClientPageContent } from './client-page-content'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

type ClientRow = {
  id: string
  name: string
  slug: string
  created_at: string
  color: string
  logo_path: string | null
  description: string | null
  is_active: boolean
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

  const serviceRoleClient = createServiceRoleClient()

  const { data, error } = await serviceRoleClient
    .from('clients')
    .select('id, name, slug, created_at, color, logo_path, description, is_active')
    .order('name', { ascending: true })
    .returns<ClientRow[]>()

  if (error) {
    throw new Error(error.message)
  }

  const { data: projectsData } = await serviceRoleClient
    .from('projects')
    .select('client_id, status')
    .eq('status', 'active')

  const projectCountByClient: Record<string, number> = {}
  for (const p of projectsData ?? []) {
    projectCountByClient[p.client_id] = (projectCountByClient[p.client_id] ?? 0) + 1
  }

  const clients = (data ?? []).map((client) => ({
    id: client.id,
    name: client.name,
    slug: client.slug,
    created_at: client.created_at,
    color: client.color,
    logo_path: client.logo_path,
    description: client.description,
    is_active: client.is_active,
    activeProjectsCount: projectCountByClient[client.id] ?? 0,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Clients</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {clients.length} client{clients.length !== 1 ? 's' : ''} — manage brands and their projects.
          </p>
        </div>
        <CreateClientDialog errorMessage={params.error} />
      </div>

      {params.created && (
        <div className="rounded-lg border border-[#4A9E5C]/20 bg-[#4A9E5C]/10 px-4 py-3 text-sm text-[#4A9E5C]">
          Client created successfully.
        </div>
      )}
      {params.deleted && (
        <div className="rounded-lg border border-border bg-surface-raised px-4 py-3 text-sm text-muted-foreground">
          Client deleted successfully.
        </div>
      )}

      <ClientPageContent clients={clients} />
    </div>
  )
}