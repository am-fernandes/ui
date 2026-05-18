"use client"

import * as SeparatorPrimitive from "@radix-ui/react-separator"
import type * as React from "react"

import { cn } from "@/lib/utils"

export interface SeparatorProps
  extends Omit<React.ComponentProps<typeof SeparatorPrimitive.Root>, "children"> {
  ref?: React.Ref<HTMLDivElement>
}

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ref,
  ...props
}: SeparatorProps) {
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
