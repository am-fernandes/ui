type ValueElement = HTMLInputElement | HTMLTextAreaElement

/**
 * Calls `onAssign` every time code assigns `element.value` — which is how
 * react-hook-form's `register`, `setValue` and `reset` write to a field, and
 * fires no event at all. Typing and a native form reset do not pass here:
 * listen to `input` and to the form's `reset` for those.
 *
 * React already keeps its own accessor for `value` on the element, to tell a
 * real change from a repeated one. This one wraps whatever accessor is in
 * place and calls it first, so React's bookkeeping keeps working. Returns the
 * function that stops observing.
 */
export function observeValue(element: ValueElement, onAssign: () => void): () => void {
  const own = Object.getOwnPropertyDescriptor(element, "value")
  const inherited = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), "value")
  const base = own ?? inherited
  const get = base?.get
  const set = base?.set
  if (!get || !set || own?.configurable === false) return () => {}

  let observing = true
  function assign(this: ValueElement, next: string) {
    set?.call(this, next)
    if (observing) onAssign()
  }
  Object.defineProperty(element, "value", {
    configurable: true,
    enumerable: base.enumerable,
    get() {
      return get.call(this)
    },
    set: assign,
  })

  return () => {
    observing = false
    // Put the previous accessor back, unless someone wrapped this one in turn.
    if (Object.getOwnPropertyDescriptor(element, "value")?.set !== assign) return
    if (own) Object.defineProperty(element, "value", own)
    else Reflect.deleteProperty(element, "value")
  }
}
