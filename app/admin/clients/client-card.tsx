'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { format } from 'date-fns'

import { ShareLinkButton } from '@/components/admin/share-link-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { deleteClientAction } from './actions'

type ClientCardProps = {
  id: string
  name: string
  slug: string
  activeProjectsCount: number
  createdAt: string
}

export function ClientCard({ id, name, slug, activeProjectsCount, createdAt }: ClientCardProps) {
  const router = useRouter()

  function handleDelete() {
    void deleteClientAction(id)
  }

  function handleCardClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement
    if (target.closest('button, a[target]')) return
    router.push(`/admin/clients/${id}`)
  }

  return (
    <Card className="cursor-pointer transition hover:bg-muted/10" onClick={handleCardClick}>
      <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/admin/clients/${id}`}
              className="group text-lg font-semibold underline-offset-4 hover:no-underline group-hover:underline"
            >
              {name}
            </Link>
            <Badge>{activeProjectsCount} active projects</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span>Slug: {slug}</span>
            <ShareLinkButton slug={slug} />
            <span>Created {format(new Date(createdAt), 'MMM d, yyyy')}</span>
          </div>
        </div>

        <form action={handleDelete} onClick={(e) => e.stopPropagation()}>
          <Button type="submit" variant="outline">
            Delete
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
