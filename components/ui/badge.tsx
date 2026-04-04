import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium uppercase tracking-[0.12em]",
  {
    variants: {
      variant: {
        default: "border-border bg-muted/50 text-foreground",
        secondary: "border-border bg-background text-muted-foreground",
        destructive: "border-destructive bg-destructive text-white",
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
