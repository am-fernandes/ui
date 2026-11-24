"use client"

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import type * as React from "react"

import { cn } from "@/lib/utils"

export type ScrollAreaOrientation = "vertical" | "horizontal" | "both"

export interface ScrollAreaProps extends React.ComponentProps<typeof ScrollAreaPrimitive.Root> {
  /** Which scrollbar(s) to render. Default `"vertical"`. */
  orientation?: ScrollAreaOrientation
  /**
   * Names the scrolling area. With a name it becomes a region landmark
   * ("Histórico do lead"), announced when it gets focus.
   */
  "aria-label"?: string
  "aria-labelledby"?: string
  ref?: React.Ref<React.ComponentRef<typeof ScrollAreaPrimitive.Root>>
}

function ScrollArea({
  className,
  children,
  orientation = "vertical",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  ref,
  ...props
}: ScrollAreaProps) {
  const named = ariaLabel != null || ariaLabelledby != null
  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        // Focusable, so the arrow keys and PageDown scroll it even when the
        // content has nothing to focus (WCAG 2.1.1).
        tabIndex={0}
        role={named ? "region" : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        className="size-full rounded-[inherit] outline-none focus-visible:focus-outline-inset"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {(orientation === "vertical" || orientation === "both") && (
        <ScrollBar orientation="vertical" />
      )}
      {(orientation === "horizontal" || orientation === "both") && (
        <ScrollBar orientation="horizontal" />
      )}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

export interface ScrollBarProps
  extends React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> {
  ref?: React.Ref<React.ComponentRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>>
}

function ScrollBar({ className, orientation = "vertical", ref, ...props }: ScrollBarProps) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      ref={ref}
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        // The field-border colour: 3:1 or more against the surface in both themes.
        className="relative flex-1 rounded-inner bg-input forced-colors:bg-[CanvasText]"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

ScrollArea.displayName = "ScrollArea"

export { ScrollArea, ScrollBar }
