"use client"

import { Slot } from "@radix-ui/react-slot"
import { type VariantProps, cva } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import type * as React from "react"

import { cn } from "@/lib/utils"
import { useAnnounceWhen } from "./_internal/announce"
import { controlHeight, controlPaddingX } from "./_internal/control-size"

// Every variant has a 1px border (transparent unless it is `outline`), so the
// box of a size is the same in all of them: same height, same width for the
// same label. Each variant names its own border colour, which keeps
// `buttonVariants()` right even where the result is not run through `cn()`.
//
// `aria-disabled` is how a button is unavailable without leaving the tab
// order (while loading): it loses the pointer cursor and every hover and
// pressed reaction, like a natively disabled one.
const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-element border text-sm font-medium cursor-pointer",
    "transition focus-visible:focus-outline",
    "motion-safe:pointer-fine:not-aria-disabled:active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-default",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ),
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground not-aria-disabled:hover:bg-primary-hover not-aria-disabled:active:bg-primary-pressed",
        destructive: "border-transparent bg-destructive text-destructive-foreground state-layer",
        outline: "border-input bg-card state-layer",
        secondary: "border-transparent bg-secondary text-secondary-foreground state-layer",
        ghost: "border-transparent state-layer",
        link: "border-transparent text-link underline-offset-4 not-aria-disabled:hover:underline",
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

export interface ButtonLabels {
  /** Read to screen-reader users when the button starts loading. */
  loading: string
}

export const defaultButtonLabels: ButtonLabels = {
  loading: "Carregando…",
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * `sm` 32px, `md` 40px, `lg` 44px: the height of the whole box, the same as
   * an `Input`, an `IconButton` or a `Toggle` of that size. @default "md"
   */
  size?: "sm" | "md" | "lg"
  asChild?: boolean
  /**
   * The action is running. A spinner takes the place of the label, which
   * keeps its space (the width does not change), and the button ignores
   * clicks and the keyboard. It is not natively disabled: it stays focused
   * and is announced as busy and unavailable (`aria-busy`, `aria-disabled`).
   */
  loading?: boolean
  /**
   * `"button"` by default, so a button inside a `<form>` (Cancelar, Voltar,
   * Adicionar item) never submits it by accident. Pass `"submit"` on the
   * button that sends the form. Not applied with `asChild`.
   * @default "button"
   */
  type?: "button" | "submit" | "reset"
  /** Text for screen readers. Defaults in `defaultButtonLabels`. */
  labels?: Partial<ButtonLabels>
  ref?: React.Ref<HTMLButtonElement>
}

/** A click that goes nowhere: not to the handlers, not to the form around. */
function ignoreActivation(event: React.MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  type,
  labels,
  onClick,
  children,
  ref,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  // Loading keeps the button in the tab order: a native `disabled` in the
  // middle of a save throws the keyboard focus to the page body. An explicit
  // `disabled` still wins.
  const busy = loading && !disabled && !asChild
  useAnnounceWhen(loading, labels?.loading ?? defaultButtonLabels.loading)

  // Slot requires exactly one child element. When asChild, skip the spinner
  // injection — consumers can render their own loading state inside the child.
  const content =
    loading && !asChild ? (
      <>
        {/* Still laid out, so the button keeps its width, and still its name. */}
        <span
          data-slot="button-content"
          className="inline-flex min-w-0 items-center gap-[inherit] opacity-0"
        >
          {children}
        </span>
        <span
          data-slot="button-spinner"
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center"
        >
          <Loader2 className="animate-spin" />
        </span>
      </>
    ) : (
      children
    )

  return (
    <Comp
      ref={ref as React.Ref<HTMLButtonElement>}
      // The child of `asChild` may be a link: it only gets a type if one was given.
      type={asChild ? type : (type ?? "button")}
      data-slot="button"
      data-loading={loading ? "" : undefined}
      className={cn(
        buttonVariants({ variant, size }),
        loading && !asChild && "relative",
        className,
      )}
      disabled={busy ? undefined : loading || disabled}
      aria-disabled={busy || undefined}
      aria-busy={loading || undefined}
      {...props}
      onClick={busy ? ignoreActivation : onClick}
    >
      {content}
    </Comp>
  )
}

Button.displayName = "Button"

export { Button, buttonVariants }
