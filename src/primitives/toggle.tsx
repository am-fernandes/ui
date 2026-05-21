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
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border",
  {
    variants: {
      variant: {
        // Off = plain outline (`border-input bg-background`, same as
        // Button's `outline` variant so a Toggle in its idle state lines
        // up next to outline buttons without looking thinner).
        // On = solid fill in the variant colour, mirroring Button's
        // `default` / `destructive` solid look — at-a-glance the on-state
        // reads as "this is engaged".
        default: [
          "border-input bg-background hover:bg-accent hover:text-accent-foreground",
          "data-[state=on]:bg-accent data-[state=on]:text-accent-foreground data-[state=on]:border-accent",
        ].join(" "),
        info: [
          "border-input bg-background hover:bg-accent hover:text-accent-foreground",
          "data-[state=on]:bg-info data-[state=on]:text-info-foreground data-[state=on]:border-info data-[state=on]:hover:bg-info/90",
        ].join(" "),
        success: [
          "border-input bg-background hover:bg-accent hover:text-accent-foreground",
          "data-[state=on]:bg-success data-[state=on]:text-success-foreground data-[state=on]:border-success data-[state=on]:hover:bg-success/90",
        ].join(" "),
        warning: [
          "border-input bg-background hover:bg-accent hover:text-accent-foreground",
          "data-[state=on]:bg-warning data-[state=on]:text-warning-foreground data-[state=on]:border-warning data-[state=on]:hover:bg-warning/90",
        ].join(" "),
        destructive: [
          "border-input bg-background hover:bg-accent hover:text-accent-foreground",
          "data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground data-[state=on]:border-destructive data-[state=on]:hover:bg-destructive/90",
        ].join(" "),
      },
      // No explicit height: padding + border resolve the box exactly the
      // way Button does, so Toggle and Button at the same `size` line up
      // pixel-for-pixel (the previous `h-10` clamped Toggle to 40px while
      // outline-style Buttons came out at 42px because of their border).
      size: {
        sm: "px-2.5 py-1.5",
        default: "px-3 py-2.5",
        lg: "px-4 py-3",
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
