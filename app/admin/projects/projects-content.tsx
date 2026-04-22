'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { animate } from 'animejs'
import { cn } from '@/lib/utils'

type ProjectData = {
  id: string
  name: string
  month: number | null
  year: number | null
  status: string
  client_id: string
  clients: {
    id: string
    name: string
    color: string | null
  } | null
  color: string
  config: { label: string; dot: string }
  monthName: string
}

type ProjectsContentProps = {
  activeProjects: ProjectData[]
  otherProjects: ProjectData[]
  hasProjects: boolean
}

export function ProjectsContent({ activeProjects, otherProjects, hasProjects }: ProjectsContentProps) {
  const activeRef = useRef<HTMLDivElement>(null)
  const otherRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (headerRef.current) {
      animate(headerRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        ease: "out(3)",
      })
    }
  }, [])

  useEffect(() => {
    if (activeRef.current) {
      const cards = activeRef.current.children
      if (cards.length > 0) {
        animate(cards, {
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 500,
          delay: (_el: unknown, i: number) => 150 + i * 80,
          ease: "out(3)",
        })
      }
    }
  }, [activeProjects.length])

  useEffect(() => {
    if (otherRef.current) {
      const items = otherRef.current.querySelectorAll('.project-row')
      if (items.length > 0) {
        animate(items, {
          opacity: [0, 1],
          translateX: [-20, 0],
          duration: 400,
          delay: (_el: unknown, i: number) => 300 + i * 60,
          ease: "out(3)",
        })
      }
    }
  }, [otherProjects.length])

  return (
    <div className="space-y-6">
      <div ref={headerRef} className="rounded-lg border border-border bg-surface p-6" style={{ opacity: 0 }}>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Projects</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          All projects across clients. Click a project to manage its tasks.
        </p>
      </div>

      {activeProjects.length > 0 && (
        <section>
          <h3 className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Active ({activeProjects.length})
          </h3>
          <div ref={activeRef} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeProjects.map((project) => {
              const client = project.clients

              return (
                <Link
                  key={project.id}
                  href={`/admin/clients/${project.client_id}/projects/${project.id}`}
                  className="group rounded-lg border border-border bg-surface p-4 transition hover:border-border-visible"
                  style={{ opacity: 0 }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 h-8 w-1 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate group-hover:underline">
                        {project.name}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <span className={`h-1.5 w-1.5 rounded-full ${project.config.dot}`} />
                          {project.config.label}
                        </span>
                        <span> &middot; </span>
                        <span>{project.monthName} {project.year}</span>
                      </div>
                      {client && (
                        <p className="mt-1 text-xs text-muted-foreground truncate">{client.name}</p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {otherProjects.length > 0 && (
        <section>
          <h3 className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Other ({otherProjects.length})
          </h3>
          <div className="rounded-lg border border-border bg-surface">
            <div ref={otherRef} className="divide-y divide-border">
              {otherProjects.map((project) => {
                const client = project.clients

                return (
                  <Link
                    key={project.id}
                    href={`/admin/clients/${project.client_id}/projects/${project.id}`}
                    className="project-row group flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-surface-raised"
                    style={{ opacity: 0 }}
                  >
                    <div
                      className="h-4 w-1 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="flex-1 font-medium text-foreground truncate group-hover:underline">
                      {project.name}
                    </span>
                    <span className="hidden sm:inline text-xs text-muted-foreground">
                      {project.monthName} {project.year}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <span className={`h-1.5 w-1.5 rounded-full ${project.config.dot}`} />
                      {project.config.label}
                    </span>
                    {client && (
                      <span className="hidden md:inline text-xs text-muted-foreground truncate max-w-24">
                        {client.name}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {!hasProjects && (
        <div className="rounded-lg border border-dashed border-border px-5 py-10 text-center">
          <p className="text-lg font-medium text-foreground">No projects yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a client first, then add projects.
          </p>
        </div>
      )}
    </div>
  )
}
