"use client"

import { Slot } from "@radix-ui/react-slot"
import { type VariantProps, cva } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import type * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-element text-sm font-medium cursor-pointer",
    "px-3 py-2.5",
    "transition focus-visible:focus-outline",
    "motion-safe:pointer-fine:active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-pressed",
        destructive: "bg-destructive text-destructive-foreground state-layer",
        outline: "border border-input bg-card state-layer",
        secondary: "bg-secondary text-secondary-foreground state-layer",
        ghost: "state-layer",
        link: "text-link underline-offset-4 hover:underline",
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
  /**
   * `"button"` by default, so a button inside a `<form>` (Cancelar, Voltar,
   * Adicionar item) never submits it by accident. Pass `"submit"` on the
   * button that sends the form. Not applied with `asChild`.
   * @default "button"
   */
  type?: "button" | "submit" | "reset"
  ref?: React.Ref<HTMLButtonElement>
}

function Button({
  className,
  variant,
  asChild = false,
  loading = false,
  disabled,
  type,
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
      // The child of `asChild` may be a link: it only gets a type if one was given.
      type={asChild ? type : (type ?? "button")}
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
