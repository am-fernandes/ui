"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { IconButton } from "../../primitives/icon-button"

/** Default name of the X of Dialog and Sheet. */
export const DEFAULT_CLOSE_LABEL = "Fechar"

/**
 * Room the title leaves for the X, so a long title wraps before it instead
 * of running under it.
 */
export const titleBesideClose = "pe-8"

/**
 * The X of Dialog and Sheet: a small `IconButton` (32px, so the target passes
 * WCAG 2.5.8 without the spacing exception), with the state layer on hover
 * and press like every other control, in the top-right corner of the modal.
 * No tooltip: the X is self-explanatory, and the label is its name.
 *
 * `top-5.5` (22px) centres it on the first line of the title: the modal's
 * 24px padding plus half of the title's 28px line, less half of the X.
 */
export function ModalCloseButton({ label, slot }: { label: string; slot: string }) {
  return (
    <DialogPrimitive.Close asChild>
      <IconButton
        data-slot={slot}
        icon={<XIcon />}
        label={label}
        size="sm"
        tooltip={false}
        className="absolute right-4 top-5.5"
      />
    </DialogPrimitive.Close>
  )
}
