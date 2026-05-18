import type * as React from "react"

import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) {
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

export { Skeleton }
