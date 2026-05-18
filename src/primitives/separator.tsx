"use client"

import * as SeparatorPrimitive from "@radix-ui/react-separator"
import type * as React from "react"

import { cn } from "@/lib/utils"

export interface SeparatorProps
  extends Omit<React.ComponentProps<typeof SeparatorPrimitive.Root>, "children"> {
  /** When set, renders text in the middle of the separator line. Horizontal only. */
  label?: React.ReactNode
  ref?: React.Ref<HTMLDivElement>
}

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  label,
  ref,
  ...props
}: SeparatorProps) {
  if (label && orientation === "horizontal") {
    return (
      <div
        ref={ref}
        data-slot="separator"
        data-orientation="horizontal"
        role={decorative ? undefined : "separator"}
        aria-orientation="horizontal"
        className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}
        {...props}
      >
        <span className="h-px flex-1 bg-border" />
        <span data-slot="separator-label">{label}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    )
  }

  return (
    <SeparatorPrimitive.Root
      ref={ref}
      data-slot="separator"
      orientation={orientation}
      decorative={decorative}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  )
}

Separator.displayName = "Separator"

export { Separator }
