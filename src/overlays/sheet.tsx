"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { type VariantProps, cva } from "class-variance-authority"
import { XIcon } from "lucide-react"
import type * as React from "react"

import { cn } from "@/lib/utils"
import { motionSheet, overlayBase } from "./_internal/animations"
import { modalBodyClass } from "./_internal/modal-body"
import { useModalOpen, useReturnFocus } from "./_internal/modal-state"
import { OverlayContainerProvider, useOverlayContainerState } from "./_internal/overlay-container"

// The panel is a column: title, description and footer keep their size, the
// body (`modalBodyClass`) takes what is left and scrolls. Side panels are as
// tall as the screen; top and bottom ones grow with their content up to the
// height of the screen, less 2rem of page left in view.
//
// `translate-0` moves nothing. It makes the panel the containing block of the
// `position: fixed` layers rendered inside it (popover, menu, tooltip) at rest
// too, as the slide animation's transform already does while it runs.
// Otherwise a layer opened during the slide is placed against the panel and,
// when the panel stops, against the screen: it jumps for a frame.
const sheetVariants = cva(
  cn(
    "fixed z-[var(--z-modal)] flex translate-0 flex-col gap-4 border-border-strong bg-popover p-6 text-popover-foreground transition",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    motionSheet,
  ),
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 max-h-[calc(100dvh-2rem)] border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 max-h-[calc(100dvh-2rem)] border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: { side: "right" },
  },
)

export interface SheetProps extends VariantProps<typeof sheetVariants> {
  trigger?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  /**
   * Body of the panel. It takes the room between the header and the footer
   * and scrolls when its content is taller than that.
   */
  children?: React.ReactNode
  /** Footer slot, at the bottom of the panel (flex-end, gap-2). */
  footer?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  closeLabel?: string
  hideCloseButton?: boolean
  /**
   * Handler do foco ao fechar. Por padrão o foco volta para o `trigger`; sem
   * `trigger` (aberto por `open`, a partir de um botão da página ou de um item
   * de menu), volta para o elemento que tinha o foco quando o painel abriu.
   * Chame `event.preventDefault()` para mandar o foco para outro lugar.
   */
  onCloseAutoFocus?: (event: Event) => void
  className?: string
}

function Sheet({
  trigger,
  title,
  description,
  children,
  footer,
  open,
  defaultOpen,
  onOpenChange,
  side = "right",
  closeLabel = "Close",
  hideCloseButton = false,
  onCloseAutoFocus,
  className,
}: SheetProps) {
  const [isOpen, setOpen] = useModalOpen({ open, defaultOpen, onOpenChange })
  // Without a `trigger`, focus goes back to where it was when the panel opened.
  const returnFocus = useReturnFocus({
    open: isOpen,
    hasTrigger: Boolean(trigger),
    onCloseAutoFocus,
  })
  // The popovers, menus and tooltips opened inside the panel render into its
  // content element (see `OverlayContainerProvider`).
  const [overlayContainer, contentRef] = useOverlayContainerState()

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={setOpen}>
      {trigger ? <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger> : null}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay data-slot="sheet-overlay" className={overlayBase} />
        <DialogPrimitive.Content
          ref={contentRef}
          data-slot="sheet-content"
          data-side={side}
          className={cn(sheetVariants({ side }), className)}
          onCloseAutoFocus={returnFocus}
        >
          <OverlayContainerProvider container={overlayContainer}>
            <DialogPrimitive.Title
              data-slot="sheet-title"
              className="shrink-0 text-lg font-semibold"
            >
              {title}
            </DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description
                data-slot="sheet-description"
                className="shrink-0 text-sm text-muted-foreground"
              >
                {description}
              </DialogPrimitive.Description>
            ) : null}
            {children ? (
              <div data-slot="sheet-body" className={cn(modalBodyClass(className), "flex-1")}>
                {children}
              </div>
            ) : null}
            {footer ? (
              // `mt-auto`: with no body to fill the panel, the footer still
              // goes to the bottom.
              <div data-slot="sheet-footer" className="mt-auto flex shrink-0 justify-end gap-2">
                {footer}
              </div>
            ) : null}
            {!hideCloseButton ? (
              <DialogPrimitive.Close
                aria-label={closeLabel}
                className="absolute right-4 top-4 cursor-pointer rounded-inner opacity-70 transition-opacity hover:opacity-100 focus-visible:focus-outline"
              >
                <XIcon className="size-4" />
                <span className="sr-only">{closeLabel}</span>
              </DialogPrimitive.Close>
            ) : null}
          </OverlayContainerProvider>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

Sheet.displayName = "Sheet"

export { Sheet }
