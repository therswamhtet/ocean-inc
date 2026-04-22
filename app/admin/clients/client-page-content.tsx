'use client'

import { useState, useEffect, useRef } from 'react'
import { CreateClientDialog } from './create-dialog'
import { ClientCard } from './client-card'
import { Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { animate } from 'animejs'

export type ClientData = {
  id: string
  name: string
  slug: string
  created_at: string
  color: string
  description: string | null
  activeProjectsCount: number
  is_active: boolean
}

export function ClientPageContent({
  clients,
}: {
  clients: ClientData[]
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const activeRef = useRef<HTMLDivElement>(null)
  const inactiveRef = useRef<HTMLDivElement>(null)

  const activeClients = clients.filter((c) => c.is_active)
  const inactiveClients = clients.filter((c) => !c.is_active)

  useEffect(() => {
    // Animate active client cards
    if (activeRef.current) {
      const cards = activeRef.current.children;
      if (cards.length > 0) {
        animate(cards, {
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 500,
          delay: (_el: unknown, i: number) => i * 80,
          ease: "out(3)",
        });
      }
    }
  }, [activeClients.length]);

  useEffect(() => {
    // Animate inactive client cards
    if (inactiveRef.current) {
      const cards = inactiveRef.current.children;
      if (cards.length > 0) {
        animate(cards, {
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 500,
          delay: (_el: unknown, i: number) => 200 + i * 80,
          ease: "out(3)",
        });
      }
    }
  }, [inactiveClients.length]);

  return (
    <>
      <div className="hidden">
        <CreateClientDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>

      {clients.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
          <Users className="h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 text-lg font-medium text-foreground">No clients yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first client to start organizing projects.
          </p>
          <Button className="mt-4" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {activeClients.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Active · {activeClients.length}
                </h3>
              </div>
              <div ref={activeRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activeClients.map((client) => (
                  <div key={client.id} style={{ opacity: 0 }}>
                    <ClientCard
                      id={client.id}
                      name={client.name}
                      slug={client.slug}
                      activeProjectsCount={client.activeProjectsCount}
                      color={client.color}
                      description={client.description}
                      is_active={client.is_active}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {inactiveClients.length > 0 && (
            <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Inactive · {inactiveClients.length}
              </h3>
              <div ref={inactiveRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {inactiveClients.map((client) => (
                  <div key={client.id} style={{ opacity: 0 }}>
                    <ClientCard
                      id={client.id}
                      name={client.name}
                      slug={client.slug}
                      activeProjectsCount={client.activeProjectsCount}
                      color={client.color}
                      description={client.description}
                      is_active={client.is_active}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  )
}
