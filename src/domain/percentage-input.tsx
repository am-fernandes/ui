"use client"

import { formatUnits } from "./_internal/decimal-engine"
import { type DecimalFieldProps, DecimalInput } from "./_internal/decimal-input"

interface PercentageInputBaseProps extends DecimalFieldProps {
  /**
   * Largest percentage. A key (or a paste) that would take the value past it
   * is refused: the field keeps what it had, and never shows a number the
   * user did not type.
   * @default 100
   */
  max?: number
  /**
   * Smallest percentage. While typing, the value passes below it on its way
   * up, so it is applied when the field loses focus after an edit: a smaller
   * value is raised to `min`. A negative `min` lets the field take negative
   * percentages, with the minus key.
   */
  min?: number
  /**
   * Decimal places shown and kept: `2` (12,50), `1` (12,5) or `0` (12).
   * Typed digits fill the last place first, and a value with more places is
   * rounded.
   * @default 2
   */
  decimals?: 0 | 1 | 2
}

interface PercentageInputZeroProps extends PercentageInputBaseProps {
  /**
   * What an empty field is worth. `"zero"` (the default): the field always
   * holds a number, and clearing it goes back to `0,00`. `"null"`: the field
   * can be empty, which is `null`, different from zero; the placeholder shows
   * and a native `required` works.
   * @default "zero"
   */
  emptyValue?: "zero"
  /**
   * The percentage (`12.5` is 12,50 %), controlled. Leave it out and the
   * field keeps its own value, starting from `defaultValue`.
   */
  value?: number
  /** Initial value of an uncontrolled field. */
  defaultValue?: number
  /** Called with the percentage after every edit. */
  onValueChange?: (value: number) => void
}

interface PercentageInputNullProps extends PercentageInputBaseProps {
  emptyValue: "null"
  /** The percentage, or `null` for an empty field. */
  value?: number | null
  defaultValue?: number | null
  /** Called with the percentage, or `null` when the field is cleared. */
  onValueChange?: (value: number | null) => void
}

type PercentageInputProps = PercentageInputZeroProps | PercentageInputNullProps

function PercentageInput({
  emptyValue = "zero",
  value,
  defaultValue,
  onValueChange,
  max = 100,
  min,
  decimals = 2,
  ...props
}: PercentageInputProps) {
  const allowEmpty = emptyValue === "null"
  // In "zero" mode the field never reports `null`; the cast only tells the
  // two signatures of the union apart.
  const report = onValueChange as ((value: number | null) => void) | undefined
  return (
    <DecimalInput
      // An empty field shows the format it expects.
      placeholder={allowEmpty ? formatUnits(0, decimals) : undefined}
      {...props}
      slot="percentage-input"
      trailing="%"
      decimals={decimals}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => report?.(allowEmpty ? next : (next ?? 0))}
      allowEmpty={allowEmpty}
      allowNegative={min != null && min < 0}
      min={min}
      max={max}
    />
  )
}

PercentageInput.displayName = "PercentageInput"

export { PercentageInput, type PercentageInputProps }
