import * as React from "react"

type PossibleRef<T> = React.Ref<T> | undefined

/**
 * Hands `node` to a ref. Returns what a callback ref returned: in React 19 a
 * callback ref may return a cleanup, which React calls on detach instead of
 * calling the ref with `null`.
 */
function setRef<T>(ref: PossibleRef<T>, node: T | null): (() => void) | undefined {
  if (typeof ref === "function") {
    const result = ref(node)
    return typeof result === "function" ? result : undefined
  }
  if (ref != null) (ref as React.RefObject<T | null>).current = node
  return undefined
}

/**
 * One ref callback for several refs (the component's own and the consumer's),
 * with React 19 cleanups kept: a callback ref that returns a cleanup gets it
 * called on detach, and is never called with `null`. The others are reset
 * with `null`, as React would do. The same contract as Radix's
 * `composeRefs`, which is not a direct dependency of the library.
 */
export function composeRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  return (node) => {
    const cleanups = refs.map((ref) => setRef(ref, node))
    return () => {
      cleanups.forEach((cleanup, index) => {
        if (typeof cleanup === "function") cleanup()
        else setRef(refs[index], null)
      })
    }
  }
}

/** `composeRefs` kept stable across renders while the refs are the same. */
export function useComposedRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  return React.useCallback(composeRefs(...refs), refs)
}
