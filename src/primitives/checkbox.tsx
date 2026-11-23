"use client"

import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon, MinusIcon } from "lucide-react"
import type * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "./_internal/label"
import { useFieldIds } from "./_internal/use-field-ids"

export interface CheckboxProps
  extends Omit<
    React.ComponentProps<typeof CheckboxPrimitive.Root>,
    "id" | "checked" | "defaultChecked" | "onCheckedChange"
  > {
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  /**
   * `true`, `false` ou `"indeterminate"`: o estado misto de um "selecionar
   * todos" quando só parte dos itens está marcada. Um clique no estado misto
   * marca a caixa.
   */
  checked?: boolean | "indeterminate"
  defaultChecked?: boolean | "indeterminate"
  /** Recebe sempre `true` ou `false`: um clique nunca produz o estado misto. */
  onCheckedChange?: (checked: boolean) => void
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
  onCheckedChange,
  "aria-describedby": describedBy,
  ref,
  ...props
}: CheckboxProps) {
  const ids = useFieldIds(id)
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""
  const hasLabel = label != null && label !== ""

  return (
    <div
      data-slot="checkbox-field"
      data-disabled={disabled ? "" : undefined}
      // Disabled dims the whole field once, here: box, label and messages.
      className={cn("flex w-full flex-col gap-1.5", disabled && "opacity-50")}
    >
      <div className="flex items-start gap-2">
        <CheckboxPrimitive.Root
          ref={ref}
          id={ids.controlId}
          data-slot="checkbox"
          checked={checked}
          onCheckedChange={onCheckedChange ? (state) => onCheckedChange(state === true) : undefined}
          disabled={disabled}
          required={required}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={ids.describedBy(
            { description: hasDescription, error: hasError },
            describedBy,
          )}
          className={cn(
            // 2px down: centred on the first 20px line of the label, however
            // many lines the label takes.
            "peer mt-0.5 size-4 shrink-0 cursor-pointer rounded-inner border border-input",
            "focus-visible:focus-outline",
            "disabled:cursor-default",
            "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
            "data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
            // Forced colours: checked and mixed take the system's selection
            // colours. On paper the fill is kept, or the white mark would
            // print on nothing.
            "forced-colors:data-[state=checked]:border-[Highlight] forced-colors:data-[state=checked]:bg-[Highlight] forced-colors:data-[state=checked]:text-[HighlightText]",
            "forced-colors:data-[state=indeterminate]:border-[Highlight] forced-colors:data-[state=indeterminate]:bg-[Highlight] forced-colors:data-[state=indeterminate]:text-[HighlightText]",
            "[print-color-adjust:exact]",
            hasError && "border-destructive-text",
            className,
          )}
          {...props}
        >
          <CheckboxPrimitive.Indicator
            data-slot="checkbox-indicator"
            className="group/indicator grid place-content-center text-current"
          >
            <CheckIcon className="size-3.5 group-data-[state=indeterminate]/indicator:hidden" />
            <MinusIcon className="hidden size-3.5 group-data-[state=indeterminate]/indicator:block" />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>

        {/* The description shows with or without a label: aria-describedby points at it. */}
        {hasLabel || hasDescription ? (
          <div className="flex flex-col gap-0.5">
            {hasLabel ? (
              <Label
                htmlFor={ids.controlId}
                required={required}
                disabled={disabled}
                id={ids.labelId}
              >
                {label}
              </Label>
            ) : null}
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
          className="text-xs text-destructive-text"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}

Checkbox.displayName = "Checkbox"

export { Checkbox }
