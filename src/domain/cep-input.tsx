"use client"

import type * as React from "react"

import { cn } from "@/lib/utils"
import { FieldShell, type LabelPosition } from "../primitives/_internal/field-shell"
import { useFieldIds } from "../primitives/_internal/use-field-ids"

interface CEPInputProps extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  /**
   * O CEP como **dígitos limpos** (sem máscara).
   * Pode conter de 0 a 8 dígitos enquanto o usuário digita.
   * Ex.: `"01310100"`.
   */
  value: string
  onValueChange: (value: string) => void
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  labelPosition?: LabelPosition
  required?: boolean
  ref?: React.Ref<HTMLInputElement>
}

/** Aplica a máscara `00000-000` sobre dígitos limpos. */
function maskCEP(digits: string): string {
  const d = digits.slice(0, 8)
  if (d.length <= 5) return d
  return `${d.slice(0, 5)}-${d.slice(5, 8)}`
}

function CEPInput({
  className,
  value,
  onValueChange,
  disabled,
  label,
  description,
  error,
  labelPosition,
  required,
  id,
  ref,
  ...props
}: CEPInputProps) {
  const ids = useFieldIds(id)
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""
  const cleaned = value.replace(/\D/g, "").slice(0, 8)
  const display = maskCEP(cleaned)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 8)
    onValueChange(digits)
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
      <div className="relative" data-slot="cep-input">
        <input
          ref={ref}
          id={ids.controlId}
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={9}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={ids.describedBy({ description: hasDescription, error: hasError })}
          required={required}
          aria-required={required ? true : undefined}
          className={cn(
            "flex w-full rounded-md border border-input bg-transparent px-3 py-2.5 text-sm tabular-nums transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed",
            hasError && "border-destructive focus-visible:ring-1 focus-visible:ring-destructive",
            className,
          )}
          value={display}
          onChange={handleChange}
          disabled={disabled}
          {...props}
        />
      </div>
    </FieldShell>
  )
}

CEPInput.displayName = "CEPInput"

export { CEPInput, type CEPInputProps }
