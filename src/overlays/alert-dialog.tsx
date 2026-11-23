"use client"

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "../primitives/button"
import { dialogContentBase, overlayBase } from "./_internal/animations"
import { modalBodyClass } from "./_internal/modal-body"

export interface AlertDialogProps {
  trigger?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onConfirm: () => void
  onCancel?: () => void
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: ButtonProps["variant"]
  children?: React.ReactNode
  className?: string
}

function AlertDialog({
  trigger,
  title,
  description,
  open,
  defaultOpen,
  onOpenChange,
  onConfirm,
  onCancel,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  confirmVariant = "default",
  children,
  className,
}: AlertDialogProps) {
  // The open state lives here, controlled or not, because the buttons need it.
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false)
  const isOpen = open ?? uncontrolledOpen
  const handleOpenChange = (next: boolean) => {
    if (open === undefined) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  // A closing dialog stays mounted, with its buttons under the pointer, while
  // the exit animation runs. A second click there (a double click, a held
  // Enter) must not confirm or cancel again.
  const whileOpen = (action?: () => void) => (event: React.MouseEvent) => {
    if (!isOpen) {
      event.preventDefault()
      return
    }
    action?.()
  }

  return (
    <AlertDialogPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
      {trigger ? (
        <AlertDialogPrimitive.Trigger asChild>{trigger}</AlertDialogPrimitive.Trigger>
      ) : null}
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay data-slot="alert-dialog-overlay" className={overlayBase} />
        <AlertDialogPrimitive.Content
          data-slot="alert-dialog-content"
          className={cn(dialogContentBase, "max-w-lg", className)}
        >
          <AlertDialogPrimitive.Title
            data-slot="alert-dialog-title"
            className="shrink-0 text-lg font-semibold"
          >
            {title}
          </AlertDialogPrimitive.Title>
          {description ? (
            <AlertDialogPrimitive.Description
              data-slot="alert-dialog-description"
              className="shrink-0 text-sm text-muted-foreground"
            >
              {description}
            </AlertDialogPrimitive.Description>
          ) : null}
          {children ? (
            // The children used to be rows of the content itself, 16px apart:
            // the body keeps that gap between them. `shrink-0` on each one makes
            // a tall body scroll instead of squeezing its rows.
            <div
              data-slot="alert-dialog-body"
              className={cn(modalBodyClass(className), "flex flex-col gap-4 *:shrink-0")}
            >
              {children}
            </div>
          ) : null}
          <div data-slot="alert-dialog-footer" className="flex shrink-0 justify-end gap-2">
            <AlertDialogPrimitive.Cancel asChild>
              <Button variant="outline" className="min-w-24" onClick={whileOpen(onCancel)}>
                {cancelLabel}
              </Button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <Button variant={confirmVariant} className="min-w-24" onClick={whileOpen(onConfirm)}>
                {confirmLabel}
              </Button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}

AlertDialog.displayName = "AlertDialog"

export { AlertDialog }
