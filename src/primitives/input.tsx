"use client"

import type * as React from "react"

import { cn } from "@/lib/utils"
import { FieldShell, type LabelPosition } from "./_internal/field-shell"
import { useFieldIds } from "./_internal/use-field-ids"

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: React.ReactNode
  labelPosition?: LabelPosition
  description?: React.ReactNode
  error?: string
  required?: boolean
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  ref?: React.Ref<HTMLInputElement>
}

function Input({
  id,
  label,
  labelPosition,
  description,
  error,
  required,
  leadingIcon,
  trailingIcon,
  className,
  disabled,
  ref,
  ...props
}: InputProps) {
  const ids = useFieldIds(id)
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""

  const inputEl = (
    <div
      data-slot="input-wrapper"
      className={cn(
        "relative flex h-9 w-full items-center rounded-md border border-input bg-transparent text-sm transition-colors",
        "focus-within:border-primary focus-within:ring-1 focus-within:ring-ring",
        hasError && "border-destructive ring-1 ring-destructive/20",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {leadingIcon ? (
        <span data-slot="input-leading" className="pl-3 text-muted-foreground">
          {leadingIcon}
        </span>
      ) : null}
      <input
        ref={ref}
        id={ids.controlId}
        data-slot="input"
        aria-invalid={hasError ? true : undefined}
        aria-describedby={ids.describedBy({ description: hasDescription, error: hasError })}
        disabled={disabled}
        required={required}
        className={cn(
          "h-full w-full bg-transparent px-3 py-3 placeholder:text-input outline-none disabled:cursor-not-allowed",
          leadingIcon && "pl-2",
          trailingIcon && "pr-2",
          className,
        )}
        {...props}
      />
      {trailingIcon ? (
        <span data-slot="input-trailing" className="pr-3 text-muted-foreground">
          {trailingIcon}
        </span>
      ) : null}
    </div>
  )

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
      {inputEl}
    </FieldShell>
  )
}

Input.displayName = "Input"

export { Input }
