'use client'

import { useState, useTransition } from 'react'
import { ExternalLink, Trash2, MoreHorizontal, FolderKanban, Share2 } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { toggleClientStatusAction, deleteClientAction } from './actions'

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
  const [isActive, setIsActive] = useState(is_active)

  function handleToggle() {
    setIsActive(!isActive)
    startTransition(async () => {
      await toggleClientStatusAction(id)
    })
  }

  function handleDelete() {
    void deleteClientAction(id)
  }

  const portalUrl = typeof window !== 'undefined' ? `${window.location.origin}/portal/${slug}` : ''

  function handleCopyLink() {
    navigator.clipboard.writeText(portalUrl)
  }

  return (
    <div className={cn(
      'group relative rounded-xl border border-border bg-card overflow-hidden transition',
      !isActive && 'opacity-60',
      'hover:shadow-md hover:border-primary/20'
    )}>
      <div className="h-1" style={{ backgroundColor: color }} />

      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <Link href={`/admin/clients/${id}`} className="group/name">
              <h3 className="text-base font-semibold text-foreground group-hover/name:underline truncate">
                {name}
              </h3>
            </Link>
            <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
              <span className={cn(
                'inline-flex items-center gap-1',
                isActive ? 'text-green-600' : 'text-muted-foreground'
              )}>
                <span className={cn('h-1.5 w-1.5 rounded-full', isActive ? 'bg-green-500' : 'bg-gray-400')} />
                {isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="text-muted-foreground/30">·</span>
              <FolderKanban className="h-3 w-3" />
              <span>{activeProjectsCount} project{activeProjectsCount !== 1 ? 's' : ''}</span>
            </div>
            {description && (
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{description}</p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0 shrink-0 text-muted-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href={`/admin/clients/${id}`} className="cursor-pointer">
                  <FolderKanban className="mr-2 h-4 w-4" />
                  View projects
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/portal/${slug}`} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open portal
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
                <Share2 className="mr-2 h-4 w-4" />
                Copy portal link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleToggle} className="cursor-pointer">
                {isActive ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Link
            href={`/admin/clients/${id}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted/50"
          >
            <FolderKanban className="h-3.5 w-3.5" />
            Open
          </Link>
          <Link
            href={`/portal/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Portal
          </Link>
        </div>
      </div>
    </div>
  )
}