"use client"

import * as ProgressPrimitive from "@radix-ui/react-progress"
import type * as React from "react"

import { cn } from "@/lib/utils"

export interface ProgressProps
  extends Omit<React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>, "value" | "max"> {
  /**
   * How far it got, from 0 to `max`. `null` or `undefined`: indeterminate (it
   * is running, nobody knows how long it takes), drawn as a moving segment.
   */
  value?: number | null
  /** The value of "done": 7 for step 3 of 7. @default 100 */
  max?: number
  ref?: React.Ref<React.ComponentRef<typeof ProgressPrimitive.Root>>
}

function Progress({ className, value, max = 100, ref, ...props }: ProgressProps) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100
  const indeterminate = value == null || Number.isNaN(value)
  const safeValue = indeterminate ? null : Math.max(0, Math.min(safeMax, value))
  const percent = safeValue == null ? 0 : (safeValue / safeMax) * 100

  return (
    <ProgressPrimitive.Root
      ref={ref}
      data-slot="progress"
      value={safeValue}
      max={safeMax}
      className={cn("relative h-2 w-full overflow-hidden rounded-inner bg-primary/20", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 bg-primary transition-[width]",
          // Reduced motion: a still third in the middle of the track.
          indeterminate &&
            "w-1/3 animate-progress-indeterminate motion-reduce:translate-x-full motion-reduce:animate-none",
        )}
        style={indeterminate ? undefined : { transform: `translateX(-${100 - percent}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

Progress.displayName = "Progress"

export { Progress }
