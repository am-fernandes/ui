"use client"

import { Slot } from "@radix-ui/react-slot"
import { type VariantProps, cva } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import type * as React from "react"

import { cn } from "@/lib/utils"
import { controlHeight, controlPaddingX } from "./_internal/control-size"

// Every variant has a 1px border (transparent unless it is `outline`), so the
// box of a size is the same in all of them: same height, same width for the
// same label. Each variant names its own border colour, which keeps
// `buttonVariants()` right even where the result is not run through `cn()`.
const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-element border text-sm font-medium cursor-pointer",
    "transition focus-visible:focus-outline",
    "motion-safe:pointer-fine:active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ),
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-pressed",
        destructive: "border-transparent bg-destructive text-destructive-foreground state-layer",
        outline: "border-input bg-card state-layer",
        secondary: "border-transparent bg-secondary text-secondary-foreground state-layer",
        ghost: "border-transparent state-layer",
        link: "border-transparent text-link underline-offset-4 hover:underline",
      },
      // The height of the whole box, border included: 32, 40 and 44px.
      size: {
        sm: `${controlHeight.sm} ${controlPaddingX.sm}`,
        md: `${controlHeight.md} ${controlPaddingX.md}`,
        lg: `${controlHeight.lg} ${controlPaddingX.lg}`,
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * `sm` 32px, `md` 40px, `lg` 44px: the height of the whole box, the same as
   * an `Input`, an `IconButton` or a `Toggle` of that size. @default "md"
   */
  size?: "sm" | "md" | "lg"
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
  size,
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
      className={cn(buttonVariants({ variant, size, className }))}
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
