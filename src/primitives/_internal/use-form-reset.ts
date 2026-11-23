import * as React from "react"

/**
 * Calls `onReset` when the form around `element` is reset (`<button
 * type="reset">` or `form.reset()`). Native fields and Radix Checkbox go back
 * by themselves; Radix Switch and RadioGroup keep their state, so a reset
 * form showed, and submitted, the old choice.
 *
 * The `reset` event fires before the browser resets the fields: the state set
 * here renders after that, and the hidden inputs Radix keeps for the form
 * follow it.
 */
export function useFormReset(element: HTMLElement | null, onReset: () => void) {
  const latest = React.useRef(onReset)
  latest.current = onReset

  React.useEffect(() => {
    if (!element) return
    // A <button> knows its form, `form="id"` included; a <div> looks up.
    const form = element instanceof HTMLButtonElement ? element.form : element.closest("form")
    if (!form) return
    const handleReset = () => latest.current()
    form.addEventListener("reset", handleReset)
    return () => form.removeEventListener("reset", handleReset)
  }, [element])
}
