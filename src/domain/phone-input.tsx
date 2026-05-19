"use client"

import type * as React from "react"

import { cn } from "@/lib/utils"
import { FieldShell, type LabelPosition } from "../primitives/_internal/field-shell"
import { useFieldIds } from "../primitives/_internal/use-field-ids"

interface PhoneInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  /**
   * O telefone como **dígitos limpos** (sem máscara).
   * Pode conter de 0 a 11 dígitos enquanto o usuário digita.
   * Ex.: `"11987654321"` (celular) ou `"1133334444"` (fixo).
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

/**
 * Aplica a máscara de telefone:
 *   - 10 dígitos → `(00) 0000-0000`
 *   - 11 dígitos → `(00) 00000-0000`
 */
function maskPhone(digits: string): string {
  const d = digits.slice(0, 11)
  if (d.length === 0) return ""
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`
}

function PhoneInput({
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
}: PhoneInputProps) {
  const ids = useFieldIds(id)
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""
  const cleaned = value.replace(/\D/g, "").slice(0, 11)
  const display = maskPhone(cleaned)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11)
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
      <div className="relative" data-slot="phone-input">
        <input
          ref={ref}
          id={ids.controlId}
          type="text"
          inputMode="tel"
          autoComplete="tel"
          maxLength={16}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={ids.describedBy({ description: hasDescription, error: hasError })}
          required={required}
          aria-required={required ? true : undefined}
          className={cn(
            "flex w-full rounded-md border border-input bg-transparent px-3 py-3 text-sm tabular-nums transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed",
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

PhoneInput.displayName = "PhoneInput"

export { PhoneInput, type PhoneInputProps }
