import { cn } from "@/lib/utils"

const AVATAR_COLORS = [
  "#6366F1", // indigo
  "#EC4899", // pink
  "#F59E0B", // amber
  "#10B981", // emerald
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#EF4444", // red
  "#14B8A6", // teal
  "#F97316", // orange
  "#06B6D4", // cyan
] as const

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || parts[0] === "") return "?"
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function getAvatarColor(name: string): string {
  if (!name) return AVATAR_COLORS[0]
  const index = name.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

type AvatarProps = {
  name: string
  size?: number
  className?: string
}

export function Avatar({ name, size = 28, className }: AvatarProps) {
  const initials = getInitials(name)
  const bgColor = getAvatarColor(name)

  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-full font-medium text-white select-none", className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        backgroundColor: bgColor,
      }}
    >
      {initials}
    </div>
  )
}
