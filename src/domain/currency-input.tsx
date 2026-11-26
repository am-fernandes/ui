"use client"

import { type DecimalFieldProps, DecimalInput } from "./_internal/decimal-input"

export interface CurrencyInputLabels {
  belowMin: (min: string) => string
  aboveMax: (max: string) => string
}

export const defaultCurrencyInputLabels: CurrencyInputLabels = {
  belowMin: (min) => `O valor mínimo é ${min}.`,
  aboveMax: (max) => `O valor máximo é ${max}.`,
}

interface CurrencyInputBaseProps extends DecimalFieldProps {
  labels?: Partial<CurrencyInputLabels>
  /**
   * Accepts negative values (a refund, a discount, a balance owed). The minus
   * key makes the value negative, a second one or `+` makes it positive
   * again, and a pasted negative number keeps its sign. The field then opens
   * the text keyboard on phones: the iOS numeric keypad has no minus key.
   * @default false
   */
  allowNegative?: boolean
  /**
   * Smallest value, in reais. A smaller value is kept as typed: the field
   * shows `labels.belowMin` when it is left, on Enter or on submit, and is
   * invalid for the browser, so a native submit stops on it.
   */
  min?: number
  /** Largest value, in reais, as `min`, with `labels.aboveMax`. */
  max?: number
}

interface CurrencyInputZeroProps extends CurrencyInputBaseProps {
  /**
   * What an empty field is worth. `"zero"` (the default): the field always
   * holds a number, and clearing it goes back to `0,00`. `"null"`: the field
   * can be empty, which is `null`, different from zero; the placeholder shows
   * and a native `required` works.
   * @default "zero"
   */
  emptyValue?: "zero"
  /**
   * The value in **float reais** (BRL), controlled. Leave it out and the
   * field keeps its own value, starting from `defaultValue`.
   *
   * IMPORTANT: do not perform arithmetic on the float. Use `toCents`/`fromCents`
   * from `@amfernandesinc/ui` for any computation (sums, percentages, multiplications).
   * The component itself round-trips through cents — assume any value is accurate
   * to 2 decimals only.
   */
  value?: number
  /** Initial value of an uncontrolled field. */
  defaultValue?: number
  /** Called with the value in reais after every edit. */
  onValueChange?: (value: number) => void
}

interface CurrencyInputNullProps extends CurrencyInputBaseProps {
  emptyValue: "null"
  /** The value in reais, or `null` for an empty field. */
  value?: number | null
  defaultValue?: number | null
  /** Called with the value in reais, or `null` when the field is cleared. */
  onValueChange?: (value: number | null) => void
}

type CurrencyInputProps = CurrencyInputZeroProps | CurrencyInputNullProps

function CurrencyInput({
  emptyValue = "zero",
  value,
  defaultValue,
  onValueChange,
  labels,
  allowNegative = false,
  ...props
}: CurrencyInputProps) {
  const allowEmpty = emptyValue === "null"
  // In "zero" mode the field never reports `null`; the cast only tells the
  // two signatures of the union apart.
  const report = onValueChange as ((value: number | null) => void) | undefined
  return (
    <DecimalInput
      // An empty field shows the format it expects.
      placeholder={allowEmpty ? "0,00" : undefined}
      {...props}
      slot="currency-input"
      leading="R$"
      decimals={2}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => report?.(allowEmpty ? next : (next ?? 0))}
      allowEmpty={allowEmpty}
      limitLabels={{ ...defaultCurrencyInputLabels, ...labels }}
      writeLimit={(text) => `R$ ${text}`}
      allowNegative={allowNegative}
    />
  )
}

CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput, type CurrencyInputProps }
