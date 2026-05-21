"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"
import type * as React from "react"

import { cn } from "@/lib/utils"
import { dialogContentBase, overlayBase } from "./_internal/animations"

export interface DialogProps {
  /** Element that opens the dialog. Omit for fully controlled use. */
  trigger?: React.ReactNode
  /** Required for a11y (Radix logs a warning otherwise). */
  title: React.ReactNode
  description?: React.ReactNode
  /** Body content (renders between header and footer). */
  children?: React.ReactNode
  /** Footer slot (renders flex-end justify with gap-2). */
  footer?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * When `false`, prevents Escape key and overlay click from closing the dialog,
   * and hides the X close button. Useful for required confirmations or step flows.
   * Default `true`.
   */
  dismissible?: boolean
  hideCloseButton?: boolean
  closeLabel?: string
  /** Visual size of the modal. */
  size?: "sm" | "md" | "lg" | "xl"
  /** Extra class on the content element. */
  className?: string
}

const SIZE_CLASSES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
} as const

// Nested Radix poppers (Combobox/Select/DropdownMenu/DateInput) live in
// their own portal OUTSIDE the Dialog's DOM tree. When the user clicks
// an option, the option's onSelect triggers setOpen(false) on the
// popper, which unmounts the option element synchronously — so by the
// time the Dialog's outside detection fires, e.target is already the
// document/HTML and `closest()` finds nothing. Three complementary
// signals catch this:
//
//   1. `e.detail.originalEvent.target` — Radix stores the underlying
//      PointerEvent in the synthetic outside event's detail.
//   2. A capture-phase `pointerdown` listener that remembers the last
//      real target before the popper unmounts.
//   3. Any popper-content wrapper still mounted in the DOM at the
//      moment the outside event fires (React batches state updates,
//      so the portal is still there during the synchronous handler).
//
// Any of them is enough to recognise "this click came from a nested
// popper" and keep the parent Dialog open.
const NESTED_OVERLAY_SELECTOR =
  '[data-radix-popper-content-wrapper], [role="grid"], .rdp, .rdp-root, [cmdk-list], [cmdk-root]'

let lastPointerDownTarget: HTMLElement | null = null
if (typeof window !== "undefined") {
  document.addEventListener(
    "pointerdown",
    (ev) => {
      lastPointerDownTarget = ev.target as HTMLElement | null
    },
    true,
  )
}

function isFromNestedPopper(
  e: { detail?: { originalEvent?: { target?: EventTarget | null } }; target: EventTarget | null },
): boolean {
  const orig = e.detail?.originalEvent?.target as HTMLElement | null
  if (orig?.closest?.(NESTED_OVERLAY_SELECTOR)) return true
  if (lastPointerDownTarget?.closest?.(NESTED_OVERLAY_SELECTOR)) return true
  if (
    typeof document !== "undefined" &&
    document.querySelector(NESTED_OVERLAY_SELECTOR)
  ) {
    return true
  }
  return false
}

function Dialog({
  trigger,
  title,
  description,
  children,
  footer,
  open,
  defaultOpen,
  onOpenChange,
  dismissible = true,
  hideCloseButton = false,
  closeLabel = "Close",
  size = "md",
  className,
}: DialogProps) {
  const showCloseButton = dismissible && !hideCloseButton

  return (
    <DialogPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger ? (
        <DialogPrimitive.Trigger asChild data-slot="dialog-trigger">
          {trigger}
        </DialogPrimitive.Trigger>
      ) : null}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay data-slot="dialog-overlay" className={overlayBase} />
        <DialogPrimitive.Content
          data-slot="dialog-content"
          className={cn(dialogContentBase, SIZE_CLASSES[size], className)}
          onEscapeKeyDown={(e) => {
            if (!dismissible) e.preventDefault()
          }}
          onPointerDownOutside={(e) => {
            if (!dismissible) {
              e.preventDefault()
              return
            }
            if (isFromNestedPopper(e)) e.preventDefault()
          }}
          onInteractOutside={(e) => {
            if (!dismissible) {
              e.preventDefault()
              return
            }
            if (isFromNestedPopper(e)) e.preventDefault()
          }}
        >
          <DialogPrimitive.Title
            data-slot="dialog-title"
            className="text-lg font-semibold leading-none"
          >
            {title}
          </DialogPrimitive.Title>
          {description ? (
            <DialogPrimitive.Description
              data-slot="dialog-description"
              className="text-sm text-muted-foreground"
            >
              {description}
            </DialogPrimitive.Description>
          ) : null}
          {children ? <div data-slot="dialog-body">{children}</div> : null}
          {footer ? (
            <div data-slot="dialog-footer" className="flex justify-end gap-2">
              {footer}
            </div>
          ) : null}
          {showCloseButton ? (
            <DialogPrimitive.Close
              data-slot="dialog-close"
              aria-label={closeLabel}
              className="absolute right-4 top-4 cursor-pointer rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none"
            >
              <XIcon className="size-4" />
              <span className="sr-only">{closeLabel}</span>
            </DialogPrimitive.Close>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

Dialog.displayName = "Dialog"

export { Dialog }
