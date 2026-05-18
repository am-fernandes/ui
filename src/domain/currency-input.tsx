"use client"

import { centsToDisplay, fromCents, toCents } from "@/lib/currency"
import { cn } from "@/lib/utils"
import type * as React from "react"

interface CurrencyInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  /**
   * The value in **float reais** (BRL).
   *
   * IMPORTANT: do not perform arithmetic on the float. Use `toCents`/`fromCents`
   * from `@am-fernandes/ui` for any computation (sums, percentages, multiplications).
   * The component itself round-trips through cents — assume any value is accurate
   * to 2 decimals only.
   */
  value: number
  onValueChange: (value: number) => void
  ref?: React.Ref<HTMLInputElement>
}

function CurrencyInput({
  className,
  value,
  onValueChange,
  disabled,
  ref,
  ...props
}: CurrencyInputProps) {
  const display = centsToDisplay(toCents(value))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clamp digit input to 15 chars to avoid Number.parseInt losing precision
    // past Number.MAX_SAFE_INTEGER (9.007e15).
    const digits = e.target.value.replace(/\D/g, "").slice(0, 15)
    const newCents = Number.parseInt(digits, 10) || 0
    onValueChange(fromCents(newCents))
  }

  return (
    <div className="relative" data-slot="currency-input">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
        R$
      </span>
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        value={display}
        onChange={handleChange}
        disabled={disabled}
        {...props}
      />
    </div>
  )
}

CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput, type CurrencyInputProps }
