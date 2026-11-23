"use client"

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"
import type * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "./_internal/label"
import { useFieldIds } from "./_internal/use-field-ids"

export interface RadioGroupItemData {
  value: string
  label: React.ReactNode
  disabled?: boolean
  icon?: React.ComponentType<{ className?: string }>
}

export interface RadioGroupProps
  extends Omit<React.ComponentProps<typeof RadioGroupPrimitive.Root>, "id" | "orientation"> {
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  orientation?: "vertical" | "horizontal"
  values: RadioGroupItemData[]
  id?: string
  ref?: React.Ref<HTMLDivElement>
}

function RadioGroup({
  id,
  label,
  description,
  error,
  required,
  disabled,
  orientation = "vertical",
  values,
  className,
  "aria-describedby": describedBy,
  ref,
  ...props
}: RadioGroupProps) {
  const ids = useFieldIds(id)
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""
  const hasLabel = label != null && label !== ""

  return (
    <div
      data-slot="radio-group-field"
      data-disabled={disabled ? "" : undefined}
      // A disabled group dims once, here: name, options and messages.
      className={cn("flex w-full flex-col gap-1.5", disabled && "opacity-50")}
    >
      {hasLabel ? (
        <Label as="span" required={required} id={ids.labelId}>
          {label}
        </Label>
      ) : null}
      {hasDescription ? (
        <p id={ids.descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      <RadioGroupPrimitive.Root
        ref={ref}
        id={ids.controlId}
        data-slot="radio-group"
        data-orientation={orientation}
        disabled={disabled}
        required={required}
        aria-labelledby={hasLabel ? ids.labelId : undefined}
        aria-describedby={ids.describedBy(
          { description: hasDescription, error: hasError },
          describedBy,
        )}
        aria-invalid={hasError ? true : undefined}
        className={cn(
          orientation === "horizontal" ? "flex flex-row flex-wrap gap-6" : "grid gap-3",
          className,
        )}
        {...props}
      >
        {values.map((item) => {
          const itemId = `${ids.controlId}-${item.value}`
          const Icon = item.icon
          return (
            <div
              key={item.value}
              data-slot="radio-group-option"
              className={cn(
                "flex items-center gap-2",
                // One option disabled: its row dims, radio and label together.
                // Not inside a disabled group, which is already dimmed.
                item.disabled && !disabled && "opacity-50",
              )}
            >
              <RadioGroupPrimitive.Item
                id={itemId}
                value={item.value}
                disabled={item.disabled}
                data-slot="radio-group-item"
                className={cn(
                  "aspect-square size-4 shrink-0 cursor-pointer rounded-full border border-input text-primary data-[state=checked]:border-primary",
                  "focus-visible:focus-outline",
                  "disabled:cursor-default",
                )}
              >
                <RadioGroupPrimitive.Indicator
                  data-slot="radio-group-indicator"
                  className="flex items-center justify-center"
                >
                  <CircleIcon className="size-2 fill-current text-current" />
                </RadioGroupPrimitive.Indicator>
              </RadioGroupPrimitive.Item>
              <Label
                htmlFor={itemId}
                disabled={Boolean(disabled || item.disabled)}
                className="font-normal"
              >
                <span className="inline-flex items-center gap-1.5">
                  {Icon ? <Icon className="size-4" /> : null}
                  {item.label}
                </span>
              </Label>
            </div>
          )
        })}
      </RadioGroupPrimitive.Root>
      {hasError ? (
        <p id={ids.errorId} role="alert" className="text-xs text-destructive-text">
          {error}
        </p>
      ) : null}
    </div>
  )
}

RadioGroup.displayName = "RadioGroup"

export { RadioGroup }
