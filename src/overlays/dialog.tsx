"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import type * as React from "react"

import { cn } from "@/lib/utils"
import { dialogContentBase, overlayBase } from "./_internal/animations"
import { modalBodyClass } from "./_internal/modal-body"
import { DEFAULT_CLOSE_LABEL, ModalCloseButton, titleBesideClose } from "./_internal/modal-close"
import {
  type ModalFooter,
  renderModalFooter,
  useModalOpen,
  useReturnFocus,
} from "./_internal/modal-state"
import { OverlayContainerProvider, useOverlayContainerState } from "./_internal/overlay-container"
import { isToastFocused, isToastPress } from "./_internal/toasts"

export interface DialogProps {
  /** Element that opens the dialog. Omit for fully controlled use. */
  trigger?: React.ReactNode
  /** Required for a11y (Radix logs a warning otherwise). */
  title: React.ReactNode
  description?: React.ReactNode
  /**
   * Body content, between the header and the footer. The dialog never grows
   * past the screen: when the body is taller than the room left, it scrolls
   * and title, description and footer stay in place.
   */
  children?: React.ReactNode
  /**
   * Footer slot (renders flex-end justify with gap-2). Stays at the bottom.
   *
   * Also takes a function, which receives `close`: the way an uncontrolled
   * modal closes from "Cancelar".
   *
   * ```tsx
   * footer={({ close }) => (
   *   <>
   *     <Button variant="outline" onClick={close}>Cancelar</Button>
   *     <Button type="submit" form="proposta">Salvar</Button>
   *   </>
   * )}
   * ```
   */
  footer?: ModalFooter
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
  /** Name of the X. @default "Fechar" */
  closeLabel?: string
  /** Handler do auto-focus do Radix ao abrir (ex.: direcionar o foco inicial). */
  onOpenAutoFocus?: (event: Event) => void
  /**
   * Handler do foco ao fechar. Por padrão o foco volta para o `trigger`; sem
   * `trigger` (aberto por `open`, a partir de um botão da página ou de um item
   * de menu), volta para o elemento que tinha o foco quando o diálogo abriu.
   * Chame `event.preventDefault()` para mandar o foco para outro lugar.
   */
  onCloseAutoFocus?: (event: Event) => void
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
  closeLabel = DEFAULT_CLOSE_LABEL,
  onOpenAutoFocus,
  onCloseAutoFocus,
  size = "md",
  className,
}: DialogProps) {
  const showCloseButton = dismissible && !hideCloseButton
  const [isOpen, setOpen] = useModalOpen({ open, defaultOpen, onOpenChange })
  // Without a `trigger`, focus goes back to where it was when the dialog opened.
  const returnFocus = useReturnFocus({
    open: isOpen,
    hasTrigger: Boolean(trigger),
    onCloseAutoFocus,
  })
  // The popovers, menus and tooltips opened inside the dialog render into its
  // content element (see `OverlayContainerProvider`).
  const [overlayContainer, contentRef] = useOverlayContainerState()
  const footerContent = renderModalFooter(footer, () => setOpen(false))

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={setOpen}>
      {trigger ? (
        <DialogPrimitive.Trigger asChild data-slot="dialog-trigger">
          {trigger}
        </DialogPrimitive.Trigger>
      ) : null}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay data-slot="dialog-overlay" className={overlayBase} />
        <DialogPrimitive.Content
          ref={contentRef}
          data-slot="dialog-content"
          // Without a description Radix still points here, at an id no element
          // has: leave the attribute out.
          {...(description ? {} : { "aria-describedby": undefined })}
          className={cn(dialogContentBase, SIZE_CLASSES[size], className)}
          onOpenAutoFocus={onOpenAutoFocus}
          onCloseAutoFocus={returnFocus}
          onEscapeKeyDown={(e) => {
            if (!dismissible || isToastFocused()) e.preventDefault()
          }}
          // What is "outside" is Radix's call, and it follows the React tree:
          // a press in a popover, menu, calendar or list opened from the
          // dialog (they also render inside its content) is a press inside.
          // The dialog used to add guesses of its own, down to "is there a
          // grid anywhere in the document", and stopped closing on a page
          // with a table, a date field or a command list. The one exception
          // is a toast: it floats above the dialog and belongs to no modal.
          onPointerDownOutside={(e) => {
            if (!dismissible || isToastPress(e)) e.preventDefault()
          }}
          onInteractOutside={(e) => {
            if (!dismissible || isToastPress(e)) e.preventDefault()
          }}
        >
          <OverlayContainerProvider container={overlayContainer}>
            <DialogPrimitive.Title
              data-slot="dialog-title"
              className={cn("shrink-0 text-lg font-semibold", showCloseButton && titleBesideClose)}
            >
              {title}
            </DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description
                data-slot="dialog-description"
                className="shrink-0 text-sm text-muted-foreground"
              >
                {description}
              </DialogPrimitive.Description>
            ) : null}
            {children ? (
              <div data-slot="dialog-body" className={modalBodyClass(className)}>
                {children}
              </div>
            ) : null}
            {footerContent ? (
              <div data-slot="dialog-footer" className="flex shrink-0 justify-end gap-2">
                {footerContent}
              </div>
            ) : null}
            {showCloseButton ? <ModalCloseButton label={closeLabel} slot="dialog-close" /> : null}
          </OverlayContainerProvider>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

Dialog.displayName = "Dialog"

export { Dialog }
