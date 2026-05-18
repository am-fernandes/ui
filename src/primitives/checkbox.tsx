"use client"

import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon, MinusIcon } from "lucide-react"
import type * as React from "react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
  ref?: React.Ref<React.ComponentRef<typeof CheckboxPrimitive.Root>>
}) {
  const isIndeterminate = props.checked === "indeterminate"
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      data-slot="checkbox"
      className={cn(
        "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className={cn("grid place-content-center text-current")}
      >
        {isIndeterminate ? (
          <MinusIcon className="h-3.5 w-3.5" data-slot="checkbox-indeterminate-icon" />
        ) : (
          <CheckIcon className="h-3.5 w-3.5" data-slot="checkbox-check-icon" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
