"use client"

import type * as React from "react"

import { cn } from "@/lib/utils"

interface InternalLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
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
        "text-sm font-medium leading-none peer-disabled:cursor-default peer-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <span aria-label="obrigatório" className="ml-0.5 text-destructive-text">
          *
        </span>
      ) : null}
    </Element>
  )
}

export { Label }
