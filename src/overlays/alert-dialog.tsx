"use client"

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import type * as React from "react"

import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "../primitives/button"
import { dialogContentBase, overlayBase } from "./_internal/animations"
import { modalBodyClass } from "./_internal/modal-body"
import { useModalOpen, useReturnFocus } from "./_internal/modal-state"
import { OverlayContainerProvider, useOverlayContainerState } from "./_internal/overlay-container"
import { isToastFocused } from "./_internal/toasts"

export interface AlertDialogProps {
  trigger?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onConfirm: () => void
  /** Called on "Cancelar" and on Escape. */
  onCancel?: () => void
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: ButtonProps["variant"]
  children?: React.ReactNode
  /**
   * Handler do foco ao fechar. Por padrão o foco volta para o `trigger`; sem
   * `trigger` (aberto por `open`, a partir de um botão da página ou de um item
   * de menu), volta para o elemento que tinha o foco quando o diálogo abriu.
   * Chame `event.preventDefault()` para mandar o foco para outro lugar.
   */
  onCloseAutoFocus?: (event: Event) => void
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
  onCloseAutoFocus,
  className,
}: AlertDialogProps) {
  const [isOpen, handleOpenChange] = useModalOpen({ open, defaultOpen, onOpenChange })
  // Without a `trigger`, focus goes back to where it was when the dialog opened.
  const returnFocus = useReturnFocus({
    open: isOpen,
    hasTrigger: Boolean(trigger),
    onCloseAutoFocus,
  })

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

  // The popovers, menus and tooltips opened inside the dialog render into its
  // content element (see `OverlayContainerProvider`).
  const [overlayContainer, contentRef] = useOverlayContainerState()

  return (
    <AlertDialogPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
      {trigger ? (
        <AlertDialogPrimitive.Trigger asChild>{trigger}</AlertDialogPrimitive.Trigger>
      ) : null}
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay data-slot="alert-dialog-overlay" className={overlayBase} />
        <AlertDialogPrimitive.Content
          ref={contentRef}
          data-slot="alert-dialog-content"
          className={cn(dialogContentBase, "max-w-lg", className)}
          onCloseAutoFocus={returnFocus}
          // Escape is the keyboard's "Cancelar", so it calls `onCancel` too
          // (once: not again while the dialog closes). Escape typed with
          // focus in a toast (they float above the dialog) is for the toast.
          onEscapeKeyDown={(e) => {
            if (isToastFocused()) {
              e.preventDefault()
              return
            }
            if (isOpen) onCancel?.()
          }}
        >
          <OverlayContainerProvider container={overlayContainer}>
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
              // the body keeps that gap between them. `shrink-0` on each one
              // makes a tall body scroll instead of squeezing its rows.
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
                <Button
                  variant={confirmVariant}
                  className="min-w-24"
                  onClick={whileOpen(onConfirm)}
                >
                  {confirmLabel}
                </Button>
              </AlertDialogPrimitive.Action>
            </div>
          </OverlayContainerProvider>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}

AlertDialog.displayName = "AlertDialog"

export { AlertDialog }
