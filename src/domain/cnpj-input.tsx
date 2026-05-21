"use client"

import type * as React from "react"

import { cn } from "@/lib/utils"
import { FieldShell, type LabelPosition } from "../primitives/_internal/field-shell"
import { useFieldIds } from "../primitives/_internal/use-field-ids"

interface CNPJInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  /**
   * O CNPJ como **dígitos limpos** (sem máscara).
   * Pode conter de 0 a 14 dígitos enquanto o usuário digita.
   * Ex.: `"11222333000181"`.
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

/** Aplica a máscara `00.000.000/0000-00` sobre dígitos limpos. */
function maskCNPJ(digits: string): string {
  const d = digits.slice(0, 14)
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`
}

function CNPJInput({
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
}: CNPJInputProps) {
  const ids = useFieldIds(id)
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""
  const cleaned = value.replace(/\D/g, "").slice(0, 14)
  const display = maskCNPJ(cleaned)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 14)
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
      <div className="relative" data-slot="cnpj-input">
        <input
          ref={ref}
          id={ids.controlId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={18}
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

CNPJInput.displayName = "CNPJInput"

export { CNPJInput, type CNPJInputProps }
