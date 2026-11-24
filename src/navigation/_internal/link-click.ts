import type * as React from "react"

/**
 * A click on a link that the browser handles by itself: Ctrl/⌘ or the middle
 * button open a new tab, Shift a new window, Alt downloads. The current page
 * must stay as it is (same page number, menu still open, nothing selected).
 */
export function isModifiedClick(event: React.MouseEvent) {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
}
