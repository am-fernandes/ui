"use client"

import { centsToDisplay, fromCents, toCents } from "@/lib/currency"
import { cn } from "@/lib/utils"
import type * as React from "react"

interface PercentageInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  value: number
  onValueChange: (value: number) => void
  /**
   * Maximum percentage allowed. The input is clamped on every change so that
   * `value` never exceeds `max`. Defaults to 100. Use a higher number for
   * scenarios where percentages above 100 are valid (e.g. growth rates).
   */
  max?: number
  ref?: React.Ref<HTMLInputElement>
}

function PercentageInput({
  className,
  value,
  onValueChange,
  disabled,
  max = 100,
  ref,
  ...props
}: PercentageInputProps) {
  const display = centsToDisplay(toCents(value))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clamp digit input to 15 chars to avoid Number.parseInt losing precision
    // past Number.MAX_SAFE_INTEGER (9.007e15).
    const digits = e.target.value.replace(/\D/g, "").slice(0, 15)
    const newHundredths = Number.parseInt(digits, 10) || 0
    const next = fromCents(newHundredths)
    onValueChange(next > max ? max : next)
  }

  return (
    <div className="relative" data-slot="percentage-input">
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 pr-8 py-1 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        value={display}
        onChange={handleChange}
        disabled={disabled}
        {...props}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
        %
      </span>
    </div>
  )
}

PercentageInput.displayName = "PercentageInput"

export { PercentageInput, type PercentageInputProps }
