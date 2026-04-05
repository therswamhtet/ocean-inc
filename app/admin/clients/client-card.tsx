'use client'

import { useState, useTransition } from 'react'
import { Calendar, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { format } from 'date-fns'

import { ShareLinkButton } from '@/components/admin/share-link-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { toggleClientStatusAction, deleteClientAction } from './actions'

type ClientCardProps = {
  id: string
  name: string
  slug: string
  activeProjectsCount: number
  createdAt: string
  color: string
  logoPath?: string | null
  description?: string | null
  isActive?: boolean
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

export function ClientCard({ id, name, slug, activeProjectsCount, createdAt, color, logoPath, description, isActive = true }: ClientCardProps) {
  const router = useRouter()
  const displayColor = color || getColorForClient(name)
  const logoSrc = getLogoUrl(logoPath)
  const [isPending, startTransition] = useTransition()
  const [isActiveLocal, setIsActiveLocal] = useState(isActive)

  function handleDelete() {
    void deleteClientAction(id)
  }

  function handleCardClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement
    if (target.closest('button, a')) return
    router.push(`/admin/clients/${id}`)
  }

  function handleToggle(checked: boolean) {
    setIsActiveLocal(checked)
    startTransition(async () => {
      await toggleClientStatusAction(id)
    })
  }

  return (
    <Card className={cn(
      'cursor-pointer transition-all hover:bg-muted/10 hover:border-muted-foreground/20',
      !isActiveLocal && 'opacity-60',
    )} onClick={handleCardClick}>
      <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 space-y-1.5">
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
            {!isActiveLocal && (
              <Badge variant="destructive">Blocked</Badge>
            )}
            {isActiveLocal && (
              <Badge>{activeProjectsCount} active projects</Badge>
            )}
          </div>

          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <ShareLinkButton slug={slug} />
            {isActiveLocal && (
              <Link
                href={`/portal/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-sm underline underline-offset-4 hover:text-foreground"
              >
                <Calendar className="h-4 w-4" />
                View portal
              </Link>
            )}
            <span>Created {format(new Date(createdAt), 'MMM d, yyyy')}</span>
          </div>
        </div>

        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Active</span>
            <Switch checked={isActiveLocal} onCheckedChange={handleToggle} disabled={isPending} />
          </div>
          <form action={handleDelete}>
            <Button type="submit" variant="outline">
              Delete
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
