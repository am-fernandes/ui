"use client"

import type * as React from "react"

import { centsToDisplay, fromCents, parseBRNumber, toCents } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { FieldShell, type LabelPosition } from "../primitives/_internal/field-shell"
import { useFieldIds } from "../primitives/_internal/use-field-ids"

interface CurrencyInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  /**
   * The value in **float reais** (BRL).
   *
   * IMPORTANT: do not perform arithmetic on the float. Use `toCents`/`fromCents`
   * from `@amfernandesinc/ui` for any computation (sums, percentages, multiplications).
   * The component itself round-trips through cents — assume any value is accurate
   * to 2 decimals only.
   */
  value: number
  onValueChange: (value: number) => void
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  labelPosition?: LabelPosition
  required?: boolean
  ref?: React.Ref<HTMLInputElement>
}

/** Fifteen digits of cents: what round-trips exactly through a float. */
const MAX_CENTS = 999_999_999_999_999

function CurrencyInput({
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
  onPaste,
  ...props
}: CurrencyInputProps) {
  const ids = useFieldIds(id)
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""
  const display = centsToDisplay(toCents(value))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 15)
    const newCents = Number.parseInt(digits, 10) || 0
    onValueChange(fromCents(newCents))
  }

  // Typed digits fill the cents first; a pasted text is a number someone
  // wrote ("1.500", "R$ 2.350,90", "1500.00") and replaces the value.
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    onPaste?.(e)
    if (e.defaultPrevented) return
    e.preventDefault()
    const pasted = parseBRNumber(e.clipboardData?.getData("text") ?? "")
    if (pasted == null) return
    const cents = toCents(Math.abs(pasted))
    if (cents > MAX_CENTS) return
    onValueChange(fromCents(cents))
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
      <div className="relative" data-slot="currency-input">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
          R$
        </span>
        <input
          ref={ref}
          id={ids.controlId}
          type="text"
          inputMode="numeric"
          aria-invalid={hasError ? true : undefined}
          aria-describedby={ids.describedBy({ description: hasDescription, error: hasError })}
          required={required}
          aria-required={required ? true : undefined}
          className={cn(
            "flex w-full rounded-element border border-input bg-card pl-9 pr-3 py-2.5 text-sm tabular-nums field-states disabled:cursor-default",
            hasError && "border-destructive-text field-error",
            className,
          )}
          disabled={disabled}
          {...props}
          value={display}
          onChange={handleChange}
          onPaste={handlePaste}
        />
      </div>
    </FieldShell>
  )
}

CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput, type CurrencyInputProps }
