import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium uppercase tracking-[0.12em]",
  {
    variants: {
      variant: {
        default: "border-border bg-surface-raised text-foreground",
        secondary: "border-border bg-surface text-muted-foreground",
        destructive: "border-[#D71921] bg-[#D71921] text-white",
        outline: "border-border bg-transparent text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
