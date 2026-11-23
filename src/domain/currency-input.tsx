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
  /**
   * Accepts negative values (a refund, a discount, a balance owed). The minus
   * key makes the value negative, a second one or `+` makes it positive
   * again, and a pasted negative number keeps its sign. The field then opens
   * the text keyboard on phones: the iOS numeric keypad has no minus key.
   * @default false
   */
  allowNegative?: boolean
}

function CurrencyInput({
  value,
  onValueChange,
  allowNegative = false,
  ...props
}: CurrencyInputProps) {
  return (
    <DecimalInput
      {...props}
      slot="currency-input"
      leading="R$"
      decimals={2}
      value={value}
      onValueChange={(next) => onValueChange(next ?? 0)}
      allowEmpty={false}
      allowNegative={allowNegative}
    />
  )
}

CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput, type CurrencyInputProps }
