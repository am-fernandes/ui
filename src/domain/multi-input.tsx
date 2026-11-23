"use client"

import { X } from "lucide-react"
import type * as React from "react"
import {
  type ClipboardEvent,
  type FocusEvent,
  type KeyboardEvent,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { cn } from "@/lib/utils"
import { FieldShell, type LabelPosition } from "../primitives/_internal/field-shell"
import { useFieldIds } from "../primitives/_internal/use-field-ids"
import { Badge } from "../primitives/badge"

interface MultiInputBaseProps {
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
}

interface MultiInputStringProps extends MultiInputBaseProps {
  /** Free-text tokens (preserves insertion order, deduped). */
  type?: "string"
  value: string[]
  onValueChange: (values: string[]) => void
}

interface MultiInputNumberProps extends MultiInputBaseProps {
  /** Positive-integer tokens (sorted ascending, deduped). */
  type: "number"
  value: number[]
  onValueChange: (values: number[]) => void
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

function parseNumberInput(raw: string): ParsedNumberResult {
  const pieces = raw.split(/[/,;\s]+/).filter((s) => s.length > 0)
  const tokens: number[] = []
  let hadInvalid = false
  for (const piece of pieces) {
    const n = Number.parseInt(piece.trim(), 10)
    if (Number.isInteger(n) && n > 0) tokens.push(n)
    else hadInvalid = true
  }
  return { tokens, hadInvalid }
}

function MultiInput(props: MultiInputProps) {
  const {
    disabled = false,
    placeholder = props.type === "number" ? "Adicione um número" : "Adicione um item",
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
  } = props
  const ids = useFieldIds(id)
  const hasError = error != null && error !== ""
  const hasLabel = label != null && label !== ""
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  // Where the focus goes once a token removed with the keyboard is gone: the
  // remove button at this position, or the text input when there is none.
  const focusAfterRemoval = useRef<number | null>(null)

  const tokens: (string | number)[] = useMemo(() => {
    if (props.type === "number") return [...props.value].sort((a, b) => a - b)
    return props.value
  }, [props.value, props.type])

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
      const accepted = accept(parsed, props.value)
      if (accepted === null) return false
      if (accepted.length > 0) {
        props.onValueChange([...props.value, ...accepted].sort((a, b) => a - b))
      }
      return true
    }
    const accepted = accept(parseStringInput(raw), props.value)
    if (accepted === null) return false
    if (accepted.length > 0) props.onValueChange([...props.value, ...accepted])
    return true
  }

  const commitInput = () => {
    if (commitFromRaw(inputValue)) setInputValue("")
  }

  const removeToken = (token: string | number) => {
    if (props.type === "number") {
      props.onValueChange(props.value.filter((v) => v !== token))
    } else {
      props.onValueChange(props.value.filter((v) => v !== token))
    }
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
    if (commitFromRaw(text)) setInputValue("")
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
        className={cn(
          "flex min-h-9 flex-wrap items-center gap-1.5 rounded-element border border-input bg-card px-3 py-2.5 text-sm field-states cursor-text",
          disabled && "cursor-default",
          hasError && "border-destructive-text field-error",
        )}
        // biome-ignore lint/a11y/useSemanticElements: <fieldset> conflicts with the flex chip layout.
        role="group"
        // Named by the visible label, like the text input inside it.
        aria-labelledby={hasLabel ? ids.labelId : undefined}
        aria-label={
          hasLabel
            ? undefined
            : (ariaLabel ?? (props.type === "number" ? "Lista de números" : "Lista de itens"))
        }
      >
        {tokens.map((token, index) => (
          <Badge key={`${token}`} variant="secondary" className="gap-1 pr-1">
            {renderToken(token)}
            {!disabled && (
              <button
                type="button"
                data-slot="multi-input-remove"
                aria-label={`Remover ${renderToken(token)}`}
                className="ml-0.5 rounded-inner cursor-pointer state-layer focus-visible:focus-outline"
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
          ref={inputRef}
          id={ids.controlId}
          type="text"
          inputMode={props.type === "number" ? "numeric" : "text"}
          // The visible label names the field through `htmlFor`. Without one,
          // `aria-label` does, and the placeholder is the last resort.
          aria-label={hasLabel ? undefined : (ariaLabel ?? placeholder)}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={ids.describedBy({
            description: description != null && description !== "",
            error: hasError,
          })}
          className="flex-1 min-w-[60px] bg-transparent outline-none disabled:cursor-default"
          placeholder={tokens.length === 0 ? placeholder : undefined}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={handleBlur}
          disabled={disabled}
        />
      </div>
    </FieldShell>
  )
}

MultiInput.displayName = "MultiInput"

export { MultiInput, type MultiInputProps }
