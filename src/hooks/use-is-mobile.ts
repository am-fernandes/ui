"use client"

import * as React from "react"

/**
 * The breakpoint of Tailwind's `md:` (48rem). Written in rem, like the CSS,
 * so the hook and the stylesheet agree when the user raises the browser's
 * default font size: with 20px text, 48rem is 960px, not 768px.
 */
export const MOBILE_QUERY = "not all and (min-width: 48rem)"

/**
 * `true` below Tailwind's `md:` breakpoint. Same query as the CSS, so a
 * component that switches its layout with `md:` and with this hook never
 * disagrees. `false` on the server and while the page hydrates (the server
 * cannot know the screen); in the browser it is right from the first render,
 * so what renders only on one side of the breakpoint does not mount once on
 * the wrong side first.
 */
export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

function subscribe(onChange: () => void) {
  if (typeof window.matchMedia !== "function") return () => {}
  const mql = window.matchMedia(MOBILE_QUERY)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

function getSnapshot() {
  return typeof window.matchMedia === "function" && window.matchMedia(MOBILE_QUERY).matches
}

function getServerSnapshot() {
  return false
}
