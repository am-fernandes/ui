import type * as React from "react"

/**
 * The click handler of a control that is unavailable but not natively
 * disabled (`aria-disabled="true"`): the click goes nowhere. It does not
 * follow a link or submit a form (`preventDefault`), and does not reach a
 * clickable row or card around it (`stopPropagation`), the same as a click on
 * a natively disabled button.
 *
 * Enter and Space on a button, and Enter on a link, arrive as a click, so
 * this covers the keyboard too.
 */
export function ignoreActivation(event: React.MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
}

/**
 * Keys a menu or a list opens on, from its trigger: Radix opens a
 * `DropdownMenu` and a `Select` on keydown (and on pointerdown), not on
 * click, so `ignoreActivation` alone let a busy trigger open its menu.
 */
const OPENING_KEYS = new Set(["Enter", " ", "ArrowDown", "ArrowUp"])

/**
 * The other handlers of an unavailable control, so that nothing it triggers
 * opens: `pointerdown` does not reach the overlay that wraps it, and the
 * keys a menu opens on go nowhere. The other keys (Tab, Escape) still reach
 * `onKeyDown`.
 */
export function unavailableHandlers(onKeyDown: React.KeyboardEventHandler<never> | undefined) {
  return {
    onPointerDown: undefined,
    onKeyDown: (event: React.KeyboardEvent<never>) => {
      if (OPENING_KEYS.has(event.key)) {
        event.preventDefault()
        return
      }
      onKeyDown?.(event)
    },
  }
}
