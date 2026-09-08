"use client"

import * as PopoverPrimitive from "@radix-ui/react-popover"
import type * as React from "react"

import { cn } from "@/lib/utils"

type PopoverContentProps = React.ComponentProps<typeof PopoverPrimitive.Content>

export interface PopoverProps {
  trigger?: React.ReactNode
  children?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
  sideOffset?: number
  /** Minimum distance in px kept between the content and the viewport edges when it flips or shifts on collision. Default `16`. */
  collisionPadding?: PopoverContentProps["collisionPadding"]
  modal?: boolean
  className?: string
  onInteractOutside?: PopoverContentProps["onInteractOutside"]
  onPointerDownOutside?: PopoverContentProps["onPointerDownOutside"]
  onFocusOutside?: PopoverContentProps["onFocusOutside"]
  onEscapeKeyDown?: PopoverContentProps["onEscapeKeyDown"]
}

function Popover({
  trigger,
  children,
  open,
  defaultOpen,
  onOpenChange,
  align = "center",
  side,
  sideOffset = 4,
  collisionPadding = 16,
  modal,
  className,
  onInteractOutside,
  onPointerDownOutside,
  onFocusOutside,
  onEscapeKeyDown,
}: PopoverProps) {
  return (
    <PopoverPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      modal={modal}
    >
      {trigger ? (
        <PopoverPrimitive.Trigger asChild data-slot="popover-trigger">
          {trigger}
        </PopoverPrimitive.Trigger>
      ) : null}
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          data-slot="popover-content"
          align={align}
          side={side}
          sideOffset={sideOffset}
          collisionPadding={collisionPadding}
          onInteractOutside={onInteractOutside}
          onPointerDownOutside={onPointerDownOutside}
          onFocusOutside={onFocusOutside}
          onEscapeKeyDown={onEscapeKeyDown}
          className={cn(
            "z-[var(--z-popover)] w-72 rounded-md border bg-popover p-4 text-popover-foreground outline-none",
            "duration-[var(--motion-default)]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "origin-[var(--radix-popover-content-transform-origin)]",
            className,
          )}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

Popover.displayName = "Popover"

export { Popover }
