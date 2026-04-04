import Link from 'next/link'

import { format } from 'date-fns'

import { CreateClientDialog } from './create-dialog'
import { deleteClientAction } from './actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

type ClientRow = {
  id: string
  name: string
  slug: string
  created_at: string
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
            <CardTitle>No clients yet</CardTitle>
            <CardDescription>Create your first client to start organizing monthly projects.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4">
          {clients.map((client) => (
            <Card key={client.id}>
              <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link href={`/admin/clients/${client.id}`} className="text-lg font-semibold underline-offset-4 hover:underline">
                      {client.name}
                    </Link>
                    <Badge>{client.activeProjectsCount} active projects</Badge>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>Slug: {client.slug}</span>
                    <span>Created {format(new Date(client.created_at), 'MMM d, yyyy')}</span>
                  </div>
                </div>

                <form action={deleteClientAction.bind(null, client.id)}>
                  <Button type="submit" variant="outline">
                    Delete
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
