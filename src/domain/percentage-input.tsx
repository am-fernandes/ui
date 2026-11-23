"use client"

import type * as React from "react"

import { centsToDisplay, fromCents, parseBRNumber, toCents } from "@/lib/currency"
import { FieldInput, type FieldInputProps } from "./_internal/field-input"

interface PercentageInputProps extends Omit<FieldInputProps, "max"> {
  value: number
  onValueChange: (value: number) => void
  /** Maximum percentage allowed. Default 100. */
  max?: number
}

function PercentageInput({
  value,
  onValueChange,
  max = 100,
  onPaste,
  ...props
}: PercentageInputProps) {
  const hundredths = toCents(value)
  const display = centsToDisplay(hundredths)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 15)
    const newHundredths = Number.parseInt(digits, 10) || 0
    const next = fromCents(newHundredths)
    onValueChange(next > max ? max : next)
  }

  // Typed digits fill the hundredths first; a pasted text is a number
  // someone wrote ("12,5", "7", "33,33%") and replaces the value.
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    onPaste?.(e)
    // A read-only field takes no paste; the browser already ignores it.
    if (e.defaultPrevented || props.readOnly) return
    e.preventDefault()
    const pasted = parseBRNumber(e.clipboardData?.getData("text") ?? "")
    if (pasted == null) return
    const next = fromCents(toCents(Math.abs(pasted)))
    onValueChange(next > max ? max : next)
  }

  return (
    <FieldInput
      inputMode="numeric"
      {...props}
      slot="percentage-input"
      trailing="%"
      display={display}
      // The form receives the number itself ("12.5"), not "12,50".
      formValue={String(fromCents(hundredths))}
      onChange={handleChange}
      onPaste={handlePaste}
    />
  )
}

PercentageInput.displayName = "PercentageInput"

export { PercentageInput, type PercentageInputProps }
