"use client"

import { X } from "lucide-react"
import type * as React from "react"
import {
  type ClipboardEvent,
  type FocusEvent,
  type KeyboardEvent,
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
  /** Optional prefix rendered before each token in its Badge (e.g. "R$ ", "#"). */
  prefix?: string
  /** Optional suffix rendered after each token in its Badge (e.g. " dias", " %"). */
  suffix?: string
  /** Maximum number of tokens. Extras are dropped and onReject is fired with "max-items". */
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
  } = props
  const ids = useFieldIds(id)
  const hasError = error != null && error !== ""
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const tokens: (string | number)[] = useMemo(() => {
    if (props.type === "number") return [...props.value].sort((a, b) => a - b)
    return props.value
  }, [props.value, props.type])

  function commitFromRaw(raw: string): boolean {
    if (props.type === "number") {
      const { tokens: parsed, hadInvalid } = parseNumberInput(raw)
      if (hadInvalid) onReject?.("invalid")
      if (parsed.length === 0) return false
      const set = new Set(props.value)
      for (const n of parsed) set.add(n)
      let next = [...set].sort((a, b) => a - b)
      if (maxItems !== undefined && next.length > maxItems) {
        next = next.slice(0, maxItems)
        onReject?.("max-items")
      }
      props.onValueChange(next)
      return true
    }
    const parsed = parseStringInput(raw)
    if (parsed.length === 0) return false
    const set = new Set(props.value)
    for (const s of parsed) set.add(s)
    let next = [...set]
    if (maxItems !== undefined && next.length > maxItems) {
      next = next.slice(0, maxItems)
      onReject?.("max-items")
    }
    props.onValueChange(next)
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
          "flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-3 py-3 text-sm transition-colors",
          "focus-within:border-primary cursor-text",
          disabled && "cursor-not-allowed opacity-50",
          hasError && "border-destructive",
        )}
        // biome-ignore lint/a11y/useSemanticElements: <fieldset> conflicts with the flex chip layout.
        role="group"
        aria-label={props.type === "number" ? "Lista de números" : "Lista de itens"}
      >
        {tokens.map((token) => (
          <Badge key={`${token}`} variant="secondary" className="gap-1 pr-1">
            {renderToken(token)}
            {!disabled && (
              <button
                type="button"
                aria-label={`Remover ${renderToken(token)}`}
                className="ml-0.5 rounded-sm hover:bg-secondary-foreground/20 cursor-pointer"
                onMouseDown={(e) => {
                  // Run on mousedown so we fire BEFORE the input's blur — avoids the race
                  // where blur commits the pending input and then we remove a different token.
                  e.preventDefault()
                  e.stopPropagation()
                  removeToken(token)
                }}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
        <input
          ref={inputRef}
          id={ids.controlId}
          type="text"
          inputMode={props.type === "number" ? "numeric" : "text"}
          aria-label={placeholder}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={ids.describedBy({
            description: description != null && description !== "",
            error: hasError,
          })}
          className="flex-1 min-w-[60px] bg-transparent outline-none disabled:cursor-not-allowed"
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
