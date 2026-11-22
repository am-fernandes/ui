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

const alertVariants = cva(
  // `[&_svg]:size-4` (descendant) instead of `[&>svg]:size-4` (direct
  // child): the rendered icon lives inside the `<span>` wrapper below,
  // so the old direct-child selector never matched and lucide icons
  // rendered at their intrinsic 24px — visually off centre from the
  // 16px title baseline.
  "relative w-full rounded-container border p-4 [print-color-adjust:exact] [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-border-strong bg-card text-card-foreground",
        // One strong fill per status. The transparent border is what a
        // forced-colors mode draws; a focus ring inside takes the text colour.
        info: "border-transparent bg-info text-info-foreground [--focus-outline-color:currentColor]",
        success:
          "border-transparent bg-success text-success-foreground [--focus-outline-color:currentColor]",
        warning:
          "border-transparent bg-warning text-warning-foreground [--focus-outline-color:currentColor]",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground [--focus-outline-color:currentColor]",
      },
    },
    defaultVariants: { variant: "default" },
  },
)

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
