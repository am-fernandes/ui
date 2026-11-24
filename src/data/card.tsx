"use client"

import type * as React from "react"

import { cn } from "@/lib/utils"

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode
  description?: React.ReactNode
  headerAction?: React.ReactNode
  footer?: React.ReactNode
  /**
   * Space around the content. `"compact"` for dense dashboards; `"none"`
   * when the content brings its own edges (a DataTable, a list, a chart that
   * should touch the border). Header and footer keep their padding.
   * @default "default"
   */
  padding?: "default" | "compact" | "none"
  /** Level of the title's heading, to fit the page outline. @default 3 */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  ref?: React.Ref<HTMLDivElement>
}

const contentPadding = {
  default: { alone: "p-6", afterHeader: "p-6 pt-4" },
  compact: { alone: "p-4", afterHeader: "p-4 pt-3" },
  none: { alone: "", afterHeader: "" },
} as const

function Card({
  title,
  description,
  headerAction,
  footer,
  padding = "default",
  headingLevel = 3,
  className,
  children,
  ref,
  ...props
}: CardProps) {
  const hasHeader = title != null || description != null || headerAction != null
  const Heading = `h${headingLevel}` as const
  const compact = padding === "compact"
  return (
    <div
      ref={ref}
      data-slot="card"
      className={cn(
        "rounded-container border border-border-strong bg-card text-card-foreground",
        className,
      )}
      {...props}
    >
      {hasHeader ? (
        <div
          data-slot="card-header"
          className={cn(
            "flex items-start justify-between gap-4",
            compact ? "p-4 pb-1" : "p-6 pb-2",
            padding === "none" && "pb-4",
          )}
        >
          <div className="flex flex-col gap-1.5">
            {title ? (
              <Heading data-slot="card-title" className="text-lg font-semibold leading-snug">
                {title}
              </Heading>
            ) : null}
            {description ? (
              <p data-slot="card-description" className="text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {headerAction ? (
            <div data-slot="card-header-action" className="shrink-0">
              {headerAction}
            </div>
          ) : null}
        </div>
      ) : null}
      <div
        data-slot="card-content"
        data-padding={padding}
        className={cn(contentPadding[padding][hasHeader ? "afterHeader" : "alone"])}
      >
        {children}
      </div>
      {footer ? (
        <div
          data-slot="card-footer"
          className={cn(
            "flex items-center justify-end gap-2",
            compact ? "p-4 pt-0" : "p-6 pt-0",
            padding === "none" && "pt-4",
          )}
        >
          {footer}
        </div>
      ) : null}
    </div>
  )
}

Card.displayName = "Card"

export { Card }
