"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { Briefcase, FolderKanban, Key, LayoutDashboard, ListTodo, Settings, BookOpen } from "lucide-react"
import { animate } from "animejs"

import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: Briefcase },
  { href: "/admin/tasks", label: "Tasks", icon: ListTodo },
  { href: "/admin/clients", label: "Clients", icon: FolderKanban },
  { href: "/admin/api-keys", label: "API Keys", icon: Key },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

const externalItems = [
  { href: "/api-docs", label: "API Docs", icon: BookOpen },
]

function isActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavItem({ href, label, icon: Icon, active }: { href: string; label: string; icon: React.ElementType; active: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseEnter = () => {
      if (!active) {
        animate(element, {
          translateX: 4,
          duration: 200,
          ease: "out(3)",
        });
      }
    };

    const handleMouseLeave = () => {
      animate(element, {
        translateX: 0,
        duration: 200,
        ease: "out(3)",
      });
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [active]);

  return (
    <Link
      ref={ref}
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
        active
          ? "font-medium text-foreground"
          : "text-muted-foreground hover:bg-surface-raised hover:text-foreground"
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-foreground" />
      )}
      <Icon className="h-4 w-4" strokeWidth={1.5} />
      <span>{label}</span>
    </Link>
  );
}

export function AdminSidebar({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname()
  const navRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (navRef.current && !mobile && !hasAnimated.current) {
      hasAnimated.current = true;
      const items = navRef.current.querySelectorAll('a');
      if (items.length > 0) {
        animate(items, {
          opacity: [0, 1],
          translateX: [-15, 0],
          duration: 400,
          delay: (_el: unknown, i: number) => 300 + i * 60,
          ease: "out(3)",
        });
      }
    }
  }, [mobile]);

  return (
    <nav ref={navRef} aria-label="Admin navigation" className={cn("flex flex-col gap-0.5", mobile && "pt-4")}>
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href)

        return (
          <NavItem
            key={href}
            href={href}
            label={label}
            icon={Icon}
            active={active}
          />
        )
      })}
      <div className="my-2 border-t border-border" />
      {externalItems.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href)

        return (
          <NavItem
            key={href}
            href={href}
            label={label}
            icon={Icon}
            active={active}
          />
        )
      })}
    </nav>
  )
}
