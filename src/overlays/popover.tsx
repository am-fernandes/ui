"use client"

import * as PopoverPrimitive from "@radix-ui/react-popover"
import * as React from "react"

import { cn } from "@/lib/utils"
import { motionPopover } from "./_internal/animations"
import { useOverlayContainer } from "./_internal/overlay-container"
import { asAnchorElement, asTriggerElement } from "./_internal/trigger-child"

type PopoverContentProps = React.ComponentProps<typeof PopoverPrimitive.Content>

export interface PopoverProps {
  /** Element that opens and closes the popover, and that it points at. */
  trigger?: React.ReactNode
  /**
   * Element the popover points at without opening it: a table cell, a field,
   * a line of text. Open it with `open`. Use it instead of `trigger` when
   * something else opens the popover; without either one the popover has
   * nowhere to go.
   */
  anchor?: React.ReactNode
  children?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
  sideOffset?: number
  /** Minimum distance in px kept between the content and the viewport edges when it flips or shifts on collision. Uses the Radix default (`0`) when omitted. */
  collisionPadding?: PopoverContentProps["collisionPadding"]
  modal?: boolean
  className?: string
  /**
   * Name of the popover, which is a `role="dialog"`: "Filtros", "Cidades".
   * Without this or `aria-labelledby` it is named by its trigger; with
   * neither a name nor a trigger, a warning in development.
   */
  "aria-label"?: string
  /** Id of the element that names the popover (its title). */
  "aria-labelledby"?: string
  onInteractOutside?: PopoverContentProps["onInteractOutside"]
  onPointerDownOutside?: PopoverContentProps["onPointerDownOutside"]
  onFocusOutside?: PopoverContentProps["onFocusOutside"]
  onEscapeKeyDown?: PopoverContentProps["onEscapeKeyDown"]
}

function Popover({
  trigger,
  anchor,
  children,
  open,
  defaultOpen,
  onOpenChange,
  align = "center",
  side,
  sideOffset = 4,
  collisionPadding,
  modal,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  onInteractOutside,
  onPointerDownOutside,
  onFocusOutside,
  onEscapeKeyDown,
}: PopoverProps) {
  // Inside a Dialog, AlertDialog or Sheet the content renders into the modal
  // (not into <body>), where the wheel and touch scrolling are not locked.
  // `null`: the modal is mounting; its element comes in the next pass.
  const container = useOverlayContainer()

  const placed = Boolean(trigger || anchor)
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production" && !placed) {
      console.warn(
        "[Popover] Sem `trigger` nem `anchor`, o popover não tem onde se posicionar e abre fora da tela. Passe `anchor` com o elemento para onde ele aponta.",
      )
    }
  }, [placed])

  // The content is a role="dialog": it needs a name, read when focus enters.
  // Without one of its own it is named by its trigger, as a menu is by its
  // button. (The trigger keeps an id it already has.)
  const triggerElement = asTriggerElement(trigger)
  const generatedTriggerId = React.useId()
  const triggerId =
    React.isValidElement<{ id?: string }>(triggerElement) && triggerElement.props.id
      ? triggerElement.props.id
      : generatedTriggerId
  const labelledBy = ariaLabelledby ?? (ariaLabel || !trigger ? undefined : triggerId)
  const named = Boolean(ariaLabel || labelledBy)
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production" && !named) {
      console.warn(
        '[Popover] O conteúdo é um role="dialog" sem nome: passe `aria-label` (ex.: "Filtros") ou `aria-labelledby` com o id do título.',
      )
    }
  }, [named])

  return (
    <PopoverPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      modal={modal}
    >
      {trigger ? (
        <PopoverPrimitive.Trigger asChild data-slot="popover-trigger" id={triggerId}>
          {triggerElement}
        </PopoverPrimitive.Trigger>
      ) : null}
      {anchor ? (
        <PopoverPrimitive.Anchor asChild data-slot="popover-anchor">
          {asAnchorElement(anchor)}
        </PopoverPrimitive.Anchor>
      ) : null}
      {container === null ? null : (
        <PopoverPrimitive.Portal container={container}>
          <PopoverPrimitive.Content
            data-slot="popover-content"
            align={align}
            side={side}
            sideOffset={sideOffset}
            collisionPadding={collisionPadding}
            aria-label={ariaLabel}
            aria-labelledby={labelledBy}
            onInteractOutside={onInteractOutside}
            onPointerDownOutside={onPointerDownOutside}
            onFocusOutside={onFocusOutside}
            onEscapeKeyDown={onEscapeKeyDown}
            className={cn(
              "z-(--z-popover) w-72 rounded-container border border-border-strong bg-popover p-4 text-popover-foreground outline-none",
              // Never taller than the room Radix measures between the trigger
              // and the edge of the screen (less `collisionPadding`): the rest
              // scrolls.
              "max-h-(--radix-popover-content-available-height) overflow-y-auto overscroll-contain",
              motionPopover,
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              "origin-(--radix-popover-content-transform-origin)",
              className,
            )}
          >
            {children}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      )}
    </PopoverPrimitive.Root>
  )
}

Popover.displayName = "Popover"

export { Popover }
