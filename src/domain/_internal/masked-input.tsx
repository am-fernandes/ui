"use client"

import * as React from "react"

import { FieldInput, type FieldInputProps } from "./field-input"

/**
 * One mask: which characters are part of the value and how they are laid out.
 * CPF, CNPJ, CEP and phone inputs are this component with a different spec.
 */
export interface MaskSpec {
  /** Maximum number of significant characters (11 for a CPF). */
  maxLength: number
  /**
   * Keeps, in order, the characters that can be part of the value, with no
   * length limit. Must be prefix-closed: `filter(a + b)` starts with
   * `filter(a)`. The caret is tracked by counting what this keeps.
   */
  filter: (text: string) => string
  /** Lays a clean value out with its separators. */
  mask: (raw: string) => string
  /**
   * Fixes the significant characters up before the limit is applied, by
   * dropping some from the front (the `55` of a phone number written with the
   * country code). `dropped` is how many went away.
   */
  normalize?: (significant: string) => { value: string; dropped: number }
  /**
   * Finds a complete number inside a pasted text ("CPF: 529.982.247-25, RG…")
   * and returns just that piece, or `null` when there is none. A complete
   * number replaces whatever the field had.
   */
  extract?: (text: string) => string | null
}

function normalize(spec: MaskSpec, significant: string) {
  return spec.normalize?.(significant) ?? { value: significant, dropped: 0 }
}

/** The clean value a text stands for: significant characters, up to the limit. */
export function cleanValue(spec: MaskSpec, text: string): string {
  return normalize(spec, spec.filter(text)).value.slice(0, spec.maxLength)
}

/** Index in `masked` right after its `count`-th significant character. */
export function caretAfter(spec: MaskSpec, masked: string, count: number): number {
  if (count <= 0) return 0
  let seen = 0
  for (let i = 0; i < masked.length; i++) {
    if (spec.filter(masked.charAt(i)) !== "") {
      seen += 1
      if (seen === count) return i + 1
    }
  }
  return masked.length
}

export interface MaskedEdit {
  /** The clean value after the edit. */
  raw: string
  /** Where the caret belongs in `mask(raw)`. */
  caret: number
}

/**
 * Turns what the browser left in the field after an edit into the new clean
 * value and the caret position that keeps the user where they were.
 *
 * The caret is restored by counting significant characters before it, so
 * separators coming and going never move it. When the edit removed only a
 * separator (Backspace right after the dot of `123.|456`), the neighbouring
 * significant character goes with it; otherwise the key would do nothing.
 *
 * The text is cleaned first and limited after: a pasted number is never cut
 * by its label or its punctuation. A key typed into a field that is already
 * full is refused, so the last digit is not pushed out.
 */
export function applyEdit(
  spec: MaskSpec,
  previous: string,
  edited: string,
  caret: number,
  inputType?: string,
): MaskedEdit {
  const previousMasked = spec.mask(previous)
  // Where the caret was before something was inserted at it.
  const caretBefore = Math.max(0, caret - Math.max(0, edited.length - previousMasked.length))
  let before = spec.filter(edited.slice(0, caret)).length
  let significant = spec.filter(edited)

  const removedOnlyASeparator =
    significant === previous && edited.length === previousMasked.length - 1
  if (removedOnlyASeparator) {
    if (inputType === "deleteContentBackward" && before > 0) {
      significant = significant.slice(0, before - 1) + significant.slice(before)
      before -= 1
    } else if (inputType === "deleteContentForward" && before < significant.length) {
      significant = significant.slice(0, before) + significant.slice(before + 1)
    }
  }

  const normalized = normalize(spec, significant)
  const typed = inputType === "insertText" || inputType === "insertCompositionText"
  if (typed && normalized.value.length > spec.maxLength) {
    return { raw: previous, caret: caretBefore }
  }
  // A typed key can also cost a character that was already there, when the
  // filter depends on position: a letter of a CNPJ pushed into the check
  // digits, where only digits fit. Refuse the key instead of losing it.
  const pushedOneOut =
    edited.length > previousMasked.length &&
    significant !== previous &&
    significant.length <= previous.length
  if (typed && pushedOneOut) {
    return { raw: previous, caret: caretBefore }
  }

  const raw = normalized.value.slice(0, spec.maxLength)
  const masked = spec.mask(raw)

  // Something was typed and none of it counted (a letter in a CPF): the caret
  // goes back to where it was before the key.
  if (raw === previous && edited.length > previousMasked.length) {
    return { raw, caret: caretBefore }
  }

  before = Math.max(0, Math.min(before - normalized.dropped, raw.length))
  let position = caretAfter(spec, masked, before)
  if (inputType === "deleteContentBackward") {
    // Backspace leaves the text after the caret untouched, so the caret stays
    // against it: after the separator in `11.|22`, not before it.
    while (position < masked.length && spec.filter(masked.charAt(position)) === "") position += 1
  }
  return { raw, caret: position }
}

/**
 * The edit a paste makes. A text holding a complete number replaces the
 * field; anything else goes in at the selection, like typing it would.
 */
export function applyPaste(
  spec: MaskSpec,
  previous: string,
  pasted: string,
  selectionStart: number,
  selectionEnd: number,
): MaskedEdit {
  const complete = spec.extract?.(pasted) ?? null
  if (complete != null) {
    return applyEdit(spec, previous, complete, complete.length, "insertFromPaste")
  }
  const current = spec.mask(previous)
  const edited = current.slice(0, selectionStart) + pasted + current.slice(selectionEnd)
  return applyEdit(spec, previous, edited, selectionStart + pasted.length, "insertFromPaste")
}

function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") ref(node)
  else if (ref != null) (ref as React.RefObject<T | null>).current = node
}

export interface MaskedInputProps extends FieldInputProps {
  /**
   * The clean value (no mask), controlled. `null` is an empty field. Leave it
   * out (`undefined`) and the field keeps its own value, starting from
   * `defaultValue`.
   */
  value?: string | null
  /** Initial clean value of an uncontrolled field. */
  defaultValue?: string
  /** Called with the clean value after every edit. */
  onValueChange?: (value: string) => void
}

interface InternalMaskedInputProps extends MaskedInputProps {
  spec: MaskSpec
  /** `data-slot` of the wrapper (`cpf-input`, `cep-input`…). */
  slot: string
}

function MaskedInput({
  spec,
  slot,
  value,
  defaultValue,
  onValueChange,
  ref,
  onPaste,
  ...props
}: InternalMaskedInputProps) {
  const isControlled = value !== undefined
  const initial = cleanValue(spec, String(defaultValue ?? ""))
  const [internal, setInternal] = React.useState(initial)
  // `String()`: a number handed in by mistake must not break the field.
  const cleaned = isControlled ? cleanValue(spec, String(value ?? "")) : internal
  const display = spec.mask(cleaned)

  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const setRefs = React.useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node
      assignRef(ref, node)
    },
    [ref],
  )

  // The caret to restore once the field shows `masked`. React rewrites the
  // input's value after every edit, which throws the caret to the end.
  const pendingCaret = React.useRef<{ masked: string; caret: number } | null>(null)
  const [, forceRender] = React.useReducer((n: number) => n + 1, 0)

  React.useLayoutEffect(() => {
    const pending = pendingCaret.current
    const el = inputRef.current
    if (pending == null || el == null) return
    // The parent has not taken the new value (yet): wait for it.
    if (pending.masked !== display) return
    pendingCaret.current = null
    // Write the value before the caret: when the edit changed nothing (a
    // letter in a CPF), the DOM still holds what the browser typed.
    if (el.value !== display) el.value = display
    const root = el.getRootNode() as Document | ShadowRoot
    if (root.activeElement === el) el.setSelectionRange(pending.caret, pending.caret)
  })

  const change = (raw: string) => {
    if (raw === cleaned) return
    if (!isControlled) setInternal(raw)
    onValueChange?.(raw)
  }

  // An uncontrolled field goes back to `defaultValue` when its form is reset,
  // like a native input. The latest values are read through a ref so the
  // listener is attached once.
  const onReset = React.useRef(() => {})
  onReset.current = () => {
    if (!isControlled) change(initial)
  }
  React.useEffect(() => {
    const form = inputRef.current?.form
    if (form == null) return
    const reset = () => onReset.current()
    form.addEventListener("reset", reset)
    return () => form.removeEventListener("reset", reset)
  }, [])

  const commit = (edit: MaskedEdit) => {
    pendingCaret.current = { masked: spec.mask(edit.raw), caret: edit.caret }
    change(edit.raw)
    // Always render again: the caret is restored in the layout effect even
    // when the value did not change.
    forceRender()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.target
    commit(
      applyEdit(
        spec,
        cleaned,
        el.value,
        el.selectionStart ?? el.value.length,
        (e.nativeEvent as InputEvent).inputType,
      ),
    )
  }

  // The paste is handled here, not left to the browser: the clipboard text
  // is looked at whole, so a number is found among labels and other numbers.
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    onPaste?.(e)
    if (e.defaultPrevented) return
    e.preventDefault()
    const el = e.currentTarget
    const start = el.selectionStart ?? el.value.length
    const end = el.selectionEnd ?? start
    commit(applyPaste(spec, cleaned, e.clipboardData?.getData("text") ?? "", start, end))
  }

  return (
    <FieldInput
      {...props}
      ref={setRefs}
      slot={slot}
      display={display}
      formValue={cleaned}
      onChange={handleChange}
      onPaste={handlePaste}
    />
  )
}

MaskedInput.displayName = "MaskedInput"

export { MaskedInput }
