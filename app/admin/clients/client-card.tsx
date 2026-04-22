'use client'

import { useState, useTransition } from 'react'
import { ExternalLink, FolderKanban, Link2, Trash2 } from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { deleteClientAction } from './actions'

type ClientCardProps = {
  id: string
  name: string
  slug: string
  activeProjectsCount: number
  color: string
  description: string | null
  is_active: boolean
}

export function ClientCard({
  id,
  name,
  slug,
  activeProjectsCount,
  color,
  description,
  is_active,
}: ClientCardProps) {
  const [, startTransition] = useTransition()
  const [isActive] = useState(is_active)

  function handleDelete() {
    void deleteClientAction(id)
  }

  function handleCopyLink() {
    const portalUrl = typeof window !== 'undefined' ? `${window.location.origin}/portal/${slug}` : ''
    navigator.clipboard.writeText(portalUrl)
  }

  return (
    <div
      className={cn(
        'group relative rounded-lg border border-border bg-surface overflow-hidden transition-colors hover:border-border-visible',
        !isActive && 'opacity-50'
      )}
    >
      <div className="h-1" style={{ backgroundColor: color }} />

      <div className="p-5">
        {/* Name + status */}
        <Link href={`/admin/clients/${id}`} className="block">
          <h3 className="text-base font-semibold text-foreground group-hover:underline truncate">
            {name}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-center gap-2 text-xs">
          <span className={cn(
            'inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em]',
            isActive ? 'text-[#4A9E5C]' : 'text-muted-foreground'
          )}>
            <span className={cn('h-1.5 w-1.5 rounded-full', isActive ? 'bg-[#4A9E5C]' : 'bg-[#999999]')} />
            {isActive ? 'Active' : 'Inactive'}
          </span>
          <span className="text-muted-foreground/30">·</span>
          <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-[0.06em]">
            {activeProjectsCount} project{activeProjectsCount !== 1 ? 's' : ''}
          </span>
        </div>

        {description && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          <Link
            href={`/admin/clients/${id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-medium text-foreground transition hover:bg-surface-raised font-mono uppercase tracking-[0.06em]"
          >
            <FolderKanban className="h-3 w-3" />
            Open
          </Link>
          <Link
            href={`/portal/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition hover:bg-surface-raised hover:text-foreground font-mono uppercase tracking-[0.06em]"
          >
            <ExternalLink className="h-3 w-3" />
            Portal
          </Link>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-surface-raised hover:text-foreground"
              title="Copy portal link"
            >
              <Link2 className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete ${name}? This cannot be undone.`)) {
                  startTransition(() => handleDelete())
                }
              }}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-[#D71921]/5 hover:text-[#D71921] hover:border-[#D71921]/20"
              title="Delete client"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
