"use client"

import type * as React from "react"

import { centsToDisplay, fromCents, toCents } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { FieldShell, type LabelPosition } from "../primitives/_internal/field-shell"
import { useFieldIds } from "../primitives/_internal/use-field-ids"

interface PercentageInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  value: number
  onValueChange: (value: number) => void
  /** Maximum percentage allowed. Default 100. */
  max?: number
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  labelPosition?: LabelPosition
  required?: boolean
  ref?: React.Ref<HTMLInputElement>
}

function PercentageInput({
  className,
  value,
  onValueChange,
  disabled,
  max = 100,
  label,
  description,
  error,
  labelPosition,
  required,
  id,
  ref,
  ...props
}: PercentageInputProps) {
  const ids = useFieldIds(id)
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""
  const display = centsToDisplay(toCents(value))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 15)
    const newHundredths = Number.parseInt(digits, 10) || 0
    const next = fromCents(newHundredths)
    onValueChange(next > max ? max : next)
  }

  return (
    <FieldShell
      controlId={ids.controlId}
      labelId={ids.labelId}
      descriptionId={ids.descriptionId}
      errorId={ids.errorId}
      label={label}
      description={description}
      error={error}
      labelPosition={labelPosition}
      required={required}
      disabled={disabled}
    >
      <div className="relative" data-slot="percentage-input">
        <input
          ref={ref}
          id={ids.controlId}
          type="text"
          inputMode="numeric"
          aria-invalid={hasError ? true : undefined}
          aria-describedby={ids.describedBy({ description: hasDescription, error: hasError })}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 pr-8 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            hasError && "border-destructive",
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
    </FieldShell>
  )
}

PercentageInput.displayName = "PercentageInput"

export { PercentageInput, type PercentageInputProps }
