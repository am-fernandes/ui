"use client"

import type * as React from "react"

import { cn } from "@/lib/utils"
import { FieldShell, type LabelPosition } from "../../primitives/_internal/field-shell"
import { useFieldIds } from "../../primitives/_internal/use-field-ids"

/**
 * What every formatted text field of the domain family takes besides its own
 * value: the field chrome (label, description, error) and the native
 * attributes of the visible `<input>`.
 */
export interface FieldInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "defaultValue" | "onChange" | "type"> {
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  labelPosition?: LabelPosition
  required?: boolean
  /**
   * Shows the value without letting it be edited: it stays readable, takes
   * focus, can be copied and is submitted with the form. Use it for a field
   * on a view-only screen; `disabled` is for a field that does not apply.
   */
  readOnly?: boolean
  /**
   * Name of the field in a native form. The form receives the **clean**
   * value (what `onValueChange` reports), carried by a hidden input; the
   * visible input, which shows the formatted text, has no name.
   */
  name?: string
  ref?: React.Ref<HTMLInputElement>
}

interface FieldInputInternalProps extends FieldInputProps {
  /** `data-slot` of the wrapper (`cpf-input`, `currency-input`…). */
  slot: string
  /** The formatted text the visible input shows. */
  display: string
  /** The clean value a form receives under `name`. */
  formValue: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  /** Fixed text before the value (`R$`). */
  leading?: React.ReactNode
  /** Fixed text after the value (`%`). */
  trailing?: React.ReactNode
}

/**
 * The shell shared by the masked inputs (CPF, CNPJ, CEP, phone) and the
 * numeric ones (currency, percentage): `FieldShell`, the visible input and,
 * with `name`, the hidden input that carries the clean value.
 */
function FieldInput({
  slot,
  display,
  formValue,
  onChange,
  leading,
  trailing,
  className,
  disabled,
  label,
  description,
  error,
  labelPosition,
  required,
  readOnly,
  id,
  name,
  form,
  ref,
  ...props
}: FieldInputInternalProps) {
  const ids = useFieldIds(id)
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""

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
      <div className="relative" data-slot={slot}>
        {leading ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {leading}
          </span>
        ) : null}
        <input
          ref={ref}
          id={ids.controlId}
          type="text"
          aria-invalid={hasError ? true : undefined}
          aria-describedby={ids.describedBy({ description: hasDescription, error: hasError })}
          required={required}
          aria-required={required ? true : undefined}
          className={cn(
            "flex w-full rounded-element border border-input bg-card px-3 py-2.5 text-sm tabular-nums field-states disabled:cursor-default",
            leading != null && "pl-9",
            trailing != null && "pr-8",
            hasError && "border-destructive-text field-error",
            // Read-only: a muted box that does not answer to hover (important,
            // so it also wins over the hover tint of `field-error`). The focus
            // look stays, because the field still takes focus.
            readOnly && "bg-muted [--field-hover-ring:transparent]!",
            className,
          )}
          disabled={disabled}
          readOnly={readOnly}
          form={form}
          {...props}
          value={display}
          onChange={onChange}
        />
        {trailing ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {trailing}
          </span>
        ) : null}
        {name != null && name !== "" ? (
          <input type="hidden" name={name} value={formValue} disabled={disabled} form={form} />
        ) : null}
      </div>
    </FieldShell>
  )
}

FieldInput.displayName = "FieldInput"

export { FieldInput }
