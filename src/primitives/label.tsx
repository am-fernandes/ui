"use client"

import * as LabelPrimitive from "@radix-ui/react-label"
import type * as React from "react"

import { cn } from "@/lib/utils"

function Label({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
  ref?: React.Ref<React.ComponentRef<typeof LabelPrimitive.Root>>
}) {
  return (
    <LabelPrimitive.Root
      ref={ref}
      data-slot="label"
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  )
}

export { Label }
