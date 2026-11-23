"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { ChevronsUpDown } from "lucide-react"
import * as React from "react"

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
  /**
   * Keep the content in the DOM while closed (hidden, out of the tab order),
   * so the uncontrolled fields of a collapsed section keep what was typed.
   * Closing then happens at once, without the collapse animation.
   * @default false
   */
  keepMounted?: boolean
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
  keepMounted = false,
  className,
  children,
}: CollapsibleProps) {
  // Kept here, not only in Radix: `keepMounted` hides the content by itself.
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false)
  const isOpen = open ?? uncontrolledOpen
  const handleOpenChange = (next: boolean) => {
    if (open === undefined) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  return (
    <CollapsiblePrimitive.Root
      data-slot="collapsible"
      data-trigger-side={triggerSide}
      open={isOpen}
      onOpenChange={handleOpenChange}
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
            "flex w-full items-center justify-between rounded-element py-2 text-sm font-medium",
            "cursor-pointer state-layer focus-visible:focus-outline",
            triggerSide === "left" && "flex-row-reverse",
          )}
          aria-label={title ? undefined : triggerLabel}
        >
          {title ? <span>{title}</span> : <span className="sr-only">{triggerLabel}</span>}
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </CollapsiblePrimitive.Trigger>
      )}
      <CollapsiblePrimitive.Content
        // Radix's `forceMount` keeps the element but never hides it: the
        // `hidden` attribute does. (Left out entirely otherwise: an explicit
        // `undefined` would override Radix's own.)
        {...(keepMounted ? { forceMount: true as const, hidden: !isOpen } : {})}
        data-slot="collapsible-content"
        className="overflow-hidden duration-(--duration-fast) ease-(--ease-standard) data-[state=closed]:animate-collapsible-up data-[state=closed]:ease-(--ease-exit) data-[state=open]:animate-collapsible-down"
      >
        {children}
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  )
}

Collapsible.displayName = "Collapsible"

export { Collapsible }
