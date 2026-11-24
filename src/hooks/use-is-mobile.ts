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
 * disagrees. `false` on the server and on the first render.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY)
    const onChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(mql.matches)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
