"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { ChevronsUpDown } from "lucide-react"
import type * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "../primitives/button"

const Collapsible = CollapsiblePrimitive.Root
const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger
const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export interface CollapsibleHeaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Title text or any node rendered as the header label. */
  title: React.ReactNode
  /** Position of the trigger button relative to the title. Defaults to `"right"`. */
  triggerSide?: "left" | "right"
  /** Optional custom trigger element. Defaults to a ghost icon button with `ChevronsUpDown`. */
  trigger?: React.ReactNode
  /** Accessible label for the default icon trigger. Ignored if `trigger` is provided. */
  triggerLabel?: string
}

function CollapsibleHeader({
  title,
  triggerSide = "right",
  trigger,
  triggerLabel = "Alternar seção",
  className,
  ...rest
}: CollapsibleHeaderProps) {
  const triggerNode = trigger ?? (
    <CollapsibleTrigger asChild>
      <Button variant="ghost" size="icon" aria-label={triggerLabel} data-position={triggerSide}>
        <ChevronsUpDown className="size-4" />
      </Button>
    </CollapsibleTrigger>
  )

  return (
    <div
      data-slot="collapsible-header"
      data-trigger-side={triggerSide}
      className={cn(
        "flex items-center justify-between gap-4 rounded-md border px-4 py-2",
        className,
      )}
      {...rest}
    >
      {triggerSide === "left" ? triggerNode : null}
      <div className="flex-1 text-sm font-semibold">{title}</div>
      {triggerSide === "right" ? triggerNode : null}
    </div>
  )
}

export { Collapsible, CollapsibleContent, CollapsibleHeader, CollapsibleTrigger }
