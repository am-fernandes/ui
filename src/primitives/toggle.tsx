"use client"

import * as TogglePrimitive from "@radix-ui/react-toggle"
import { type VariantProps, cva } from "class-variance-authority"
import type * as React from "react"

import { cn } from "@/lib/utils"

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
 */
const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border",
  {
    variants: {
      variant: {
        // Pressed = filled accent (solid). Off = plain outline.
        default: [
          "border-input bg-background hover:bg-accent hover:text-accent-foreground",
          "data-[state=on]:bg-accent data-[state=on]:text-accent-foreground data-[state=on]:border-accent",
        ].join(" "),
        // Semantic variants. Pressed = border + text in the variant
        // colour with a soft hover fill (10% alpha). Off = same outline
        // base as `default` so the colour change is the on-signal.
        info: [
          "border-input bg-background hover:bg-accent hover:text-accent-foreground",
          "data-[state=on]:border-info data-[state=on]:text-info data-[state=on]:hover:bg-info/10 data-[state=on]:bg-background",
        ].join(" "),
        success: [
          "border-input bg-background hover:bg-accent hover:text-accent-foreground",
          "data-[state=on]:border-success data-[state=on]:text-success data-[state=on]:hover:bg-success/10 data-[state=on]:bg-background",
        ].join(" "),
        warning: [
          "border-input bg-background hover:bg-accent hover:text-accent-foreground",
          "data-[state=on]:border-warning data-[state=on]:text-warning data-[state=on]:hover:bg-warning/10 data-[state=on]:bg-background",
        ].join(" "),
        destructive: [
          "border-input bg-background hover:bg-accent hover:text-accent-foreground",
          "data-[state=on]:border-destructive data-[state=on]:text-destructive data-[state=on]:hover:bg-destructive/10 data-[state=on]:bg-background",
        ].join(" "),
      },
      size: {
        sm: "h-9 px-2.5",
        default: "h-10 px-3 py-2.5",
        lg: "h-11 px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ToggleProps
  extends Omit<React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>, "asChild">,
    VariantProps<typeof toggleVariants> {
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
