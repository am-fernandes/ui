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
    <div data-slot="checkbox-field" className="flex w-full flex-col gap-1.5">
      <div className={cn("flex gap-2", hasDescription ? "items-start" : "items-center")}>
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
            "peer size-4 shrink-0 cursor-pointer rounded-inner border border-input",
            hasDescription && "mt-0.5",
            "focus-visible:focus-outline",
            "disabled:cursor-default disabled:opacity-50",
            "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
            "data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
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
