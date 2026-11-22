import { Slot } from "@radix-ui/react-slot"
import { type VariantProps, cva } from "class-variance-authority"
import type * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-inner border px-2.5 py-0.5 text-xs font-semibold transition-colors [print-color-adjust:exact] focus-visible:focus-outline",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        // Status: one strong fill each, with the foreground the token names
        // (dark on warning, white on the others). There is no tinted version.
        info: "border-transparent bg-info text-info-foreground",
        success: "border-transparent bg-success text-success-foreground",
        warning: "border-transparent bg-warning text-warning-foreground",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>

// `dot`: the status as a coloured dot beside plain text, with no fill. The
// label takes the surrounding text colour, so it also works in a selected row.
const dotBase =
  "gap-2 border-transparent bg-transparent px-0 py-0 text-sm font-normal text-inherit before:size-2 before:shrink-0 before:rounded-full before:content-[''] forced-colors:before:bg-[CanvasText]"

const dotColor: Record<BadgeVariant, string> = {
  default: "before:bg-primary",
  secondary: "before:bg-muted-foreground",
  destructive: "before:bg-destructive",
  info: "before:bg-info",
  success: "before:bg-success",
  warning: "before:bg-warning",
  outline: "before:bg-muted-foreground",
}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
  /**
   * Dot + label instead of a filled chip. Use it in dense tables, where a
   * column of filled badges would outweigh the content.
   */
  dot?: boolean
  ref?: React.Ref<HTMLDivElement>
}

function Badge({ className, variant, dot = false, asChild = false, ref, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp
      ref={ref as React.Ref<HTMLDivElement>}
      data-slot="badge"
      data-dot={dot ? "true" : undefined}
      className={cn(
        badgeVariants({ variant }),
        dot && dotBase,
        dot && dotColor[variant ?? "default"],
        className,
      )}
      {...props}
    />
  )
}

Badge.displayName = "Badge"

export { Badge, badgeVariants }
