"use client"

import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import type * as React from "react"

import { cn } from "@/lib/utils"

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  asChild?: boolean
  ref?: React.Ref<React.ComponentRef<typeof LabelPrimitive.Root>>
}

function Label({ className, asChild = false, ref, ...props }: LabelProps) {
  const Comp = asChild ? Slot : LabelPrimitive.Root
  return (
    <Comp
      ref={ref as React.Ref<React.ComponentRef<typeof LabelPrimitive.Root>>}
      data-slot="label"
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

Label.displayName = "Label"

export { Label }
