import * as React from "react"

const subscribe = () => () => {}

/**
 * `false` on the server and while the browser hydrates its HTML, `true` from
 * then on (and from the first render of a page that only renders in the
 * browser). What depends on the browser's clock, or on anything else the
 * server cannot know, waits for it: otherwise the server HTML and the
 * hydrating render differ and React throws the server HTML away.
 */
export function useHydrated(): boolean {
  return React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
