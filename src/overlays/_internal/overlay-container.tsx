"use client"

import * as React from "react"

/**
 * Where the floating layers opened from inside a modal are rendered.
 *
 * A Popover, DropdownMenu or Tooltip is normally portaled into `<body>`. From
 * inside a Dialog, AlertDialog or Sheet that puts it outside the modal in the
 * DOM, and the modal treats the rest of the page as locked: the wheel and
 * touch scrolling are blocked there, so a long option list did not scroll.
 * These modals publish their content element here and the floating layers
 * portal into it instead. Inside the modal they scroll, follow its open and
 * close animation, stay below a second modal stacked on top, and a click in
 * them is, for the modal, a click inside.
 *
 * - `undefined`: not inside a modal — portal into `<body>`, as always.
 * - `null`: inside a modal whose content is not in the DOM yet (its first
 *   render pass) — wait, instead of mounting in `<body>` and moving after.
 * - an element: portal into it.
 */
type OverlayContainer = HTMLElement | null | undefined

const OverlayContainerContext = React.createContext<OverlayContainer>(undefined)

export function OverlayContainerProvider({
  container,
  children,
}: {
  /** The value from `useOverlayContainerState`. */
  container: OverlayContainer
  children: React.ReactNode
}) {
  return (
    <OverlayContainerContext.Provider value={container}>
      {children}
    </OverlayContainerContext.Provider>
  )
}

/** See `OverlayContainerContext` for the three possible values. */
export function useOverlayContainer() {
  return React.useContext(OverlayContainerContext)
}

/**
 * For a modal: the value to publish and the ref to put on its content element.
 *
 * The content of our modals is the containing block of the `position: fixed`
 * layers inside it (it is moved with `translate`), so a content that clips
 * would cut every layer that leaves its box: a calendar below the last field,
 * a tooltip near the edge. That happens when the consumer added `overflow-*`
 * to the modal's `className` — the usual way to make the whole modal scroll
 * before its body did. Those modals keep the old behaviour: layers in `<body>`.
 */
export function useOverlayContainerState() {
  const [container, setContainer] = React.useState<OverlayContainer>(null)
  const ref = React.useCallback((node: HTMLElement | null) => {
    if (!node) {
      setContainer(null)
      return
    }
    const { overflowX, overflowY } = window.getComputedStyle(node)
    const clips = isClipping(overflowX) || isClipping(overflowY)
    setContainer(clips ? undefined : node)
  }, [])
  return [container, ref] as const
}

// jsdom reports "" for a property no stylesheet sets.
function isClipping(overflow: string) {
  return overflow !== "" && overflow !== "visible"
}
