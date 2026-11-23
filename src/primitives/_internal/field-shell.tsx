"use client"

import type * as React from "react"

import { cn } from "@/lib/utils"
import { type ControlSize, controlHeight, controlPaddingX } from "./control-size"
import { Label } from "./label"

export type LabelPosition = "up" | "left" | "hidden"

const fieldTriggerBase =
  "inline-flex w-full cursor-pointer items-center gap-2 whitespace-nowrap rounded-element border border-input bg-card text-left text-sm font-normal field-states disabled:pointer-events-none disabled:cursor-default [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"

/**
 * A button that looks and reacts like a text field (Astryx field look): the
 * trigger of Combobox, DateInput and DateRangePicker. The height is the
 * control height of the size, border included, so it lines up with buttons
 * and inputs of the same size. Disabled opacity comes from FieldShell, so it
 * is not repeated here.
 */
export function fieldTriggerSizeClass(size: ControlSize = "md"): string {
  return cn(fieldTriggerBase, controlHeight[size], controlPaddingX[size])
}

/**
 * The look of a read-only field, for the element that carries `field-states`
 * when it has `data-readonly`: a muted fill and no hover ring, so a computed
 * or locked value does not look typeable. It keeps its focus look: a
 * read-only field is still reached with Tab and its text can be copied.
 * Not for a disabled field, whose dimming already says it.
 */
export const fieldReadOnlyClass =
  "data-readonly:bg-muted data-readonly:[--field-hover-ring:transparent]"

// `labelPosition="left"`: the label's 20px line on the centre of a control of
// that height (and of the first row of a textarea of that size).
const labelBesideControl: Record<ControlSize, string> = {
  sm: "pt-1.5",
  md: "pt-2.5",
  lg: "pt-3",
}

/** The trigger at the default size (`md`). */
export const fieldTriggerClass = fieldTriggerSizeClass("md")

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
  /**
   * Read with the label of a required field whose control cannot announce it
   * itself (a button that opens a picker). @default "obrigatório"
   */
  requiredLabel?: string
  /**
   * The control carries `required` (or `aria-required`) and announces it: the
   * label only draws the asterisk, with no words, so "obrigatório" is not
   * said twice.
   */
  nativeRequired?: boolean
  disabled?: boolean
  /**
   * The control's size, for a label on the left: it is lined up with the
   * control box, not with the middle of box, description and error.
   * @default "md"
   */
  size?: ControlSize
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
  requiredLabel = "obrigatório",
  nativeRequired = false,
  disabled,
  size = "md",
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
        // Left: the label lines up with the box (top-aligned, its line on the
        // box's centre), however tall the description and error below are.
        labelPosition === "left" ? "flex-row items-start gap-3" : "flex-col gap-1",
        disabled && "opacity-50",
        className,
      )}
    >
      {hasLabel ? (
        <Label
          id={labelId}
          htmlFor={controlId}
          required={required}
          requiredText={nativeRequired ? undefined : requiredLabel}
          disabled={disabled}
          className={cn(
            labelPosition === "hidden" && "sr-only",
            // `--field-label-width` on a container lines up a column of labels.
            labelPosition === "left" &&
              cn("w-(--field-label-width,auto) shrink-0", labelBesideControl[size]),
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
            className="text-xs text-destructive-text"
          >
            {error}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export { FieldShell }
