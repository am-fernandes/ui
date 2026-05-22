"use client"

import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"
import type * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "./_internal/label"
import { useFieldIds } from "./_internal/use-field-ids"

export interface CheckboxProps
  extends Omit<React.ComponentProps<typeof CheckboxPrimitive.Root>, "id" | "checked"> {
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  checked?: boolean
  id?: string
  ref?: React.Ref<HTMLButtonElement>
}

function Checkbox({
  id,
  label,
  description,
  error,
  required,
  disabled,
  className,
  checked,
  ref,
  ...props
}: CheckboxProps) {
  const ids = useFieldIds(id)
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""
  const hasLabel = label != null && label !== ""

  return (
    <div data-slot="checkbox-field" className="flex w-full flex-col gap-1.5">
      <div className={cn("flex gap-2", hasDescription ? "items-start" : "items-center")}>
        <CheckboxPrimitive.Root
          ref={ref}
          id={ids.controlId}
          data-slot="checkbox"
          checked={checked}
          disabled={disabled}
          required={required}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={ids.describedBy({ description: hasDescription, error: hasError })}
          className={cn(
            "peer size-4 shrink-0 cursor-pointer rounded-sm border border-primary",
            hasDescription && "mt-0.5",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
            hasError && "border-destructive",
            className,
          )}
          {...props}
        >
          <CheckboxPrimitive.Indicator
            data-slot="checkbox-indicator"
            className="grid place-content-center text-current"
          >
            <CheckIcon className="size-3.5" />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>

        {hasLabel ? (
          <div className="flex flex-col gap-0.5">
            <Label htmlFor={ids.controlId} required={required} id={ids.labelId}>
              {label}
            </Label>
            {hasDescription ? (
              <p
                id={ids.descriptionId}
                data-slot="checkbox-description"
                className="text-xs text-muted-foreground"
              >
                {description}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {hasError ? (
        <p
          id={ids.errorId}
          data-slot="checkbox-error"
          role="alert"
          className="text-xs text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}

Checkbox.displayName = "Checkbox"

export { Checkbox }
