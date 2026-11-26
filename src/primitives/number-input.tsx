"use client"

import { Minus, Plus } from "lucide-react"
import * as React from "react"
import { flushSync } from "react-dom"

import { parseBRNumber } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { useComposedRefs } from "./_internal/compose-refs"
import { Input, type InputProps } from "./input"

export interface NumberInputLabels {
  /** Name of the "+" stepper button. */
  increment: string
  /** Name of the "−" stepper button. */
  decrement: string
}

export const defaultNumberInputLabels: NumberInputLabels = {
  increment: "Aumentar",
  decrement: "Diminuir",
}

export interface NumberInputProps
  extends Omit<
    InputProps,
    | "value"
    | "defaultValue"
    | "onChange"
    | "type"
    | "min"
    | "max"
    | "step"
    | "prefix"
    | "leadingIcon"
    | "trailingIcon"
    | "inputMode"
  > {
  /** The number, or `null` for an empty field (never `0` for empty). Controlled. */
  value?: number | null
  /** Initial value of an uncontrolled field. */
  defaultValue?: number | null
  /** Called with the number, or `null` when the field is emptied. */
  onValueChange?: (value: number | null) => void
  /** Decimal places allowed and shown (up to). `0` takes whole numbers only. @default 0 */
  decimals?: number
  /**
   * Smallest value. Applied when the field loses focus and on Enter, not while
   * typing. A negative `min` lets the minus sign be typed.
   */
  min?: number
  /** Largest value. Applied when the field loses focus and on Enter, not while typing. */
  max?: number
  /** What the arrows and the stepper buttons add or take. PageUp/PageDown move ten steps. @default 1 */
  step?: number
  /** Fixed text before the number, inside the field. */
  prefix?: React.ReactNode
  /** Unit after the number, inside the field ("m²", "andares"). */
  suffix?: React.ReactNode
  /** Shows − and + buttons in the field. They do not take focus from the input. */
  steppers?: boolean
  labels?: Partial<NumberInputLabels>
}

const REPEAT_DELAY = 400
const REPEAT_EVERY = 80

function decimalsOf(n: number): number {
  const text = String(n)
  const dot = text.indexOf(".")
  return dot === -1 ? 0 : text.length - dot - 1
}

function roundTo(n: number, places: number): number {
  const factor = 10 ** places
  return Math.round(n * factor) / factor
}

const formatters = new Map<string, Intl.NumberFormat>()
function format(value: number, decimals: number, grouping: boolean): string {
  const key = `${decimals}|${grouping}`
  let f = formatters.get(key)
  if (!f) {
    f = new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
      useGrouping: grouping,
    })
    formatters.set(key, f)
  }
  return f.format(value)
}

/**
 * What the field keeps of a typed text: digits, one comma (only when
 * decimals are allowed, with at most `decimals` digits after it) and a
 * leading minus (only when negatives are allowed). A lone dot is the decimal
 * separator of a numeric keypad, so it becomes the comma.
 */
function sanitize(raw: string, decimals: number, allowNegative: boolean): string {
  const negative = allowNegative && /^\s*[-−]/.test(raw)
  let text = raw
  if (decimals > 0 && !text.includes(",") && (text.match(/\./g) ?? []).length === 1) {
    text = text.replace(".", ",")
  }
  text = text.replace(decimals > 0 ? /[^\d,]/g : /\D/g, "")
  const comma = text.indexOf(",")
  if (comma !== -1) {
    text = `${text.slice(0, comma + 1)}${text
      .slice(comma + 1)
      .replace(/,/g, "")
      .slice(0, decimals)}`
  }
  return `${negative ? "-" : ""}${text}`
}

/** The number in a field's text, or `null` when it has no digit. */
function parseText(text: string): number | null {
  if (!/\d/.test(text)) return null
  const value = Number(text.replace(",", "."))
  return Number.isFinite(value) ? value : null
}

function NumberInput({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  decimals = 0,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  steppers = false,
  labels: labelsProp,
  name,
  form,
  disabled,
  readOnly,
  onFocus,
  onBlur,
  onKeyDown,
  onPaste,
  className,
  id,
  ref,
  ...props
}: NumberInputProps) {
  const labels = { ...defaultNumberInputLabels, ...labelsProp }
  const autoId = React.useId()
  const inputId = id ?? `${autoId}-number`
  const inputRef = React.useRef<HTMLInputElement>(null)
  const composedRef = useComposedRefs(inputRef, ref)
  const [innerValue, setInnerValue] = React.useState<number | null>(defaultValue)
  const controlled = valueProp !== undefined
  const value = controlled ? valueProp : innerValue
  // The text being typed, while the field has focus; formatted otherwise.
  const [editing, setEditing] = React.useState<string | null>(null)
  const allowNegative = min != null && min < 0
  const places = Math.max(decimals, decimalsOf(step))
  const editable = !disabled && !readOnly

  const clamp = (n: number) => Math.min(max ?? n, Math.max(min ?? n, n))
  const plain = (n: number | null) => (n == null ? "" : format(n, places, false))

  const commit = (next: number | null) => {
    if (!controlled) setInnerValue(next)
    if (next !== value) onValueChange?.(next)
  }

  const settle = () => {
    const typed = editing != null ? parseText(editing) : value
    const next = typed == null ? null : clamp(roundTo(typed, places))
    commit(next)
    return next
  }

  // An uncontrolled field goes back to `defaultValue` when its form is reset,
  // like a native input. React keeps the input's `value` attribute equal to
  // what is on screen, so the browser's own reset changed nothing: the form
  // showed, and sent, the edited number. Read through a ref, so the listener
  // is attached once and sees the latest props.
  const initialValue = React.useRef(defaultValue)
  const onFormReset = React.useRef(() => {})
  onFormReset.current = () => {
    if (controlled) return
    setEditing(null)
    commit(initialValue.current)
  }
  React.useEffect(() => {
    const owner = inputRef.current?.form
    if (owner == null) return
    const reset = () => onFormReset.current()
    owner.addEventListener("reset", reset)
    return () => owner.removeEventListener("reset", reset)
  }, [])

  // A value set from outside while the field is being edited (a reset, a
  // computed field) replaces the typed text.
  // biome-ignore lint/correctness/useExhaustiveDependencies: only an outside value change matters here.
  React.useEffect(() => {
    setEditing((text) => (text == null || parseText(text) === value ? text : plain(value)))
  }, [value])

  // The number on screen, also between renders: a held stepper steps from
  // the last step, not from the value of the render it started in.
  const live = React.useRef<number | null>(value)
  live.current = editing != null ? parseText(editing) : value

  const stepBy = (steps: number) => {
    if (!editable) return
    const current = live.current
    const next = clamp(roundTo(current == null ? 0 : current + steps * step, places))
    live.current = next
    commit(next)
    if (editing != null) setEditing(plain(next))
  }

  const display = editing ?? (value == null ? "" : format(roundTo(value, places), places, true))
  const valueText =
    value == null
      ? undefined
      : [prefix, format(roundTo(value, places), places, true), suffix]
          .filter((part) => typeof part === "string" || typeof part === "number")
          .join(" ")

  // Steppers repeat while held.
  const repeat = React.useRef<{ timer?: number; interval?: number }>({})
  const stopRepeat = () => {
    window.clearTimeout(repeat.current.timer)
    window.clearInterval(repeat.current.interval)
    repeat.current = {}
  }
  React.useEffect(
    () => () => {
      window.clearTimeout(repeat.current.timer)
      window.clearInterval(repeat.current.interval)
    },
    [],
  )
  const latestStep = React.useRef(stepBy)
  latestStep.current = stepBy

  const stepper = (direction: 1 | -1) => {
    const atEdge =
      value != null && (direction > 0 ? max != null && value >= max : min != null && value <= min)
    return (
      <button
        type="button"
        tabIndex={-1}
        data-slot={direction > 0 ? "number-input-increment" : "number-input-decrement"}
        aria-label={direction > 0 ? labels.increment : labels.decrement}
        aria-controls={inputId}
        disabled={!editable || atEdge}
        // The input keeps the focus (and the caret).
        onMouseDown={(event) => event.preventDefault()}
        onPointerDown={(event) => {
          if (event.button > 0) return
          event.preventDefault()
          latestStep.current(direction)
          stopRepeat()
          repeat.current.timer = window.setTimeout(() => {
            repeat.current.interval = window.setInterval(
              () => latestStep.current(direction),
              REPEAT_EVERY,
            )
          }, REPEAT_DELAY)
        }}
        onPointerUp={stopRepeat}
        onPointerLeave={stopRepeat}
        onPointerCancel={stopRepeat}
        // A click from the keyboard or a screen reader (no pointer down).
        onClick={(event) => {
          if (event.detail === 0) stepBy(direction)
        }}
        className="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-inner text-muted-foreground state-layer disabled:pointer-events-none disabled:opacity-50"
      >
        {direction > 0 ? <Plus aria-hidden="true" /> : <Minus aria-hidden="true" />}
      </button>
    )
  }

  const trailing =
    suffix != null || steppers ? (
      <span className="flex items-center gap-1">
        {suffix != null ? <span data-slot="number-input-suffix">{suffix}</span> : null}
        {steppers ? (
          <span className="-mr-1 flex items-center">
            {stepper(-1)}
            {stepper(1)}
          </span>
        ) : null}
      </span>
    ) : undefined

  return (
    <>
      <Input
        {...props}
        id={inputId}
        ref={composedRef}
        type="text"
        role="spinbutton"
        inputMode={allowNegative ? "text" : decimals > 0 ? "decimal" : "numeric"}
        autoComplete="off"
        aria-valuenow={value ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={valueText}
        disabled={disabled}
        readOnly={readOnly}
        form={form}
        value={display}
        leadingIcon={
          prefix != null ? <span data-slot="number-input-prefix">{prefix}</span> : undefined
        }
        trailingIcon={trailing}
        // 16px on touch screens: iOS zooms into a focused field with smaller text.
        className={cn("tabular-nums pointer-coarse:text-base", className)}
        onFocus={(event) => {
          setEditing(plain(value))
          onFocus?.(event)
        }}
        onBlur={(event) => {
          settle()
          setEditing(null)
          onBlur?.(event)
        }}
        onChange={(event) => {
          const input = event.target
          const raw = input.value
          const text = sanitize(raw, places, allowNegative)
          if (text !== raw) {
            // Write the clean text now and keep the caret where it was, less
            // what was dropped; a re-render alone would put it at the end.
            const at = input.selectionStart ?? raw.length
            const caret = Math.max(0, text.length - (raw.length - at))
            input.value = text
            input.setSelectionRange(caret, caret)
          }
          setEditing(text)
          commit(parseText(text))
        }}
        onPaste={(event) => {
          onPaste?.(event)
          if (event.defaultPrevented || !editable) return
          // A pasted number follows the library's rule (as in CurrencyInput):
          // "1.234,5", "1234.5", "R$ 1.500" all read as numbers.
          const pasted = parseBRNumber(event.clipboardData.getData("text"))
          event.preventDefault()
          if (pasted == null) return
          const next = roundTo(allowNegative ? pasted : Math.abs(pasted), places)
          setEditing(plain(next))
          commit(next)
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.defaultPrevented || !editable) return
          if (event.key === "Enter") {
            flushSync(() => setEditing(plain(settle())))
            return
          }
          const keys: Record<string, () => void> = {
            ArrowUp: () => stepBy(1),
            ArrowDown: () => stepBy(-1),
            PageUp: () => stepBy(10),
            PageDown: () => stepBy(-10),
          }
          const jumpTo = (target: number) => () => {
            commit(target)
            setEditing(plain(target))
          }
          if (min != null) keys.Home = jumpTo(min)
          if (max != null) keys.End = jumpTo(max)
          const action = keys[event.key]
          if (!action || event.altKey || event.ctrlKey || event.metaKey) return
          event.preventDefault()
          action()
        }}
      />
      {name != null && name !== "" ? (
        <input
          type="hidden"
          name={name}
          form={form}
          disabled={disabled}
          value={value == null ? "" : String(value)}
        />
      ) : null}
    </>
  )
}

NumberInput.displayName = "NumberInput"

export { NumberInput }
