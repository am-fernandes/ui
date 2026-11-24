"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { type VariantProps, cva } from "class-variance-authority"
import type * as React from "react"

import { cn } from "@/lib/utils"
import { motionSheet, sheetOverlayBase } from "./_internal/animations"
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
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
      },
      // Width of a side panel from the `sm` breakpoint up (below it, 3/4 of
      // the screen). Top and bottom panels take the whole width.
      size: { sm: "", md: "", lg: "" },
    },
    compoundVariants: [
      { side: ["left", "right"], size: "sm", className: "sm:max-w-xs" },
      { side: ["left", "right"], size: "md", className: "sm:max-w-sm" },
      { side: ["left", "right"], size: "lg", className: "sm:max-w-2xl" },
    ],
    defaultVariants: { side: "right", size: "md" },
  },
)

export interface SheetProps extends Omit<VariantProps<typeof sheetVariants>, "size"> {
  /**
   * Width of a side panel (`left`, `right`) from the `sm` breakpoint up:
   * `sm` 320px, `md` 384px, `lg` 672px. Below it, 3/4 of the screen. Top and
   * bottom panels take the whole width.
   * @default "md"
   */
  size?: "sm" | "md" | "lg"
  trigger?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  /**
   * Body of the panel. It takes the room between the header and the footer
   * and scrolls when its content is taller than that.
   */
  children?: React.ReactNode
  /**
   * Footer slot, at the bottom of the panel (flex-end, gap-2).
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
   * When `false`, Escape and a press outside do not close the panel, and the
   * X is hidden: for a step that has to end on one of the footer's buttons.
   * @default true
   */
  dismissible?: boolean
  /** Name of the X. @default "Fechar" */
  closeLabel?: string
  hideCloseButton?: boolean
  /** Radix's auto-focus on open (e.g. to choose the first focused field). */
  onOpenAutoFocus?: (event: Event) => void
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
  size = "md",
  dismissible = true,
  closeLabel = DEFAULT_CLOSE_LABEL,
  hideCloseButton = false,
  onOpenAutoFocus,
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
  const footerContent = renderModalFooter(footer, () => setOpen(false))

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={setOpen}>
      {trigger ? <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger> : null}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay data-slot="sheet-overlay" className={sheetOverlayBase} />
        <DialogPrimitive.Content
          ref={contentRef}
          data-slot="sheet-content"
          // Without a description Radix still points here, at an id no element
          // has: leave the attribute out.
          {...(description ? {} : { "aria-describedby": undefined })}
          data-side={side}
          data-size={size}
          className={cn(sheetVariants({ side, size }), className)}
          onOpenAutoFocus={onOpenAutoFocus}
          onCloseAutoFocus={returnFocus}
          // A toast floats above the panel and belongs to no modal: a press on
          // it, or Escape typed in it, is not for the panel.
          onEscapeKeyDown={(e) => {
            if (!dismissible || isToastFocused()) e.preventDefault()
          }}
          onPointerDownOutside={(e) => {
            if (!dismissible || isToastPress(e)) e.preventDefault()
          }}
          onInteractOutside={(e) => {
            if (!dismissible || isToastPress(e)) e.preventDefault()
          }}
        >
          <OverlayContainerProvider container={overlayContainer}>
            <DialogPrimitive.Title
              data-slot="sheet-title"
              className={cn(
                "shrink-0 text-lg font-semibold",
                dismissible && !hideCloseButton && titleBesideClose,
              )}
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
            {footerContent ? (
              // `mt-auto`: with no body to fill the panel, the footer still
              // goes to the bottom.
              <div data-slot="sheet-footer" className="mt-auto flex shrink-0 justify-end gap-2">
                {footerContent}
              </div>
            ) : null}
            {dismissible && !hideCloseButton ? (
              <ModalCloseButton label={closeLabel} slot="sheet-close" />
            ) : null}
          </OverlayContainerProvider>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

Sheet.displayName = "Sheet"

export { Sheet }
