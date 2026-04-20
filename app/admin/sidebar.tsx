"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Briefcase, FolderKanban, LayoutDashboard, ListTodo, Settings } from "lucide-react"

import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: Briefcase },
  { href: "/admin/tasks", label: "Tasks", icon: ListTodo },
  { href: "/admin/clients", label: "Clients", icon: FolderKanban },
  { href: "/admin/settings", label: "Settings", icon: Settings },
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
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-amber-50 hover:text-foreground",
              active &&
                "bg-amber-100/60 font-medium text-foreground"
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
