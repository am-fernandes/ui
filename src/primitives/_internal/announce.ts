"use client"

import * as React from "react"

const SLOT = "live-announcer"
/** A region that was just created needs a moment before a change in it is read. */
const SPEAK_DELAY_MS = 100
/** A message nobody will look for later: it leaves the page after being read. */
const CLEAR_AFTER_MS = 7000

let speakTimer: number | undefined
let clearTimer: number | undefined

function getRegion(): HTMLElement {
  const existing = document.querySelector<HTMLElement>(`[data-slot="${SLOT}"]`)
  if (existing) return existing
  const region = document.createElement("div")
  region.dataset.slot = SLOT
  // `aria-live` and no `role="status"`: the region is read the same way, and a
  // `getByRole("status")` in an app's tests does not find a second status.
  // Radix leaves `[aria-live]` elements out when a dialog hides the page.
  region.setAttribute("aria-live", "polite")
  region.setAttribute("aria-atomic", "true")
  Object.assign(region.style, {
    position: "absolute",
    width: "1px",
    height: "1px",
    margin: "-1px",
    padding: "0",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: "0",
  })
  document.body.appendChild(region)
  return region
}

/**
 * Says `message` to screen readers, politely (after what is being read), with
 * no visible change. One region for the whole page, created on first use, so
 * a component can announce a change of state without adding a live region to
 * its own markup or to its accessible name.
 */
export function announce(message: string) {
  if (typeof document === "undefined") return
  const region = getRegion()
  // Emptied first: the same message twice in a row is read twice.
  region.textContent = ""
  window.clearTimeout(speakTimer)
  window.clearTimeout(clearTimer)
  speakTimer = window.setTimeout(() => {
    region.textContent = message
    clearTimer = window.setTimeout(() => {
      region.textContent = ""
    }, CLEAR_AFTER_MS)
  }, SPEAK_DELAY_MS)
}

/**
 * Announces `message` every time `active` turns on. The state a component
 * mounts in is not a change, so it is never announced.
 */
export function useAnnounceWhen(active: boolean, message: string) {
  const wasActive = React.useRef(active)
  React.useEffect(() => {
    if (active && !wasActive.current) announce(message)
    wasActive.current = active
  }, [active, message])
}
