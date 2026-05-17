import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const typographyVariants = cva("text-foreground", {
  variants: {
    variant: {
      display: "text-4xl font-bold tracking-tight",
      title: "text-2xl font-semibold tracking-tight",
      subtitle: "text-lg font-medium",
      body: "text-sm leading-6",
      caption: "text-xs text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "body",
  },
})

const defaultElementByVariant = {
  display: "h1",
  title: "h2",
  subtitle: "h3",
  body: "p",
  caption: "span",
} as const

type TypographyVariant = NonNullable<VariantProps<typeof typographyVariants>["variant"]>

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  /** Override the rendered element. Defaults to a semantic tag per variant. */
  as?: keyof React.JSX.IntrinsicElements
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, as, ...props }, ref) => {
    const resolvedVariant: TypographyVariant = variant ?? "body"
    const Element = (as ?? defaultElementByVariant[resolvedVariant]) as React.ElementType
    return (
      <Element ref={ref} className={cn(typographyVariants({ variant }), className)} {...props} />
    )
  },
)
Typography.displayName = "Typography"

export { Typography, typographyVariants }
