'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { animate } from 'animejs'

function getColorForName(name: string): string {
  const CLIENT_PALETTE = ['#1A1A1A', '#4A4A4A', '#6B6B6B', '#8C8C8C', '#3D3D3D', '#525252', '#757575', '#999999']
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return CLIENT_PALETTE[Math.abs(hash) % CLIENT_PALETTE.length]
}

function monthName(m: number | null) {
  if (!m) return '—'
  return new Date(0, m - 1).toLocaleString('default', { month: 'short' })
}

type ProjectForDashboard = {
  id: string
  name: string
  month: number | null
  year: number | null
  status: string
  client_id: string
  clients: { id: string; name: string; color: string | null } | null
}

export function AnimatedProjectsGrid({ projects }: { projects: ProjectForDashboard[] }) {
  const gridRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (sectionRef.current) {
      animate(sectionRef.current, {
        opacity: [0, 1],
        translateY: [25, 0],
        duration: 600,
        delay: 200,
        ease: "out(3)",
      })
    }
  }, [])

  useEffect(() => {
    if (gridRef.current) {
      const cards = gridRef.current.children
      if (cards.length > 0) {
        animate(cards, {
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 500,
          delay: (_el: unknown, i: number) => 300 + i * 80,
          ease: "out(3)",
        })
      }
    }
  }, [projects])

  return (
    <section ref={sectionRef} style={{ opacity: 0 }}>
      <div className="mb-4">
        <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Active Projects
        </h3>
      </div>
      <div ref={gridRef} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const client = project.clients
          const color = client?.color || (client?.name ? getColorForName(client.name) : '#1A1A1A')

          return (
            <a
              key={project.id}
              href={`/admin/clients/${project.client_id}/projects/${project.id}`}
              className="group rounded-lg border border-border bg-surface p-4 transition hover:border-border-visible"
              style={{ opacity: 0 }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 h-8 w-1 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate group-hover:underline">
                    {project.name}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{monthName(project.month)} {project.year}</span>
                  </div>
                  {client && (
                    <p className="mt-1 text-xs text-muted-foreground truncate">{client.name}</p>
                  )}
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </section>
  )
}
