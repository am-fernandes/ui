"use client"

import type * as React from "react"

import { cn } from "@/lib/utils"

interface InternalLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
  ref?: React.Ref<HTMLLabelElement>
}

function Label({ className, children, required, ref, ...props }: InternalLabelProps) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: consumers pass `htmlFor` to associate; the component cannot statically verify the control exists.
    <label
      ref={ref}
      data-slot="label"
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <span aria-label="obrigatório" className="ml-0.5 text-destructive">
          *
        </span>
      ) : null}
    </label>
  )
}

export { Label }
