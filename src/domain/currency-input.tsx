"use client"

import type * as React from "react"

import { centsToDisplay, fromCents, parseBRNumber, toCents } from "@/lib/currency"
import { FieldInput, type FieldInputProps } from "./_internal/field-input"

interface CurrencyInputProps extends FieldInputProps {
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
}

/** Fifteen digits of cents: what round-trips exactly through a float. */
const MAX_CENTS = 999_999_999_999_999

function CurrencyInput({ value, onValueChange, onPaste, ...props }: CurrencyInputProps) {
  const cents = toCents(value)
  const display = centsToDisplay(cents)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 15)
    const newCents = Number.parseInt(digits, 10) || 0
    onValueChange(fromCents(newCents))
  }

  // Typed digits fill the cents first; a pasted text is a number someone
  // wrote ("1.500", "R$ 2.350,90", "1500.00") and replaces the value.
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    onPaste?.(e)
    // A read-only field takes no paste; the browser already ignores it.
    if (e.defaultPrevented || props.readOnly) return
    e.preventDefault()
    const pasted = parseBRNumber(e.clipboardData?.getData("text") ?? "")
    if (pasted == null) return
    const pastedCents = toCents(Math.abs(pasted))
    if (pastedCents > MAX_CENTS) return
    onValueChange(fromCents(pastedCents))
  }

  return (
    <FieldInput
      inputMode="numeric"
      {...props}
      slot="currency-input"
      leading="R$"
      display={display}
      // The form receives the number itself ("1234.56"), not "1.234,56".
      formValue={String(fromCents(cents))}
      onChange={handleChange}
      onPaste={handlePaste}
    />
  )
}

CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput, type CurrencyInputProps }
