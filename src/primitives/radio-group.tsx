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
  ref,
  ...props
}: RadioGroupProps) {
  const ids = useFieldIds(id)
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""
  const hasLabel = label != null && label !== ""

  return (
    <div data-slot="radio-group-field" className="flex w-full flex-col gap-1.5">
      {hasLabel ? (
        <Label htmlFor={ids.controlId} required={required} id={ids.labelId}>
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
        aria-describedby={ids.describedBy({ description: hasDescription, error: hasError })}
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
            <div key={item.value} className="flex items-start gap-2">
              <RadioGroupPrimitive.Item
                id={itemId}
                value={item.value}
                disabled={item.disabled}
                data-slot="radio-group-item"
                className={cn(
                  "aspect-square size-4 shrink-0 cursor-pointer rounded-full border border-primary text-primary",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                <RadioGroupPrimitive.Indicator
                  data-slot="radio-group-indicator"
                  className="flex items-center justify-center"
                >
                  <CircleIcon className="size-2 fill-current text-current" />
                </RadioGroupPrimitive.Indicator>
              </RadioGroupPrimitive.Item>
              <Label htmlFor={itemId} className="font-normal">
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
        <p id={ids.errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

RadioGroup.displayName = "RadioGroup"

export { RadioGroup }
