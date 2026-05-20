"use client"

import * as SwitchPrimitive from "@radix-ui/react-switch"
import type * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "./_internal/label"
import { useFieldIds } from "./_internal/use-field-ids"

export interface SwitchProps extends Omit<React.ComponentProps<typeof SwitchPrimitive.Root>, "id"> {
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  id?: string
  ref?: React.Ref<HTMLButtonElement>
}

function Switch({
  id,
  label,
  description,
  error,
  required,
  disabled,
  className,
  ref,
  ...props
}: SwitchProps) {
  const ids = useFieldIds(id)
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""
  const hasLabel = label != null && label !== ""

  const switchEl = (
    <SwitchPrimitive.Root
      ref={ref}
      id={ids.controlId}
      data-slot="switch"
      disabled={disabled}
      required={required}
      aria-invalid={hasError ? true : undefined}
      aria-describedby={ids.describedBy({ description: hasDescription, error: hasError })}
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-4 rounded-full bg-background ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
      />
    </SwitchPrimitive.Root>
  )

  const labelEl = hasLabel ? (
    <div className="flex flex-col gap-0.5">
      <Label htmlFor={ids.controlId} required={required} id={ids.labelId}>
        {label}
      </Label>
      {hasDescription ? (
        <p id={ids.descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  ) : null

  return (
    <div data-slot="switch-field" className="flex w-full flex-col gap-1.5">
      <div className="flex min-h-10 items-center gap-2">
        {switchEl}
        {labelEl}
      </div>
      {hasError ? (
        <p id={ids.errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

Switch.displayName = "Switch"

export { Switch }
