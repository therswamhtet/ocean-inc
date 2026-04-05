'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  name,
  id,
}: {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  name?: string
  id?: string
}) {
  const [isChecked, setIsChecked] = React.useState(checked ?? false)

  React.useEffect(() => {
    setIsChecked(checked ?? false)
  }, [checked])

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={isChecked}
      disabled={disabled}
      className={cn(
        'inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
        isChecked ? 'bg-[#222222]' : 'bg-muted',
      )}
      onClick={() => {
        const next = !isChecked
        setIsChecked(next)
        onCheckedChange?.(next)
      }}
    >
      <span
        className={cn(
          'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg transition-transform',
          isChecked ? 'translate-x-4' : 'translate-x-0',
        )}
      />
    </button>
  )
}
