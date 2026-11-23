"use client"

import { type DecimalFieldProps, DecimalInput } from "./_internal/decimal-input"

interface PercentageInputBaseProps extends DecimalFieldProps {
  /** Maximum percentage allowed. Default 100. */
  max?: number
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
  ...props
}: PercentageInputProps) {
  const allowEmpty = emptyValue === "null"
  // In "zero" mode the field never reports `null`; the cast only tells the
  // two signatures of the union apart.
  const report = onValueChange as ((value: number | null) => void) | undefined
  return (
    <DecimalInput
      // An empty field shows the format it expects.
      placeholder={allowEmpty ? "0,00" : undefined}
      {...props}
      slot="percentage-input"
      trailing="%"
      decimals={2}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => {
        if (next == null) report?.(allowEmpty ? null : 0)
        else report?.(Math.min(next, max))
      }}
      allowEmpty={allowEmpty}
      allowNegative={false}
    />
  )
}

PercentageInput.displayName = "PercentageInput"

export { PercentageInput, type PercentageInputProps }
