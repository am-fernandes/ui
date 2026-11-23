"use client"

import type * as React from "react"

import { centsToDisplay, fromCents, toCents } from "@/lib/currency"
import { FieldInput, type FieldInputProps } from "./_internal/field-input"

interface PercentageInputProps extends Omit<FieldInputProps, "max"> {
  value: number
  onValueChange: (value: number) => void
  /** Maximum percentage allowed. Default 100. */
  max?: number
}

function PercentageInput({ value, onValueChange, max = 100, ...props }: PercentageInputProps) {
  const hundredths = toCents(value)
  const display = centsToDisplay(hundredths)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 15)
    const newHundredths = Number.parseInt(digits, 10) || 0
    const next = fromCents(newHundredths)
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
    />
  )
}

PercentageInput.displayName = "PercentageInput"

export { PercentageInput, type PercentageInputProps }
