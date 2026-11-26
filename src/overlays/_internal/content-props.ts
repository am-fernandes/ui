import type * as React from "react"

/**
 * Attributes for an overlay's content panel: `id`, `data-*`, `aria-*` and
 * handlers. Spread before the overlay's own props, so what the overlay
 * needs to work (its `data-slot`, its handlers, its classes) wins.
 */
export type OverlayContentProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children" | "className" | "style" | "dir"
> & { [key: `data-${string}`]: string | undefined }
