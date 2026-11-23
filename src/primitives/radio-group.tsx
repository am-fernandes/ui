"use client"

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { useComposedRefs } from "./_internal/compose-refs"
import { Label } from "./_internal/label"
import { useControllableState } from "./_internal/use-controllable-state"
import { useFieldIds } from "./_internal/use-field-ids"
import { useFormReset } from "./_internal/use-form-reset"

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
  /** The choices, in order. */
  options?: RadioGroupItemData[]
  /** @deprecated Use `options`, the name every choice list in the library has. */
  values?: RadioGroupItemData[]
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
  options: optionsProp,
  values,
  className,
  value: valueProp,
  defaultValue,
  onValueChange,
  "aria-describedby": describedBy,
  ref,
  ...props
}: RadioGroupProps) {
  const ids = useFieldIds(id)
  const options = optionsProp ?? values ?? []
  // `null`: no option chosen. Radix takes `undefined` as "uncontrolled".
  // Going back to "no choice" on a reset is not reported: `onValueChange`
  // only ever receives an option.
  const [value, setValue] = useControllableState<string | null>(
    valueProp,
    defaultValue ?? null,
    (next) => {
      if (next != null) onValueChange?.(next)
    },
  )
  // A form reset brings back the choice the group was created with.
  const initialValue = React.useRef(value)
  const [node, setNode] = React.useState<HTMLDivElement | null>(null)
  const composedRef = useComposedRefs(ref, setNode)
  useFormReset(node, () => setValue(initialValue.current))
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
        ref={composedRef}
        id={ids.controlId}
        data-slot="radio-group"
        value={value}
        onValueChange={setValue}
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
          // 8px between rows of 20px: the same 28px from option to option as
          // when the rows were the 16px of the radio.
          orientation === "horizontal" ? "flex flex-row flex-wrap gap-x-6 gap-y-2" : "grid gap-2",
          className,
        )}
        {...props}
      >
        {options.map((item) => {
          const itemId = `${ids.controlId}-${item.value}`
          const Icon = item.icon
          return (
            <div
              key={item.value}
              data-slot="radio-group-option"
              className={cn(
                "flex items-start gap-2",
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
                data-invalid={hasError ? "" : undefined}
                className={cn(
                  // 2px down: centred on the first 20px line of its label.
                  "mt-0.5 aspect-square size-4 shrink-0 cursor-pointer rounded-full border border-input text-primary data-[state=checked]:border-primary",
                  "focus-visible:focus-outline",
                  "disabled:cursor-default",
                  // The error marks the radios too, not only the text below.
                  "data-invalid:border-destructive-text data-invalid:data-[state=checked]:border-destructive-text",
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
