"use client"

import type * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "../primitives/_internal/label"
import { useFieldIds } from "../primitives/_internal/use-field-ids"

export interface FieldProps {
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  required?: boolean
  disabled?: boolean
  orientation?: "vertical" | "horizontal" | "responsive"
  className?: string
  children: React.ReactNode
  /** Optional id override for the inner control. */
  controlId?: string
}

function Field({
  label,
  description,
  error,
  required,
  disabled,
  orientation = "vertical",
  className,
  children,
  controlId,
}: FieldProps) {
  const ids = useFieldIds(controlId)
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""
  const hasLabel = label != null && label !== ""

  return (
    <div
      data-slot="field"
      data-orientation={orientation}
      data-disabled={disabled ? "true" : undefined}
      className={cn(
        "flex w-full",
        orientation === "horizontal"
          ? "flex-row items-start gap-3"
          : orientation === "responsive"
            ? "flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3"
            : "flex-col gap-1.5",
        disabled && "opacity-60",
        className,
      )}
    >
      {hasLabel ? (
        <Label htmlFor={ids.controlId} required={required} id={ids.labelId}>
          {label}
        </Label>
      ) : null}
      <div className="flex w-full flex-col gap-1.5">
        {children}
        {hasDescription ? (
          <p
            id={ids.descriptionId}
            data-slot="field-description"
            className="text-xs text-muted-foreground"
          >
            {description}
          </p>
        ) : null}
        {hasError ? (
          <p
            id={ids.errorId}
            data-slot="field-error"
            role="alert"
            className="text-xs text-destructive"
          >
            {error}
          </p>
        ) : null}
      </div>
    </div>
  )
}

Field.displayName = "Field"

export interface FieldGroupProps {
  legend?: React.ReactNode
  description?: React.ReactNode
  disabled?: boolean
  className?: string
  children: React.ReactNode
}

function FieldGroup({ legend, description, disabled, className, children }: FieldGroupProps) {
  return (
    <fieldset
      data-slot="field-group"
      disabled={disabled}
      className={cn("flex flex-col gap-4 rounded-md border p-4", className)}
    >
      {legend ? (
        <legend data-slot="field-group-legend" className="px-1 text-sm font-medium">
          {legend}
        </legend>
      ) : null}
      {description ? (
        <p data-slot="field-group-description" className="-mt-2 text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      <div className="flex flex-col gap-4">{children}</div>
    </fieldset>
  )
}

FieldGroup.displayName = "FieldGroup"

export { Field, FieldGroup }
