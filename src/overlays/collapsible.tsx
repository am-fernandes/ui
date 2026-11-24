"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { ChevronsUpDown } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { asTriggerElement } from "./_internal/trigger-child"

interface CollapsibleBaseProps {
  triggerSide?: "left" | "right"
  triggerLabel?: string
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * The section cannot be opened or closed: the trigger is disabled (and the
   * default one looks it). An open section stays readable.
   */
  disabled?: boolean
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

/** The default trigger: a full-width row with `title` and a chevron. */
interface CollapsibleTitleProps {
  /** Text of the default trigger. */
  title?: React.ReactNode
  trigger?: never
}

/** A trigger of your own, in place of the default row. */
interface CollapsibleTriggerProps {
  /**
   * Replaces the default chevron button: one element that takes a ref and
   * spreads props (a `Button`). It gets `aria-expanded` and `disabled`.
   */
  trigger: React.ReactNode
  title?: never
}

export type CollapsibleProps = CollapsibleBaseProps &
  (CollapsibleTitleProps | CollapsibleTriggerProps)

function Collapsible({
  title,
  trigger,
  triggerSide = "right",
  triggerLabel = "Alternar seção",
  defaultOpen,
  open,
  onOpenChange,
  disabled,
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
      disabled={disabled}
      className={cn("w-full", className)}
    >
      {trigger ? (
        <CollapsiblePrimitive.Trigger asChild data-slot="collapsible-trigger">
          {asTriggerElement(trigger)}
        </CollapsiblePrimitive.Trigger>
      ) : (
        <CollapsiblePrimitive.Trigger
          data-slot="collapsible-trigger"
          className={cn(
            "flex w-full items-center justify-between rounded-element py-2 text-sm font-medium",
            "cursor-pointer state-layer focus-visible:focus-outline",
            "disabled:cursor-default disabled:opacity-50",
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
