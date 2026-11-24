"use client"

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { Loader2 } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { useComposedRefs } from "../primitives/_internal/compose-refs"
import { Button, type ButtonProps } from "../primitives/button"
import { dialogContentBase, overlayBase } from "./_internal/animations"
import type { OverlayContentProps } from "./_internal/content-props"
import { modalBodyClass } from "./_internal/modal-body"
import { useModalOpen, useReturnFocus } from "./_internal/modal-state"
import { OverlayContainerProvider, useOverlayContainerState } from "./_internal/overlay-container"
import { isToastFocused } from "./_internal/toasts"
import { asTriggerElement } from "./_internal/trigger-child"

export interface AlertDialogProps {
  trigger?: React.ReactNode
  title: React.ReactNode
  /**
   * What happens if the user confirms ("Esta ação não pode ser desfeita.").
   * Optional, but an alert dialog should have one: it is what a screen
   * reader reads after the title, and Radix warns in development without it.
   */
  description?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * Called on the confirm button. Return a Promise (the request behind
   * "Aprovar") and the dialog waits for it: the button shows a spinner, both
   * buttons and Escape are ignored, the dialog closes when it resolves and
   * stays open when it rejects, so the consumer can show the error inside it
   * (in `children`) or in a toast and the user can try again.
   */
  // biome-ignore lint/suspicious/noConfusingVoidType: a handler that returns nothing (any function the consumer already has), or a Promise to wait for
  onConfirm: () => void | Promise<unknown>
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
  /** The content panel (`[data-slot="alert-dialog-content"]`). */
  ref?: React.Ref<HTMLDivElement>
  /**
   * Attributes for the content panel: `id`, `data-*`, `aria-*`, handlers.
   * The overlay's own props win over these.
   */
  contentProps?: OverlayContentProps
}

// The look of a disabled `Button`, for one that keeps the focus.
const pendingClass = "aria-disabled:pointer-events-none aria-disabled:opacity-50"

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as PromiseLike<unknown>).then === "function"
  )
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
  ref,
  contentProps,
}: AlertDialogProps) {
  const [isOpen, handleOpenChange] = useModalOpen({ open, defaultOpen, onOpenChange })
  // Without a `trigger`, focus goes back to where it was when the dialog opened.
  const returnFocus = useReturnFocus({
    open: isOpen,
    hasTrigger: Boolean(trigger),
    onCloseAutoFocus,
  })

  // While an asynchronous `onConfirm` runs. The ref answers at once, before
  // React renders the state: a double click lands in the same frame.
  const [pending, setPending] = React.useState(false)
  const pendingRef = React.useRef(false)
  const mountedRef = React.useRef(true)
  React.useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])
  // The promise settles renders later: close with the handlers of that time.
  const latest = React.useRef({ isOpen, handleOpenChange })
  latest.current = { isOpen, handleOpenChange }

  // A closing dialog stays mounted, with its buttons under the pointer, while
  // the exit animation runs. A second click there (a double click, a held
  // Enter) must not confirm or cancel again; nor any click while the
  // confirmation is pending.
  const whileOpen = (action?: () => void) => (event: React.MouseEvent) => {
    if (!isOpen || pendingRef.current) {
      event.preventDefault()
      return
    }
    action?.()
  }

  const confirm = whileOpen(() => {})
  const handleConfirm = (event: React.MouseEvent) => {
    confirm(event)
    if (event.defaultPrevented) return
    const result = onConfirm()
    // Synchronous: Radix's Action closes the dialog.
    if (!isPromiseLike(result)) return
    event.preventDefault()
    pendingRef.current = true
    setPending(true)
    const settle = (close: boolean) => {
      pendingRef.current = false
      if (!mountedRef.current) return
      setPending(false)
      if (close && latest.current.isOpen) latest.current.handleOpenChange(false)
    }
    // A rejection is the consumer's to show; the dialog only stays open.
    Promise.resolve(result).then(
      () => settle(true),
      () => settle(false),
    )
  }

  // The popovers, menus and tooltips opened inside the dialog render into its
  // content element (see `OverlayContainerProvider`).
  const [overlayContainer, contentRef] = useOverlayContainerState()
  const composedContentRef = useComposedRefs(contentRef, ref)

  return (
    <AlertDialogPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
      {trigger ? (
        <AlertDialogPrimitive.Trigger asChild>
          {asTriggerElement(trigger)}
        </AlertDialogPrimitive.Trigger>
      ) : null}
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay data-slot="alert-dialog-overlay" className={overlayBase} />
        <AlertDialogPrimitive.Content
          {...contentProps}
          ref={composedContentRef}
          data-slot="alert-dialog-content"
          // Without a description Radix still points here, at an id no element
          // has: leave the attribute out.
          {...(description ? {} : { "aria-describedby": undefined })}
          className={cn(dialogContentBase, "max-w-lg", className)}
          onCloseAutoFocus={returnFocus}
          // Escape is the keyboard's "Cancelar", so it calls `onCancel` too
          // (once: not again while the dialog closes). Escape typed with
          // focus in a toast (they float above the dialog) is for the toast.
          onEscapeKeyDown={(e) => {
            if (isToastFocused() || pendingRef.current) {
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
              {/* Pending: `aria-disabled`, not `disabled`, so the focus stays
                  on the button instead of falling to <body>. */}
              <AlertDialogPrimitive.Cancel asChild>
                <Button
                  variant="outline"
                  className={cn("min-w-24", pendingClass)}
                  aria-disabled={pending || undefined}
                  onClick={whileOpen(onCancel)}
                >
                  {cancelLabel}
                </Button>
              </AlertDialogPrimitive.Cancel>
              <AlertDialogPrimitive.Action asChild>
                <Button
                  variant={confirmVariant}
                  className={cn("min-w-24", pendingClass)}
                  aria-disabled={pending || undefined}
                  aria-busy={pending || undefined}
                  onClick={handleConfirm}
                >
                  {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
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
