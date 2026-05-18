"use client"

import type * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "./label"

export type LabelPosition = "up" | "left" | "hidden"

export interface FieldShellProps {
  controlId: string
  labelId: string
  descriptionId: string
  errorId: string
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  labelPosition?: LabelPosition
  required?: boolean
  disabled?: boolean
  className?: string
  children: React.ReactNode
}

function FieldShell({
  controlId,
  labelId,
  descriptionId,
  errorId,
  label,
  description,
  error,
  labelPosition = "up",
  required,
  disabled,
  className,
  children,
}: FieldShellProps) {
  const hasLabel = label != null && label !== ""
  const hasDescription = description != null && description !== ""
  const hasError = error != null && error !== ""

  return (
    <div
      data-slot="field-shell"
      data-label-position={labelPosition}
      data-disabled={disabled ? "true" : undefined}
      className={cn(
        "flex w-full",
        labelPosition === "left" ? "flex-row items-center gap-3" : "flex-col gap-1.5",
        disabled && "opacity-60",
        className,
      )}
    >
      {hasLabel ? (
        <Label
          id={labelId}
          htmlFor={controlId}
          required={required}
          className={cn(
            labelPosition === "hidden" && "sr-only",
            labelPosition === "left" && "shrink-0",
          )}
        >
          {label}
        </Label>
      ) : null}

      <div className="flex w-full flex-col gap-1.5">
        {children}
        {hasDescription ? (
          <p
            id={descriptionId}
            data-slot="field-description"
            className="text-xs text-muted-foreground"
          >
            {description}
          </p>
        ) : null}
        {hasError ? (
          <p
            id={errorId}
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

export { FieldShell }
