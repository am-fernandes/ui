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
