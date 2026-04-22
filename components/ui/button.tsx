import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 border font-mono text-[13px] font-medium uppercase tracking-[0.06em] transition disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4",
  {
    variants: {
      variant: {
        default: "rounded-full border-foreground bg-foreground px-6 py-2.5 text-background hover:bg-foreground/90",
        outline: "rounded-full border-border-visible bg-transparent px-6 py-2.5 text-foreground hover:bg-surface-raised",
        ghost: "rounded-md border-transparent px-3 py-2 text-muted-foreground hover:bg-surface-raised hover:text-foreground",
        destructive: "rounded-full border-[#D71921] bg-transparent px-6 py-2.5 text-[#D71921] hover:bg-[#D71921]/5",
      },
      size: {
        default: "min-h-[44px]",
        sm: "min-h-[36px] px-4 py-1.5 text-[11px]",
        lg: "min-h-[48px] px-8 py-3",
        icon: "min-h-[44px] min-w-[44px] px-0 py-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
