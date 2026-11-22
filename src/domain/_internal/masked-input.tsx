"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { FieldShell, type LabelPosition } from "../../primitives/_internal/field-shell"
import { useFieldIds } from "../../primitives/_internal/use-field-ids"

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
}

/** The clean value a text stands for: significant characters, up to the limit. */
export function cleanValue(spec: MaskSpec, text: string): string {
  return spec.filter(text).slice(0, spec.maxLength)
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
 */
export function applyEdit(
  spec: MaskSpec,
  previous: string,
  edited: string,
  caret: number,
  inputType?: string,
): MaskedEdit {
  const previousMasked = spec.mask(previous)
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

  const raw = significant.slice(0, spec.maxLength)
  const masked = spec.mask(raw)

  // Something was typed and none of it counted (a letter in a CPF): the caret
  // goes back to where it was before the key.
  if (raw === previous && edited.length > previousMasked.length) {
    return { raw, caret: Math.max(0, caret - (edited.length - previousMasked.length)) }
  }

  let position = caretAfter(spec, masked, Math.min(before, raw.length))
  if (inputType === "deleteContentBackward") {
    // Backspace leaves the text after the caret untouched, so the caret stays
    // against it: after the separator in `11.|22`, not before it.
    while (position < masked.length && spec.filter(masked.charAt(position)) === "") position += 1
  }
  return { raw, caret: position }
}

function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") ref(node)
  else if (ref != null) (ref as React.RefObject<T | null>).current = node
}

export interface MaskedInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  /** The clean value (no mask). */
  value: string
  onValueChange: (value: string) => void
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  labelPosition?: LabelPosition
  required?: boolean
  ref?: React.Ref<HTMLInputElement>
}

interface InternalMaskedInputProps extends MaskedInputProps {
  spec: MaskSpec
  /** `data-slot` of the wrapper (`cpf-input`, `cep-input`…). */
  slot: string
}

function MaskedInput({
  spec,
  slot,
  className,
  value,
  onValueChange,
  disabled,
  label,
  description,
  error,
  labelPosition,
  required,
  id,
  ref,
  ...props
}: InternalMaskedInputProps) {
  const ids = useFieldIds(id)
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""
  const cleaned = cleanValue(spec, value)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.target
    const edit = applyEdit(
      spec,
      cleaned,
      el.value,
      el.selectionStart ?? el.value.length,
      (e.nativeEvent as InputEvent).inputType,
    )
    pendingCaret.current = { masked: spec.mask(edit.raw), caret: edit.caret }
    if (edit.raw !== cleaned) onValueChange(edit.raw)
    // Always render again: the caret is restored in the layout effect even
    // when the value did not change.
    forceRender()
  }

  return (
    <FieldShell
      controlId={ids.controlId}
      labelId={ids.labelId}
      descriptionId={ids.descriptionId}
      errorId={ids.errorId}
      label={label}
      description={description}
      error={error}
      labelPosition={labelPosition}
      required={required}
      disabled={disabled}
    >
      <div className="relative" data-slot={slot}>
        <input
          ref={setRefs}
          id={ids.controlId}
          type="text"
          aria-invalid={hasError ? true : undefined}
          aria-describedby={ids.describedBy({ description: hasDescription, error: hasError })}
          required={required}
          aria-required={required ? true : undefined}
          className={cn(
            "flex w-full rounded-element border border-input bg-card px-3 py-2.5 text-sm tabular-nums field-states disabled:cursor-default",
            hasError && "border-destructive-text field-error",
            className,
          )}
          disabled={disabled}
          {...props}
          value={display}
          onChange={handleChange}
        />
      </div>
    </FieldShell>
  )
}

MaskedInput.displayName = "MaskedInput"

export { MaskedInput }
