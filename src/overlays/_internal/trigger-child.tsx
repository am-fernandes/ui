"use client"

import type * as React from "react"

import { Button } from "../../primitives/button"

/**
 * Text given where an element is expected.
 *
 * The overlays hand their trigger to Radix with `asChild`: Radix's Slot puts
 * its props and ref on the child element, and renders nothing when the child
 * is text. `trigger="Abrir"` (typed `ReactNode`, so allowed) gave an empty
 * page with no error.
 */
function isText(node: React.ReactNode): node is string | number {
  return typeof node === "string" || typeof node === "number"
}

/** A text trigger becomes an outline `Button` with that text. */
export function asTriggerElement(node: React.ReactNode): React.ReactNode {
  if (!isText(node)) return node
  return (
    <Button type="button" variant="outline">
      {node}
    </Button>
  )
}

/**
 * Text that a tooltip explains (a term, an abbreviation): a span that takes
 * focus, so the keyboard reaches the explanation, marked with a dotted
 * underline.
 */
export function asTooltipTarget(node: React.ReactNode): React.ReactNode {
  if (!isText(node)) return node
  return (
    <span
      // biome-ignore lint/a11y/noNoninteractiveTabindex: the keyboard has to reach the explanation of the term
      tabIndex={0}
      className="cursor-help rounded-inner underline decoration-dotted underline-offset-4 focus-visible:focus-outline"
    >
      {node}
    </span>
  )
}

/** Text a popover points at (`anchor`): a span to measure. */
export function asAnchorElement(node: React.ReactNode): React.ReactNode {
  return isText(node) ? <span>{node}</span> : node
}
