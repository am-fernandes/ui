"use client"

import type * as React from "react"

import { cn } from "@/lib/utils"

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode
  description?: React.ReactNode
  headerAction?: React.ReactNode
  footer?: React.ReactNode
  ref?: React.Ref<HTMLDivElement>
}

function Card({
  title,
  description,
  headerAction,
  footer,
  className,
  children,
  ref,
  ...props
}: CardProps) {
  const hasHeader = title != null || description != null || headerAction != null
  return (
    <div
      ref={ref}
      data-slot="card"
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    >
      {hasHeader ? (
        <div data-slot="card-header" className="flex items-start justify-between gap-4 p-6 pb-2">
          <div className="flex flex-col gap-1.5">
            {title ? (
              <h3 data-slot="card-title" className="text-lg font-semibold leading-none">
                {title}
              </h3>
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
      <div data-slot="card-content" className={cn("p-6", hasHeader && "pt-4")}>
        {children}
      </div>
      {footer ? (
        <div data-slot="card-footer" className="flex items-center justify-end gap-2 p-6 pt-0">
          {footer}
        </div>
      ) : null}
    </div>
  )
}

Card.displayName = "Card"

export { Card }
