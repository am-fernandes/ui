"use client"

import { type VariantProps, cva } from "class-variance-authority"
import {
  CheckCircle2Icon,
  CircleAlertIcon,
  InfoIcon,
  OctagonAlertIcon,
  TriangleAlertIcon,
} from "lucide-react"
import type * as React from "react"

import { cn } from "@/lib/utils"

const alertVariants = cva("relative w-full rounded-lg border p-4 [&>svg]:size-4 [&>svg]:shrink-0", {
  variants: {
    variant: {
      default: "bg-background text-foreground",
      info: "border-status-info-border bg-status-info-bg text-status-info-text",
      success: "border-status-success-border bg-status-success-bg text-status-success-text",
      warning: "border-status-warning-border bg-status-warning-bg text-status-warning-text",
      destructive: "border-destructive/50 bg-destructive/10 text-destructive",
    },
  },
  defaultVariants: { variant: "default" },
})

const DEFAULT_ICONS: Record<
  NonNullable<VariantProps<typeof alertVariants>["variant"]>,
  React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>
> = {
  default: CircleAlertIcon,
  info: InfoIcon,
  success: CheckCircle2Icon,
  warning: TriangleAlertIcon,
  destructive: OctagonAlertIcon,
}

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof alertVariants> {
  title?: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  action?: React.ReactNode
  ref?: React.Ref<HTMLDivElement>
}

function Alert({
  className,
  variant = "default",
  title,
  description,
  icon,
  action,
  children,
  ref,
  ...props
}: AlertProps) {
  const Icon = DEFAULT_ICONS[variant ?? "default"]
  const renderedIcon = icon ?? <Icon aria-hidden="true" />

  return (
    <div
      ref={ref}
      role="alert"
      data-slot="alert"
      data-variant={variant}
      className={cn(
        alertVariants({ variant }),
        "grid grid-cols-[auto_1fr_auto] items-start gap-3",
        className,
      )}
      {...props}
    >
      <span className="mt-0.5 flex">{renderedIcon}</span>
      <div className="flex flex-col gap-1">
        {title ? <div className="font-medium leading-none">{title}</div> : null}
        {description ? <div className="text-sm opacity-90">{description}</div> : null}
        {children ? <div className="text-sm">{children}</div> : null}
      </div>
      {action ? (
        <div data-slot="alert-action" className="ml-auto">
          {action}
        </div>
      ) : null}
    </div>
  )
}

Alert.displayName = "Alert"

export { Alert, alertVariants }
