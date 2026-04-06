'use client'

import { useState } from 'react'
import { CreateClientDialog } from './create-dialog'
import { ClientCard } from './client-card'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type ClientData = {
  id: string
  name: string
  slug: string
  created_at: string
  color: string
  activeProjectsCount: number
}

export function ClientPageContent({
  clients,
}: {
  clients: ClientData[]
}) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      {/* Hidden dialog */}
      <div className="hidden">
        <CreateClientDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>

      {/* Client list */}
      {clients.length === 0 ? (
        <EmptyState onCreate={() => setDialogOpen(true)} />
      ) : (
        <div className="grid gap-3">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              id={client.id}
              name={client.name}
              slug={client.slug}
              activeProjectsCount={client.activeProjectsCount}
              createdAt={client.created_at}
              color={client.color}
            />
          ))}
          {/* Inline add button */}
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-4 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            Add Client
          </button>
        </div>
      )}
    </>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed border-border">
      <p className="text-lg font-semibold text-muted-foreground">No clients yet</p>
      <p className="mt-1 text-sm text-muted-foreground/70">
        Create your first client to start organizing monthly projects.
      </p>
      <Button variant="outline" className="mt-4" onClick={onCreate}>
        <Plus className="h-4 w-4 mr-1.5" />
        Add Client
      </Button>
    </div>
  )
}
