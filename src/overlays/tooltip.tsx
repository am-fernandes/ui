"use client"

import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import * as React from "react"

import { cn } from "@/lib/utils"
import { motionTooltip } from "./_internal/animations"
import { useOverlayContainer } from "./_internal/overlay-container"

export interface TooltipProps {
  content: React.ReactNode
  /**
   * The element the tooltip describes: one element that takes a ref and
   * spreads props (a `Button`, an `IconButton`, a link).
   *
   * A disabled control (`disabled`) gets no pointer or focus events, so it
   * cannot open a tooltip by itself. It is wrapped in a focusable `<span>`
   * that does: the tooltip opens on hover and on keyboard focus, which is the
   * place to say why the action is unavailable ("Só o gestor pode excluir").
   * Tooltips do not open on touch (a press activates the control): on a
   * phone, say it in the page too.
   */
  children: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  delayDuration?: number
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  sideOffset?: number
  className?: string
}

function isDisabledElement(node: React.ReactNode) {
  return React.isValidElement<{ disabled?: unknown }>(node) && node.props.disabled === true
}

function Tooltip({
  content,
  children,
  open,
  defaultOpen,
  onOpenChange,
  delayDuration = 200,
  side,
  align,
  sideOffset = 4,
  className,
}: TooltipProps) {
  // Inside a Dialog, AlertDialog or Sheet the tooltip renders into the modal
  // (see `OverlayContainerProvider`). `null`: the modal is still mounting.
  const container = useOverlayContainer()

  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <TooltipPrimitive.Trigger asChild data-slot="tooltip-trigger">
          {isDisabledElement(children) ? (
            // The disabled control has `pointer-events: none` (Button,
            // IconButton), so the pointer reaches this span.
            <span
              // biome-ignore lint/a11y/noNoninteractiveTabindex: the only way a keyboard user reaches the explanation of a disabled control
              tabIndex={0}
              className="inline-flex cursor-default rounded-element focus-visible:focus-outline"
            >
              {children}
            </span>
          ) : (
            children
          )}
        </TooltipPrimitive.Trigger>
        {container === null ? null : (
          <TooltipPrimitive.Portal container={container}>
            <TooltipPrimitive.Content
              data-slot="tooltip-content"
              side={side}
              align={align}
              sideOffset={sideOffset}
              className={cn(
                "z-[var(--z-tooltip)] overflow-hidden rounded-element bg-primary px-3 py-1.5 text-xs text-primary-foreground",
                motionTooltip,
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                "origin-[var(--radix-tooltip-content-transform-origin)]",
                className,
              )}
            >
              {content}
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Portal>
        )}
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

Tooltip.displayName = "Tooltip"

export { Tooltip }
