'use client'

import { Calendar, Link as LinkIcon } from 'lucide-react'
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
  color: string
  logoPath?: string | null
}

const CLIENT_PALETTE = ['#3B82F6','#EF4444','#10B981','#F59E0B','#8B5CF6','#EC4899','#06B6D4','#F97316']

function getColorForClient(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return CLIENT_PALETTE[Math.abs(hash) % CLIENT_PALETTE.length]
}

function getLogoUrl(logoPath: string | null | undefined): string | null {
  if (!logoPath) return null
  if (logoPath.startsWith('http')) return logoPath
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? 'logos'
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return url ? `${url}/storage/v1/object/public/${bucket}/${logoPath}` : null
}

export function ClientCard({ id, name, slug, activeProjectsCount, createdAt, color, logoPath }: ClientCardProps) {
  const router = useRouter()
  const displayColor = color || getColorForClient(name)
  const logoSrc = getLogoUrl(logoPath)

  function handleDelete() {
    void deleteClientAction(id)
  }

  function handleCardClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement
    if (target.closest('button, a')) return
    router.push(`/admin/clients/${id}`)
  }

  return (
    <Card className="cursor-pointer transition-all hover:bg-muted/10 hover:border-muted-foreground/20" onClick={handleCardClick}>
      <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-4 w-1 flex-shrink-0 rounded-sm" style={{ backgroundColor: displayColor }} />
            {logoSrc && (
              <img src={logoSrc} alt="" className="h-6 w-6 rounded-sm object-cover" />
            )}
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
            <Link
              href={`/portal/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-sm underline underline-offset-4 hover:text-foreground"
            >
              <Calendar className="h-4 w-4" />
              Calendar
            </Link>
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
