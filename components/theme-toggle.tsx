'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

import { cn } from '@/lib/utils'

type ThemeToggleProps = {
  className?: string
  size?: 'sm' | 'md'
}

export function ThemeToggle({ className, size = 'md' }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('orca-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('orca-theme', 'light')
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'inline-flex items-center justify-center rounded-full border border-border-visible bg-surface text-foreground shadow-none transition hover:bg-surface-raised hover:border-foreground',
        size === 'sm' ? 'h-8 w-8' : 'h-9 w-9',
        className
      )}
    >
      {isDark ? (
        <Sun className="h-4 w-4" strokeWidth={1.5} />
      ) : (
        <Moon className="h-4 w-4" strokeWidth={1.5} />
      )}
    </button>
  )
}
