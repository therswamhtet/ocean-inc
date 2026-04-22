import { cn } from '@/lib/utils'
import React from 'react'

interface ContentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'metric' | 'kanban' | 'mobile'
}

export function ContentCard({ className, variant = 'default', ...props }: ContentCardProps) {
  const base = 'rounded-lg border border-border transition'
  const variants = {
    default: 'p-4 hover:bg-surface-raised',
    metric: 'p-5',
    kanban: 'p-3 hover:bg-surface-raised',
    mobile: 'p-3',
  }

  return <div className={cn(base, variants[variant], className)} {...props} />
}
