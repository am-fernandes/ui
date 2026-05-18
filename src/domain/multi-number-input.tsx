"use client"

import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { type KeyboardEvent, useRef, useState } from "react"
import { Badge } from "../primitives/badge"

interface MultiNumberInputProps {
  value: number[]
  onValueChange: (values: number[]) => void
  disabled?: boolean
  placeholder?: string
  error?: boolean
  /** Optional prefix rendered before each number in its Badge (e.g. "R$ "). */
  prefix?: string
  /** Optional suffix rendered after each number in its Badge (e.g. " dias"). */
  suffix?: string
}

function parseInput(raw: string): number[] {
  return raw
    .split(/[/,\s]+/)
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n) && n > 0)
}

function MultiNumberInput({
  value,
  onValueChange,
  disabled = false,
  placeholder = "Adicione um número",
  error = false,
  prefix,
  suffix,
}: MultiNumberInputProps) {
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const sorted = [...value].sort((a, b) => a - b)

  const addValues = (nums: number[]) => {
    const set = new Set(value)
    for (const n of nums) set.add(n)
    onValueChange([...set].sort((a, b) => a - b))
  }

  const removeValue = (num: number) => {
    onValueChange(value.filter((v) => v !== num))
  }

  const commitInput = () => {
    const parsed = parseInput(inputValue)
    if (parsed.length > 0) {
      addValues(parsed)
      setInputValue("")
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      commitInput()
    } else if (e.key === "Backspace" && inputValue === "" && sorted.length > 0) {
      const last = sorted[sorted.length - 1]
      if (last !== undefined) removeValue(last)
    }
  }

  const focusInput = () => inputRef.current?.focus()

  return (
    <div data-slot="multi-number-input" aria-label="Lista de números">
      <div
        className={cn(
          "flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm transition-colors",
          "focus-within:border-primary",
          disabled && "cursor-not-allowed opacity-50",
          error && "border-destructive",
        )}
        onClick={focusInput}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") focusInput()
        }}
      >
        {sorted.map((num) => (
          <Badge key={num} variant="secondary" className="gap-1 pr-1">
            {prefix ?? ""}
            {num}
            {suffix ?? ""}
            {!disabled && (
              <button
                type="button"
                aria-label={`Remover ${prefix ?? ""}${num}${suffix ?? ""}`}
                className="ml-0.5 rounded-sm hover:bg-secondary-foreground/20"
                onClick={(e) => {
                  e.stopPropagation()
                  removeValue(num)
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
          inputMode="numeric"
          aria-label="Adicione um número"
          className="flex-1 min-w-[60px] bg-transparent outline-none disabled:cursor-not-allowed"
          placeholder={sorted.length === 0 ? placeholder : ""}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitInput}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

MultiNumberInput.displayName = "MultiNumberInput"

export { MultiNumberInput, type MultiNumberInputProps }
