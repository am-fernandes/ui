"use client"

import { type DecimalFieldProps, DecimalInput } from "./_internal/decimal-input"

interface CurrencyInputProps extends DecimalFieldProps {
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

function CurrencyInput({ value, onValueChange, ...props }: CurrencyInputProps) {
  return (
    <DecimalInput
      {...props}
      slot="currency-input"
      leading="R$"
      decimals={2}
      value={value}
      onValueChange={(next) => onValueChange(next ?? 0)}
      allowEmpty={false}
      allowNegative={false}
    />
  )
}

CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput, type CurrencyInputProps }
