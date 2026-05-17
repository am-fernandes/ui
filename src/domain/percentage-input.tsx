"use client"

import { cn } from "@/lib/utils"
import * as React from "react"

interface PercentageInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  value: number
  onValueChange: (value: number) => void
}

/** Float → centésimos inteiros. Ex: 33.33 → 3333 */
function toHundredths(v: number): number {
  return Math.round(v * 100)
}

/** Centésimos inteiros → float. Ex: 3333 → 33.33 */
function fromHundredths(h: number): number {
  return h / 100
}

/** Centésimos inteiros → display pt-BR: 3333 → "33,33" */
function hundredthsToDisplay(hundredths: number): string {
  const sign = hundredths < 0 ? "-" : ""
  const abs = Math.abs(hundredths)
  const integer = Math.floor(abs / 100)
  const decimal = abs % 100
  return `${sign}${integer},${String(decimal).padStart(2, "0")}`
}

const PercentageInput = React.forwardRef<HTMLInputElement, PercentageInputProps>(
  ({ className, value, onValueChange, disabled, ...props }, ref) => {
    const [hundredths, setHundredths] = React.useState(toHundredths(value))
    const internalRef = React.useRef(false)

    // Sync when value changes externally (e.g. from percentage auto-calc)
    React.useEffect(() => {
      if (internalRef.current) {
        internalRef.current = false
        return
      }
      setHundredths(toHundredths(value))
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, "")
      const newHundredths = Number.parseInt(digits, 10) || 0
      setHundredths(newHundredths)
      internalRef.current = true
      onValueChange(fromHundredths(newHundredths))
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
          value={hundredthsToDisplay(hundredths)}
          onChange={handleChange}
          disabled={disabled}
          {...props}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
          %
        </span>
      </div>
    )
  },
)
PercentageInput.displayName = "PercentageInput"

export { PercentageInput, type PercentageInputProps }
