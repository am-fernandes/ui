"use client"

import * as React from "react"
import { flushSync } from "react-dom"

import { parseBRNumber } from "@/lib/currency"
import {
  type Decimals,
  MAX_UNITS,
  applyNumberEdit,
  caretBeforeDigits,
  clampUnits,
  formatUnits,
  fromUnits,
  toUnits,
} from "./decimal-engine"
import { FieldInput, type FieldInputProps } from "./field-input"

/** The field chrome and native attributes; `min` and `max` are numbers here. */
export type DecimalFieldProps = Omit<FieldInputProps, "min" | "max">

interface DecimalInputProps extends DecimalFieldProps {
  /** `data-slot` of the wrapper (`currency-input`, `percentage-input`). */
  slot: string
  /** Fixed text before the value (`R$`). */
  leading?: React.ReactNode
  /** Fixed text after the value (`%`). */
  trailing?: React.ReactNode
  /** Decimal places shown and kept. */
  decimals: Decimals
  /** Controlled value. `undefined`: the field keeps its own value. */
  value: number | null | undefined
  /** Initial value of an uncontrolled field. */
  defaultValue?: number | null
  /** `null` only reaches it when `allowEmpty`. */
  onValueChange?: (value: number | null) => void
  /** An empty field is `null` (and shows the placeholder) instead of zero. */
  allowEmpty: boolean
  allowNegative: boolean
  min?: number
  max?: number
}

function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") ref(node)
  else if (ref != null) (ref as React.RefObject<T | null>).current = node
}

/**
 * The numeric field behind `CurrencyInput` and `PercentageInput`.
 *
 * Typed digits fill the smallest unit first; a pasted text is read as a
 * number written by a Brazilian and replaces the value. The caret is put
 * back after every edit by the digits that follow it (see `decimal-engine`).
 */
function DecimalInput({
  slot,
  leading,
  trailing,
  decimals,
  value,
  defaultValue,
  onValueChange,
  allowEmpty,
  allowNegative,
  min,
  max,
  ref,
  onPaste,
  onBlur,
  onKeyDown,
  ...props
}: DecimalInputProps) {
  // Anything that is not a number (undefined, NaN) is an empty field, never
  // "NaN,NaN": `null` when the field can be empty, zero otherwise.
  const normalize = (input: number | null | undefined) =>
    toUnits(input, decimals) ?? (allowEmpty ? null : 0)

  const isControlled = value !== undefined
  const initial = normalize(defaultValue)
  const [internal, setInternal] = React.useState(initial)
  const units = isControlled ? normalize(value) : internal

  // A minus sign typed before any digit: shown, not part of the value yet.
  const [negativeDraft, setNegativeDraft] = React.useState(false)
  const display = formatUnits(units, decimals, negativeDraft)

  const minUnits = toUnits(min, decimals) ?? undefined
  const maxUnits = toUnits(max, decimals) ?? undefined

  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const setRefs = React.useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node
      assignRef(ref, node)
    },
    [ref],
  )

  // The caret to restore once the field shows `text`. React rewrites the
  // input's value after every edit, which throws the caret to the end.
  const pendingCaret = React.useRef<{ text: string; caret: number } | null>(null)
  const [, forceRender] = React.useReducer((n: number) => n + 1, 0)
  // Whether the user changed the value since the field took focus: only
  // then is it brought inside the limits on blur.
  const editedSinceFocus = React.useRef(false)

  React.useLayoutEffect(() => {
    const pending = pendingCaret.current
    const el = inputRef.current
    if (pending == null || el == null) return
    // The parent has not taken the new value (yet): wait for it.
    if (pending.text !== display) return
    pendingCaret.current = null
    if (el.value !== display) el.value = display
    const root = el.getRootNode() as Document | ShadowRoot
    if (root.activeElement === el) el.setSelectionRange(pending.caret, pending.caret)
  })

  const change = (next: number | null) => {
    if (next === units) return
    if (!isControlled) setInternal(next)
    onValueChange?.(next == null ? null : fromUnits(next, decimals))
  }

  // An uncontrolled field goes back to its default when the form is reset.
  const onReset = React.useRef(() => {})
  onReset.current = () => {
    if (isControlled) return
    setNegativeDraft(false)
    change(initial)
  }
  React.useEffect(() => {
    const form = inputRef.current?.form
    if (form == null) return
    const reset = () => onReset.current()
    form.addEventListener("reset", reset)
    return () => form.removeEventListener("reset", reset)
  }, [])

  const commit = (next: number | null, draft: boolean, caret: (text: string) => number) => {
    const text = formatUnits(next, decimals, draft)
    pendingCaret.current = { text, caret: caret(text) }
    setNegativeDraft(draft)
    editedSinceFocus.current = true
    change(next)
    // Always render again: the caret is restored in the layout effect even
    // when the value did not change.
    forceRender()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.target
    const edit = applyNumberEdit({
      previous: units,
      previousText: display,
      edited: el.value,
      caret: el.selectionStart ?? el.value.length,
      inputType: (e.nativeEvent as InputEvent).inputType,
      allowNegative,
      allowEmpty,
      min: minUnits,
      max: maxUnits,
    })
    const refused = edit.refused
    commit(edit.units, edit.negativeDraft, (text) =>
      refused ? refused.caret : caretBeforeDigits(text, edit.digitsAfterCaret, edit.stick),
    )
  }

  // A pasted text is a number someone wrote ("1.500", "R$ 2.350,90",
  // "12,5%"): it is read whole and replaces the value.
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    onPaste?.(e)
    // A read-only field takes no paste; the browser already ignores it.
    if (e.defaultPrevented || props.readOnly) return
    e.preventDefault()
    const pasted = parseBRNumber(e.clipboardData?.getData("text") ?? "")
    if (pasted == null) return
    const next = toUnits(allowNegative ? pasted : Math.abs(pasted), decimals)
    if (next == null || Math.abs(next) > MAX_UNITS) return
    // Past the far limit: not taken, like a key that would go past it.
    if (maxUnits != null && next > maxUnits) return
    if (minUnits != null && next < 0 && next < minUnits) return
    commit(next, false, (text) => text.length)
  }

  const applyLimits = () => {
    // While typing the value passes below `min` on its way up, so the near
    // limit is only applied when the user is done.
    if (editedSinceFocus.current && units != null) change(clampUnits(units, minUnits, maxUnits))
    editedSinceFocus.current = false
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onBlur?.(e)
    setNegativeDraft(false)
    applyLimits()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e)
    if (e.key !== "Enter" || e.defaultPrevented || props.readOnly) return
    flushSync(applyLimits)
  }

  return (
    <FieldInput
      // iOS has no minus key on its numeric keypad.
      inputMode={allowNegative ? "text" : "numeric"}
      {...props}
      ref={setRefs}
      slot={slot}
      leading={leading}
      trailing={trailing}
      display={display}
      // The form receives the number itself ("1234.56"), not "1.234,56".
      formValue={units == null ? "" : String(fromUnits(units, decimals))}
      onChange={handleChange}
      onPaste={handlePaste}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  )
}

DecimalInput.displayName = "DecimalInput"

export { DecimalInput }
