"use client"

import * as React from "react"

/**
 * Open state of a modal, controlled (`open`) or not (`defaultOpen`).
 *
 * Radix would keep the uncontrolled state by itself, but then the wrapper
 * cannot read it — and it has to: to remember where focus was when the modal
 * opened, and to act only while it is open.
 */
export function useModalOpen({
  open,
  defaultOpen,
  onOpenChange,
}: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false)
  const isOpen = open ?? uncontrolledOpen
  const setOpen = (next: boolean) => {
    if (open === undefined) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }
  return [isOpen, setOpen] as const
}

/**
 * Gives focus back when a modal that has no `trigger` closes.
 *
 * Radix returns focus to the `Trigger` element only. A modal opened by state
 * (`open`), from a button of the page or from a menu item, has none, and
 * focus was left on `<body>`: the keyboard user started again from the top
 * of the page. This remembers where focus was when the modal opened and
 * returns it there.
 *
 * Returns the handler for Radix's `onCloseAutoFocus`. The consumer's own
 * handler runs first and can take over with `event.preventDefault()`.
 */
export function useReturnFocus({
  open,
  hasTrigger,
  onCloseAutoFocus,
}: {
  open: boolean
  hasTrigger: boolean
  onCloseAutoFocus?: (event: Event) => void
}) {
  // Read while rendering the pass that opens the modal: the element is still
  // there and still focused. An effect would be too late for a menu item,
  // which the same commit can remove.
  const [state, setState] = React.useState<{ open: boolean; candidates: HTMLElement[] }>({
    open: false,
    candidates: [],
  })
  if (open !== state.open) {
    setState({ open, candidates: open ? returnFocusCandidates() : state.candidates })
  }

  return (event: Event) => {
    onCloseAutoFocus?.(event)
    if (event.defaultPrevented) return
    // With a trigger, Radix's default (focus the trigger) is the right one.
    if (hasTrigger) return
    event.preventDefault()
    for (const element of state.candidates) {
      if (!element.isConnected) continue
      element.focus()
      if (document.activeElement === element) return
    }
  }
}

/**
 * The focused element and, after it, the triggers of the popups it is in.
 * An item of a menu (or a button in a popover) that opens a modal is gone by
 * the time the modal closes: the menu closed. Its trigger is the next best
 * place, and the one a mouse user would look at.
 */
function returnFocusCandidates(): HTMLElement[] {
  if (typeof document === "undefined") return []
  const active = document.activeElement
  if (!(active instanceof HTMLElement) || active === document.body) return []
  const candidates = [active]
  let current: HTMLElement | null = active
  for (let depth = 0; depth < 5 && current; depth++) {
    current = popupTrigger(current)
    if (current && !candidates.includes(current)) candidates.push(current)
  }
  return candidates
}

function popupTrigger(element: HTMLElement): HTMLElement | null {
  const popup = element.closest<HTMLElement>('[role="menu"], [role="dialog"], [role="listbox"]')
  if (!popup) return null
  // A menu is labelled by its trigger (WAI-ARIA menu button)…
  if (popup.getAttribute("role") === "menu") {
    const trigger = byId(popup.getAttribute("aria-labelledby"))
    if (trigger) return trigger
  }
  // …and any popup is controlled by it. (Compared in code: Radix ids are not
  // valid in a selector without escaping.)
  if (!popup.id) return null
  for (const controller of document.querySelectorAll<HTMLElement>("[aria-controls]")) {
    if (controller.getAttribute("aria-controls") === popup.id) return controller
  }
  return null
}

function byId(id: string | null) {
  return id ? document.getElementById(id) : null
}
