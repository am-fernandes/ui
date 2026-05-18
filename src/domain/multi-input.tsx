"use client"

import { X } from "lucide-react"
import { type KeyboardEvent, useRef, useState } from "react"

import { cn } from "@/lib/utils"
import { Badge } from "../primitives/badge"

interface MultiInputBaseProps {
  disabled?: boolean
  placeholder?: string
  error?: boolean
  /** Optional prefix rendered before each token in its Badge (e.g. "R$ ", "#"). */
  prefix?: string
  /** Optional suffix rendered after each token in its Badge (e.g. " dias", " %"). */
  suffix?: string
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
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

function parseNumberInput(raw: string): number[] {
  return raw
    .split(/[/,\s]+/)
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n) && n > 0)
}

function MultiInput(props: MultiInputProps) {
  const {
    disabled = false,
    placeholder = props.type === "number" ? "Adicione um número" : "Adicione um item",
    error = false,
    prefix,
    suffix,
  } = props
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const tokens: (string | number)[] =
    props.type === "number" ? [...props.value].sort((a, b) => a - b) : props.value

  const commitInput = () => {
    if (props.type === "number") {
      const parsed = parseNumberInput(inputValue)
      if (parsed.length === 0) return
      const set = new Set(props.value)
      for (const n of parsed) set.add(n)
      props.onValueChange([...set].sort((a, b) => a - b))
      setInputValue("")
    } else {
      const parsed = parseStringInput(inputValue)
      if (parsed.length === 0) return
      const set = new Set(props.value)
      for (const s of parsed) set.add(s)
      props.onValueChange([...set])
      setInputValue("")
    }
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

  const focusInput = () => inputRef.current?.focus()
  const renderToken = (token: string | number) => `${prefix ?? ""}${token}${suffix ?? ""}`

  return (
    <div
      data-slot="multi-input"
      data-type={props.type === "number" ? "number" : "string"}
      onClick={focusInput}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") focusInput()
      }}
      className={cn(
        "flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm transition-colors",
        "focus-within:border-primary cursor-text",
        disabled && "cursor-not-allowed opacity-50",
        error && "border-destructive",
      )}
      // biome-ignore lint/a11y/useSemanticElements: intentional div wrapper; <fieldset> defaults fight the flex layout. The role="group"+aria-label preserves ARIA semantics.
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
              onClick={(e) => {
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
        type="text"
        inputMode={props.type === "number" ? "numeric" : "text"}
        aria-label={placeholder}
        className="flex-1 min-w-[60px] bg-transparent outline-none disabled:cursor-not-allowed"
        placeholder={tokens.length === 0 ? placeholder : ""}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitInput}
        disabled={disabled}
      />
    </div>
  )
}

MultiInput.displayName = "MultiInput"

export { MultiInput, type MultiInputProps }
