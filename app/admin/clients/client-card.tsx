'use client'

import { useState, useTransition } from 'react'
import { ExternalLink, Trash2, EllipsisVertical, Share2 } from 'lucide-react'
import Link from 'next/link'

import { format } from 'date-fns'

import { ShareLinkButton } from '@/components/admin/share-link-button'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { toggleClientStatusAction, deleteClientAction } from './actions'

type ClientCardProps = {
  id: string
  name: string
  slug: string
  activeProjectsCount: number
  createdAt: string
  color: string
}

export function ClientCard({
  id,
  name,
  slug,
  activeProjectsCount,
  createdAt,
  color,
}: ClientCardProps) {
  const [isPending, startTransition] = useTransition()
  const [isActiveLocal, setIsActiveLocal] = useState(true)

  function handleDelete() {
    void deleteClientAction(id)
  }

  function handleToggle(checked: boolean) {
    setIsActiveLocal(checked)
    startTransition(async () => {
      await toggleClientStatusAction(id)
    })
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-6',
        !isActiveLocal && 'opacity-60'
      )}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: client info */}
        <div className="space-y-3">
          {/* Name row */}
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="h-5 w-1.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            <Link
              href={`/admin/clients/${id}`}
              className="text-xl font-semibold text-foreground underline-offset-4 hover:underline"
            >
              {name}
            </Link>
            <span className="rounded-md border border-border px-2.5 py-0.5 text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
              {activeProjectsCount} active project{activeProjectsCount !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            <span>Created {format(new Date(createdAt), 'MMM d, yyyy')}</span>

            <ShareLinkButton slug={slug} />

            <Link
              href={`/portal/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View portal
            </Link>
          </div>
        </div>

        {/* Right: toggle + actions */}
        <div className="flex items-center gap-3 self-end border-t border-border pt-4 sm:border-t-0 sm:pt-0 sm:self-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active</span>
            <Switch checked={isActiveLocal} onCheckedChange={handleToggle} disabled={isPending} />
          </div>
          <div className="h-6 w-px bg-border" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <form action={handleDelete}>
                <DropdownMenuItem className="cursor-pointer text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
