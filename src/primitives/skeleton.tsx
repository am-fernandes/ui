import type * as React from "react"

import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>
}

function Skeleton({ className, ref, ...props }: SkeletonProps) {
  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-slot="skeleton"
      {...props}
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
    />
  )
}

Skeleton.displayName = "Skeleton"

export { Skeleton }
