"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { ChevronsUpDown } from "lucide-react"
import type * as React from "react"

import { cn } from "@/lib/utils"

export interface CollapsibleProps {
  /** Default trigger text (only used when `trigger` is not provided). */
  title?: React.ReactNode
  /** Replaces the default chevron button. Mutually exclusive with `title`. */
  trigger?: React.ReactNode
  triggerSide?: "left" | "right"
  triggerLabel?: string
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  children: React.ReactNode
}

function Collapsible({
  title,
  trigger,
  triggerSide = "right",
  triggerLabel = "Alternar seção",
  defaultOpen,
  open,
  onOpenChange,
  className,
  children,
}: CollapsibleProps) {
  return (
    <CollapsiblePrimitive.Root
      data-slot="collapsible"
      data-trigger-side={triggerSide}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      className={cn("w-full", className)}
    >
      {trigger ? (
        <CollapsiblePrimitive.Trigger asChild data-slot="collapsible-trigger">
          {trigger}
        </CollapsiblePrimitive.Trigger>
      ) : (
        <CollapsiblePrimitive.Trigger
          data-slot="collapsible-trigger"
          className={cn(
            "flex w-full items-center justify-between rounded-md py-2 text-sm font-medium",
            "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            triggerSide === "left" && "flex-row-reverse",
          )}
          aria-label={title ? undefined : triggerLabel}
        >
          {title ? <span>{title}</span> : <span className="sr-only">{triggerLabel}</span>}
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </CollapsiblePrimitive.Trigger>
      )}
      <CollapsiblePrimitive.Content
        data-slot="collapsible-content"
        className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
      >
        {children}
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  )
}

Collapsible.displayName = "Collapsible"

export { Collapsible }
