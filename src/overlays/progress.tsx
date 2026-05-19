"use client"

import * as ProgressPrimitive from "@radix-ui/react-progress"
import type * as React from "react"

import { cn } from "@/lib/utils"

type ProgressProps = React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
  ref?: React.Ref<React.ComponentRef<typeof ProgressPrimitive.Root>>
}

function Progress({ className, value, ref, ...props }: ProgressProps) {
  const isIndeterminate = value === undefined || value === null
  const safeValue = isIndeterminate ? 0 : Math.max(0, Math.min(100, value))

  return (
    <ProgressPrimitive.Root
      ref={ref}
      data-slot="progress"
      value={isIndeterminate ? undefined : safeValue}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        data-state={isIndeterminate ? "indeterminate" : "determinate"}
        className={cn(
          "h-full w-full flex-1 bg-primary transition-[width]",
          isIndeterminate && "w-1/3 animate-pulse",
        )}
        style={
          isIndeterminate
            ? { transform: "translateX(0)" }
            : { transform: `translateX(-${100 - safeValue}%)` }
        }
      />
    </ProgressPrimitive.Root>
  )
}

Progress.displayName = "Progress"

export { Progress }
