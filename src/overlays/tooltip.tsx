"use client"

import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import * as React from "react"

import { cn } from "@/lib/utils"
import { useComposedRefs } from "../primitives/_internal/compose-refs"
import { motionTooltip } from "./_internal/animations"
import type { OverlayContentProps } from "./_internal/content-props"
import { useLayerTheme } from "./_internal/layer-theme"
import { useOverlayContainer } from "./_internal/overlay-container"
import { asTooltipTarget } from "./_internal/trigger-child"

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
  /** The content panel (`[data-slot="tooltip-content"]`). */
  ref?: React.Ref<HTMLDivElement>
  /**
   * Attributes for the content panel: `id`, `data-*`, `aria-*`, handlers.
   * The overlay's own props win over these.
   */
  contentProps?: OverlayContentProps
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
  ref,
  contentProps,
}: TooltipProps) {
  // Inside a Dialog, AlertDialog or Sheet the tooltip renders into the modal
  // (see `OverlayContainerProvider`). `null`: the modal is still mounting.
  const container = useOverlayContainer()
  // Text has no element for Radix to attach to: a term gets a focusable span.
  const target = asTooltipTarget(children)
  // Opened from a dark part of the page, the tooltip is dark too.
  const theme = useLayerTheme()
  const contentRef = useComposedRefs(theme.contentRef, ref)

  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <TooltipPrimitive.Trigger asChild data-slot="tooltip-trigger" ref={theme.anchorRef}>
          {isDisabledElement(target) ? (
            // The disabled control has `pointer-events: none` (Button,
            // IconButton), so the pointer reaches this span.
            <span
              // biome-ignore lint/a11y/noNoninteractiveTabindex: the only way a keyboard user reaches the explanation of a disabled control
              tabIndex={0}
              className="inline-flex cursor-default rounded-element focus-visible:focus-outline"
            >
              {target}
            </span>
          ) : (
            target
          )}
        </TooltipPrimitive.Trigger>
        {container === null ? null : (
          <TooltipPrimitive.Portal container={container}>
            <TooltipPrimitive.Content
              {...contentProps}
              ref={contentRef}
              data-slot="tooltip-content"
              side={side}
              align={align}
              sideOffset={sideOffset}
              className={cn(
                // At most 320px (or the screen less 16px): longer texts wrap.
                "z-[var(--z-tooltip)] max-w-[min(20rem,calc(100vw-1rem))] overflow-hidden rounded-element bg-primary px-3 py-1.5 text-xs text-pretty break-words text-primary-foreground",
                motionTooltip,
                // A tooltip opens as "delayed-open" (after the hover delay) or
                // "instant-open" (moving from one tooltip to the next), never
                // as "open".
                "data-[state=delayed-open]:animate-in data-[state=instant-open]:animate-in data-[state=closed]:animate-out",
                "data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0 data-[state=instant-open]:fade-in-0",
                "data-[state=closed]:zoom-out-95 data-[state=delayed-open]:zoom-in-95 data-[state=instant-open]:zoom-in-95",
                "origin-[var(--radix-tooltip-content-transform-origin)]",
                theme.className,
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
