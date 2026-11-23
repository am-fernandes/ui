"use client"

import { type DecimalFieldProps, DecimalInput } from "./_internal/decimal-input"

interface PercentageInputProps extends DecimalFieldProps {
  value: number
  onValueChange: (value: number) => void
  /** Maximum percentage allowed. Default 100. */
  max?: number
}

function PercentageInput({ value, onValueChange, max = 100, ...props }: PercentageInputProps) {
  return (
    <DecimalInput
      {...props}
      slot="percentage-input"
      trailing="%"
      decimals={2}
      value={value}
      onValueChange={(next) => onValueChange(Math.min(next ?? 0, max))}
      allowEmpty={false}
      allowNegative={false}
    />
  )
}

PercentageInput.displayName = "PercentageInput"

export { PercentageInput, type PercentageInputProps }
