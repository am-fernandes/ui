import type * as React from "react"

/** Hands `node` to a callback ref or an object ref, whichever the consumer passed. */
export function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") ref(node)
  else if (ref != null) (ref as React.RefObject<T | null>).current = node
}
