"use client"

import type * as React from "react"

import { cn } from "@/lib/utils"

interface InternalLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * Draws a red asterisk after the text. The asterisk is for the eye only
   * (`aria-hidden`): a control with `required` or `aria-required` already
   * announces it, and an asterisk in its name would make it say so twice.
   */
  required?: boolean
  /**
   * Words read with the name when `required` ("obrigatório"), for a control
   * that cannot say it is required itself, such as the button that opens a
   * date picker. Leave it out when the control has `required` or
   * `aria-required`.
   */
  requiredText?: string
  /**
   * The control is disabled: the label stops inviting a click. It is not
   * dimmed here. The 50% of a disabled field goes once on the outermost piece
   * around the control, the label and the messages.
   */
  disabled?: boolean
  /**
   * `"span"` for the name of a group (radiogroup): a `<label for>` only works
   * on a form control, so the group points at the text with
   * `aria-labelledby` instead. @default "label"
   */
  as?: "label" | "span"
  ref?: React.Ref<HTMLLabelElement>
}

function Label({
  as: Element = "label",
  className,
  children,
  required,
  requiredText,
  disabled,
  htmlFor,
  ref,
  ...props
}: InternalLabelProps) {
  return (
    <Element
      ref={ref}
      data-slot="label"
      htmlFor={Element === "label" ? htmlFor : undefined}
      className={cn(
        "text-sm font-medium leading-5",
        // A click on a <label> acts on its control; the name of a group does nothing.
        Element === "label" && (disabled ? "cursor-default" : "cursor-pointer"),
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <>
          <span
            data-slot="label-required"
            aria-hidden="true"
            className="ml-0.5 text-destructive-text"
          >
            *
          </span>
          {requiredText ? <span className="sr-only"> {requiredText}</span> : null}
        </>
      ) : null}
    </Element>
  )
}

export { Label }
