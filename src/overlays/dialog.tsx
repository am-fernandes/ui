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
            if (!dismissible) e.preventDefault()
          }}
          onInteractOutside={(e) => {
            if (!dismissible) e.preventDefault()
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
              className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none"
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
