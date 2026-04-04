"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FolderKanban, LayoutDashboard, UserCircle2 } from "lucide-react"

import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clients", label: "Clients", icon: FolderKanban },
  { href: "/admin/team", label: "Team Members", icon: UserCircle2 },
]

function isActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AdminSidebar({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Admin navigation" className={cn("flex flex-col gap-1", mobile && "pt-4")}>
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href)

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg border border-transparent px-3 py-3 text-sm text-muted-foreground transition hover:border-border hover:bg-muted/40 hover:text-foreground",
              active &&
                "border-border bg-muted/50 font-semibold text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
