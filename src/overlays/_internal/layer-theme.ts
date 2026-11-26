"use client"

import * as React from "react"

/**
 * The theme of a floating layer (popover, menu, tooltip, dialog) opened from
 * a dark part of the page.
 *
 * The dark theme works with `dark` on <html> or on any ancestor
 * (`<section className="dark">`). A layer is portaled into <body>, out of
 * that ancestor: opened from a dark panel, a menu or a dialog came out in the
 * light theme. The layer looks at the element it was opened from (its
 * trigger, its anchor, or the focus when it opened) and, inside a dark part,
 * takes the `dark` class itself.
 *
 *   const theme = useLayerTheme()
 *   <Trigger ref={theme.anchorRef} />
 *   <Content ref={theme.contentRef} className={cn(..., theme.className)} />
 */
export function useLayerTheme() {
  const anchor = React.useRef<Element | null>(null)
  const [dark, setDark] = React.useState(false)
  const anchorRef = React.useCallback((node: Element | null) => {
    anchor.current = node
  }, [])
  // The content attaches when the layer opens, before any effect moves the
  // focus into it: the focus is still where the layer was opened from.
  const contentRef = React.useCallback((node: Element | null) => {
    if (!node) return
    const from = anchor.current?.isConnected ? anchor.current : node.ownerDocument.activeElement
    setDark(isInDarkPart(from))
  }, [])
  return { anchorRef, contentRef, className: dark ? "dark" : undefined }
}

/** Inside an element with `dark` other than <html> (which covers <body> already). */
export function isInDarkPart(element: Element | null | undefined): boolean {
  const scope = element?.closest(".dark")
  return scope != null && scope !== element?.ownerDocument.documentElement
}
