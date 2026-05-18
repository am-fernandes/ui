"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
  ref?: React.Ref<HTMLLabelElement>
}

function Label({ className, children, required, ref, ...props }: LabelProps) {
  return (
    <label
      ref={ref}
      data-slot="label"
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
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

export { Label, type LabelProps }
