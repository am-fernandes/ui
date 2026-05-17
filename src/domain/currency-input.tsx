"use client"

import { centsToDisplay, fromCents, toCents } from "@/lib/currency"
import { cn } from "@/lib/utils"
import * as React from "react"

interface CurrencyInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  value: number
  onValueChange: (value: number) => void
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onValueChange, disabled, ...props }, ref) => {
    const [cents, setCents] = React.useState(toCents(value))
    const internalRef = React.useRef(false)

    // Sync when value changes externally (e.g. percentage auto-calc)
    React.useEffect(() => {
      if (internalRef.current) {
        internalRef.current = false
        return
      }
      setCents(toCents(value))
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, "")
      const newCents = Number.parseInt(digits, 10) || 0
      setCents(newCents)
      internalRef.current = true
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
          value={centsToDisplay(cents)}
          onChange={handleChange}
          disabled={disabled}
          {...props}
        />
      </div>
    )
  },
)
CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput, type CurrencyInputProps }
