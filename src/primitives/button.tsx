"use client"

import { Slot } from "@radix-ui/react-slot"
import { type VariantProps, cva } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import type * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer",
    "h-9 px-3 py-2",
    "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ),
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: { variant: "default" },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** When true, renders a spinner before children and disables the button. */
  loading?: boolean
  ref?: React.Ref<HTMLButtonElement>
}

function Button({
  className,
  variant,
  asChild = false,
  loading = false,
  disabled,
  children,
  ref,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  // Slot requires exactly one child element. When asChild, skip the spinner
  // injection — consumers can render their own loading state inside the child.
  const content = asChild ? (
    children
  ) : (
    <>
      {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </>
  )
  return (
    <Comp
      ref={ref as React.Ref<HTMLButtonElement>}
      data-slot="button"
      className={cn(buttonVariants({ variant, className }))}
      disabled={loading || disabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {content}
    </Comp>
  )
}

Button.displayName = "Button"

export { Button, buttonVariants }
