"use client"

import { X } from "lucide-react"
import type * as React from "react"
import {
  type ClipboardEvent,
  type FocusEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { cn } from "@/lib/utils"
import {
  type ControlSize,
  controlMinHeight,
  controlPaddingX,
} from "../primitives/_internal/control-size"
import { FieldShell, type LabelPosition } from "../primitives/_internal/field-shell"
import { useFieldIds } from "../primitives/_internal/use-field-ids"
import { Badge } from "../primitives/badge"

export interface MultiInputLabels {
  /** Placeholder of an empty string list (the `placeholder` prop wins). */
  placeholder: string
  /** Placeholder of an empty number list (the `placeholder` prop wins). */
  numberPlaceholder: string
  /** Name of the group when there is no `label` nor `aria-label`. */
  list: string
  /** Same, for `type="number"`. */
  numberList: string
  /** Accessible name of an item's remove button; `item` has `prefix` and `suffix`. */
  remove: (item: string) => string
}

export const defaultMultiInputLabels: MultiInputLabels = {
  placeholder: "Adicione um item",
  numberPlaceholder: "Adicione um número",
  list: "Lista de itens",
  numberList: "Lista de números",
  remove: (item) => `Remover ${item}`,
}

interface MultiInputBaseProps {
  /** Override individual UI strings. Defaults are pt-BR. */
  labels?: Partial<MultiInputLabels>
  /**
   * Initial items of an uncontrolled field (also what a form reset brings
   * back): strings, or numbers with `type="number"`. One type for both modes,
   * so props spread from one mode into the other still type-check.
   */
  defaultValue?: string[] | number[]
  /**
   * Minimum height of the box, border included: `sm` 32px, `md` 40px, `lg`
   * 44px, the same as a button or field of that size. It grows with the items.
   * @default "md"
   */
  size?: ControlSize
  disabled?: boolean
  placeholder?: string
  /** Validation message — when set, the wrapper turns red and the message renders below. */
  error?: string
  label?: React.ReactNode
  description?: React.ReactNode
  labelPosition?: LabelPosition
  required?: boolean
  id?: string
  /**
   * Accessible name when there is no visible `label`. With a `label`, the
   * field and the group are named by it and this is ignored.
   */
  "aria-label"?: string
  /** Optional prefix rendered before each token in its Badge (e.g. "R$ ", "#"). */
  prefix?: string
  /** Optional suffix rendered after each token in its Badge (e.g. " dias", " %"). */
  suffix?: string
  /**
   * Maximum number of tokens. The ones already in the list always stay: new
   * tokens enter while there is room and the rest are refused, with
   * `onReject("max-items")`. When nothing fits, the typed text stays in the
   * field.
   */
  maxItems?: number
  /** Called when input is rejected (e.g. invalid numeric token, exceeds maxItems). */
  onReject?: (reason: "max-items" | "invalid") => void
  /**
   * Name of the field in a native form: a hidden input carries the list
   * joined by commas (`"urgente,fiscal"`, `"10,35"`).
   */
  name?: string
  /** Class of the box that draws the border and holds the items. */
  className?: string
  /**
   * Called when the focus leaves the field (the text input and the items'
   * remove buttons), after any typed text became an item.
   */
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void
  /** The text input: it takes the focus, as React Hook Form does on an error. */
  ref?: React.Ref<HTMLInputElement>
}

interface MultiInputStringProps extends MultiInputBaseProps {
  /** Free-text tokens (preserves insertion order, deduped). */
  type?: "string"
  /** The items. Without it, the field keeps its own list from `defaultValue`. */
  value?: string[]
  onValueChange?: (values: string[]) => void
}

interface MultiInputNumberProps extends MultiInputBaseProps {
  /**
   * Positive-integer tokens (sorted ascending, deduped). Each piece must be
   * an integer from end to end: `10.000`, `3,5` and `12x` are refused with
   * `onReject("invalid")`, never read as 10, 3 and 5, or 12. Pieces are
   * separated by space, semicolon, slash, line break or comma; a single comma
   * right between two numbers (`3,5`) is a decimal, not a separator.
   */
  type: "number"
  /** The items. Without it, the field keeps its own list from `defaultValue`. */
  value?: number[]
  onValueChange?: (values: number[]) => void
}

type MultiInputProps = MultiInputStringProps | MultiInputNumberProps

function parseStringInput(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

interface ParsedNumberResult {
  tokens: number[]
  hadInvalid: boolean
}

const INTEGER = /^\d+$/

function parseNumberInput(raw: string): ParsedNumberResult {
  const tokens: number[] = []
  let hadInvalid = false
  for (const chunk of raw.split(/[/;\s]+/)) {
    if (chunk === "") continue
    const pieces = chunk.split(",")
    // In Portuguese "3,5" is three and a half, not the items 3 and 5. A list
    // has a space after the comma ("3, 5") or more than two items ("3,5,8").
    if (pieces.length === 2 && pieces.every((piece) => INTEGER.test(piece))) {
      hadInvalid = true
      continue
    }
    for (const piece of pieces) {
      if (piece === "") continue
      // The whole piece must be digits: parseInt would read "10.000" as 10
      // and "12x" as 12.
      const n = Number(piece)
      if (INTEGER.test(piece) && Number.isSafeInteger(n) && n > 0) tokens.push(n)
      else hadInvalid = true
    }
  }
  return { tokens, hadInvalid }
}

function MultiInput(props: MultiInputProps) {
  const l: MultiInputLabels = { ...defaultMultiInputLabels, ...props.labels }
  const {
    size = "md",
    disabled = false,
    placeholder = props.type === "number" ? l.numberPlaceholder : l.placeholder,
    error,
    label,
    description,
    labelPosition,
    required,
    id,
    prefix,
    suffix,
    maxItems,
    onReject,
    "aria-label": ariaLabel,
    name,
    className,
    onBlur,
    ref,
  } = props
  const ids = useFieldIds(id)
  const hasError = error != null && error !== ""
  const hasLabel = label != null && label !== ""
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement | null>(null)
  const setInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref != null) (ref as React.RefObject<HTMLInputElement | null>).current = node
    },
    [ref],
  )
  const wrapperRef = useRef<HTMLDivElement>(null)
  // Where the focus goes once a token removed with the keyboard is gone: the
  // remove button at this position, or the text input when there is none.
  const focusAfterRemoval = useRef<number | null>(null)

  const isControlled = props.value !== undefined
  const initial = (): (string | number)[] => {
    const items: (string | number)[] = props.defaultValue ?? []
    return props.type === "number"
      ? items.map(Number).filter((n) => Number.isSafeInteger(n) && n > 0)
      : items.map(String)
  }
  const [internal, setInternal] = useState(initial)
  const current: (string | number)[] = props.value ?? internal

  /** Reports a new list, and keeps it when the field is uncontrolled. */
  const emit = (next: (string | number)[]) => {
    if (!isControlled) setInternal(next)
    if (props.type === "number") props.onValueChange?.(next as number[])
    else props.onValueChange?.(next as string[])
  }

  // An uncontrolled field goes back to its default when the form is reset.
  const onReset = useRef(() => {})
  onReset.current = () => {
    if (isControlled) return
    setInputValue("")
    setInternal(initial())
  }
  useEffect(() => {
    const form = inputRef.current?.form
    if (form == null) return
    const reset = () => onReset.current()
    form.addEventListener("reset", reset)
    return () => form.removeEventListener("reset", reset)
  }, [])

  const tokens: (string | number)[] = useMemo(() => {
    if (props.type === "number") return [...(current as number[])].sort((a, b) => a - b)
    return current
  }, [current, props.type])

  /**
   * The new tokens among `parsed` that fit: not in the list yet, in the order
   * typed, up to the room `maxItems` leaves. `null` means the typed text was
   * not consumed and stays in the field.
   */
  function accept<T extends string | number>(parsed: T[], current: T[]): T[] | null {
    if (parsed.length === 0) return null
    const fresh = [...new Set(parsed)].filter((token) => !current.includes(token))
    // Only repeats of what is already there: nothing to add, text consumed.
    if (fresh.length === 0) return []
    const room = maxItems === undefined ? fresh.length : Math.max(0, maxItems - current.length)
    if (fresh.length > room) onReject?.("max-items")
    return room === 0 ? null : fresh.slice(0, room)
  }

  function commitFromRaw(raw: string): boolean {
    if (props.type === "number") {
      const { tokens: parsed, hadInvalid } = parseNumberInput(raw)
      if (hadInvalid) onReject?.("invalid")
      const numbers = current as number[]
      const accepted = accept(parsed, numbers)
      if (accepted === null) return false
      if (accepted.length > 0) emit([...numbers, ...accepted].sort((a, b) => a - b))
      return true
    }
    const strings = current as string[]
    const accepted = accept(parseStringInput(raw), strings)
    if (accepted === null) return false
    if (accepted.length > 0) emit([...strings, ...accepted])
    return true
  }

  const commitInput = () => {
    if (commitFromRaw(inputValue)) setInputValue("")
  }

  const removeToken = (token: string | number) => {
    emit(current.filter((v) => v !== token))
  }

  // The focused remove button disappears with its token. Hand the focus to a
  // neighbour instead of dropping it on the page body: Backspace goes to the
  // token before, the other keys to the one that takes the removed one's place.
  const removeTokenWithKeyboard = (index: number, towards: "previous" | "next") => {
    const token = tokens[index]
    if (token === undefined) return
    focusAfterRemoval.current = towards === "previous" ? Math.max(0, index - 1) : index
    removeToken(token)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: runs when the token list changes, which is when a removal has gone through.
  useLayoutEffect(() => {
    const index = focusAfterRemoval.current
    if (index === null) return
    focusAfterRemoval.current = null
    const buttons = wrapperRef.current?.querySelectorAll<HTMLButtonElement>(
      '[data-slot="multi-input-remove"]',
    )
    const target = buttons?.[Math.min(index, (buttons?.length ?? 0) - 1)]
    if (target) target.focus()
    else inputRef.current?.focus()
  }, [tokens])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      commitInput()
    } else if (e.key === "Backspace" && inputValue === "" && tokens.length > 0) {
      const last = tokens[tokens.length - 1]
      if (last !== undefined) removeToken(last)
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData?.getData("text") ?? ""
    if (!text.includes("\n") && !text.includes(",") && !text.includes(";")) return
    e.preventDefault()
    // What was not taken stays in the field, on one line, to be fixed.
    setInputValue(commitFromRaw(text) ? "" : text.replace(/\s+/g, " ").trim())
  }

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const related = e.relatedTarget as Node | null
    if (related && wrapperRef.current?.contains(related)) return
    commitInput()
  }

  const focusInput = () => inputRef.current?.focus()
  const renderToken = (token: string | number) => `${prefix ?? ""}${token}${suffix ?? ""}`

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
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard focus reaches the input natively via Tab. */}
      {/* biome-ignore lint/a11y/useSemanticElements: <fieldset> would force a <legend> and conflict with the flex chip layout. */}
      <div
        ref={wrapperRef}
        data-slot="multi-input"
        data-type={props.type === "number" ? "number" : "string"}
        onClick={focusInput}
        onBlur={(e) => {
          // Moving between the text input and a remove button stays inside.
          const next = e.relatedTarget as Node | null
          if (next && e.currentTarget.contains(next)) return
          onBlur?.(e)
        }}
        className={cn(
          // The height comes from the control size; the vertical padding only
          // spaces the rows once the items wrap.
          "flex flex-wrap items-center gap-1.5 rounded-element border border-input bg-card text-sm field-states cursor-text",
          controlMinHeight[size],
          controlPaddingX[size],
          size === "sm" ? "py-1" : "py-1.5",
          disabled && "cursor-default",
          hasError && "border-destructive-text field-error",
          className,
        )}
        // biome-ignore lint/a11y/useSemanticElements: <fieldset> conflicts with the flex chip layout.
        role="group"
        // The items of a disabled field are part of an inactive control: a
        // screen reader hears it, and they are exempt from text contrast.
        aria-disabled={disabled ? true : undefined}
        // Named by the visible label, like the text input inside it.
        aria-labelledby={hasLabel ? ids.labelId : undefined}
        aria-label={
          hasLabel ? undefined : (ariaLabel ?? (props.type === "number" ? l.numberList : l.list))
        }
      >
        {tokens.map((token, index) => (
          <Badge
            key={`${token}`}
            data-slot="multi-input-item"
            variant="secondary"
            className="gap-1 pr-1"
          >
            {renderToken(token)}
            {!disabled && (
              <button
                type="button"
                data-slot="multi-input-remove"
                aria-label={l.remove(renderToken(token))}
                // The × stays small inside the chip; the hit area around it
                // is 24 by 24 px (WCAG 2.5.8).
                className="relative ml-0.5 inline-flex size-4 items-center justify-center rounded-inner cursor-pointer state-layer focus-visible:focus-outline before:absolute before:-inset-1"
                onMouseDown={(e) => {
                  // Keep the focus where it is: a click on the × must not blur
                  // the text input, which would commit what is being typed.
                  e.preventDefault()
                }}
                onClick={(e) => {
                  // Not the wrapper's click, which sends the focus to the input.
                  e.stopPropagation()
                  // Enter and Space arrive here as a click on the focused
                  // button; a mouse click leaves the focus alone.
                  if (e.currentTarget === e.currentTarget.ownerDocument.activeElement) {
                    removeTokenWithKeyboard(index, "next")
                  } else {
                    removeToken(token)
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" || e.key === "Delete") {
                    e.preventDefault()
                    removeTokenWithKeyboard(index, e.key === "Backspace" ? "previous" : "next")
                  }
                }}
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            )}
          </Badge>
        ))}
        <input
          ref={setInputRef}
          id={ids.controlId}
          type="text"
          aria-required={required ? true : undefined}
          // Native validation only sees this input: an empty list keeps a
          // required form from being sent, a list with items lets it go.
          required={required && tokens.length === 0}
          inputMode={props.type === "number" ? "numeric" : "text"}
          // The visible label names the field through `htmlFor`. Without one,
          // `aria-label` does, and the placeholder is the last resort.
          aria-label={hasLabel ? undefined : (ariaLabel ?? placeholder)}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={ids.describedBy({
            description: description != null && description !== "",
            error: hasError,
          })}
          // 16px on touch screens (iOS zooms into a focused field with smaller
          // text), on the same 20px line so the box keeps its height.
          className="flex-1 min-w-[60px] bg-transparent leading-5 outline-none pointer-coarse:text-base pointer-coarse:leading-5 disabled:cursor-default"
          placeholder={tokens.length === 0 ? placeholder : undefined}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={handleBlur}
          disabled={disabled}
        />
        {name != null && name !== "" ? (
          <input type="hidden" name={name} value={tokens.join(",")} disabled={disabled} />
        ) : null}
      </div>
    </FieldShell>
  )
}

MultiInput.displayName = "MultiInput"

export { MultiInput, type MultiInputProps }
