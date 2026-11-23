import * as React from "react"

/**
 * A value that a parent may control (`value` given) or leave to the component
 * (`defaultValue`). The setter reports a change through `onChange` only when
 * the value really changes, and keeps it in local state when uncontrolled.
 */
export function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (next: T) => void,
): [T, (next: T) => void] {
  const [local, setLocal] = React.useState(defaultValue)
  const isControlled = value !== undefined
  const current = isControlled ? value : local

  const latest = React.useRef({ current, isControlled, onChange })
  latest.current = { current, isControlled, onChange }

  const setValue = React.useCallback((next: T) => {
    const { current: previous, isControlled: controlled, onChange: report } = latest.current
    if (Object.is(previous, next)) return
    if (!controlled) setLocal(next)
    report?.(next)
  }, [])

  return [current, setValue]
}
