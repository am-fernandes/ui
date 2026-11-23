"use client"

import * as TogglePrimitive from "@radix-ui/react-toggle"
import { type VariantProps, cva } from "class-variance-authority"
import type * as React from "react"

import { cn } from "@/lib/utils"
import { type ControlSize, controlHeight, controlPaddingX } from "./_internal/control-size"

/**
 * Button-like control whose value is binary (on / off). Separate from
 * `Button` because the visual job is different:
 *
 *   `Button` communicates **action hierarchy** — primary, secondary,
 *   destructive. Adding semantic colours there confuses consumers about
 *   what's the page's main action.
 *
 *   `Toggle` communicates **state**. When pressed it picks up the
 *   variant's colour so the on/off distinction reads at a glance (the
 *   way GitHub's "Watch" button, Trello's "Watching" eye, or Gmail's
 *   star do). Off-state is always a neutral outline so multiple toggles
 *   side-by-side don't fight for attention.
 *
 * Backed by Radix's `Toggle` primitive, so the controlled API
 * (`pressed` / `onPressedChange`) and `data-state` attributes are
 * standard.
 *
 * Keep the label the same in both states: `aria-pressed` is what says "on".
 * A label that flips ("Remover da lista" when pressed) is read as
 * "Remover da lista, pressionado" — the opposite of what the screen shows.
 */
const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-element text-sm font-medium cursor-pointer transition focus-visible:focus-outline state-layer motion-safe:pointer-fine:active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border",
  {
    variants: {
      variant: {
        // Off = plain outline (`border-input bg-card`, same as
        // Button's `outline` variant so a Toggle in its idle state lines
        // up next to outline buttons without looking thinner).
        // On = solid fill in the variant colour, mirroring Button's
        // `default` / `destructive` solid look — at-a-glance the on-state
        // reads as "this is engaged".
        default: [
          "border-input bg-card",
          "data-[state=on]:bg-accent data-[state=on]:text-accent-foreground data-[state=on]:border-accent",
        ].join(" "),
        info: [
          "border-input bg-card",
          "data-[state=on]:bg-info data-[state=on]:text-info-foreground data-[state=on]:border-info",
        ].join(" "),
        success: [
          "border-input bg-card",
          "data-[state=on]:bg-success data-[state=on]:text-success-foreground data-[state=on]:border-success",
        ].join(" "),
        warning: [
          "border-input bg-card",
          "data-[state=on]:bg-warning data-[state=on]:text-warning-foreground data-[state=on]:border-warning",
        ].join(" "),
        destructive: [
          "border-input bg-card",
          "data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground data-[state=on]:border-destructive",
        ].join(" "),
      },
      // The height of the whole box, border included (32, 40 and 44px): the
      // same shared control heights as Button, IconButton and Input, so a
      // Toggle lines up with any of them at the same `size`.
      size: {
        sm: `${controlHeight.sm} ${controlPaddingX.sm}`,
        md: `${controlHeight.md} ${controlPaddingX.md}`,
        lg: `${controlHeight.lg} ${controlPaddingX.lg}`,
        // The name `md` had before every control shared `sm | md | lg`.
        default: `${controlHeight.md} ${controlPaddingX.md}`,
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
)

export interface ToggleProps
  extends Omit<React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>, "asChild">,
    VariantProps<typeof toggleVariants> {
  /**
   * `sm` 32px, `md` 40px, `lg` 44px: the height of the whole box, the same as
   * a `Button` or an `Input` of that size. `"default"` is the deprecated name
   * of `"md"` and still works.
   * @default "md"
   */
  size?: ControlSize | "default"
  ref?: React.Ref<React.ElementRef<typeof TogglePrimitive.Root>>
}

function Toggle({ className, variant, size, ref, ...props }: ToggleProps) {
  return (
    <TogglePrimitive.Root
      ref={ref}
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size }), className)}
      {...props}
    />
  )
}

Toggle.displayName = "Toggle"

export { Toggle, toggleVariants }
