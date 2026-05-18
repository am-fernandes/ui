import { type VariantProps, cva } from "class-variance-authority"
import type * as React from "react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-md border px-4 py-3 text-sm [&>svg+*]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        info: "border-status-info-border bg-status-info-bg text-status-info-text [&>svg]:text-status-info-text",
        success:
          "border-status-success-border bg-status-success-bg text-status-success-text [&>svg]:text-status-success-text",
        warning:
          "border-status-warning-border bg-status-warning-bg text-status-warning-text [&>svg]:text-status-warning-text",
        destructive:
          "border-status-destructive-border bg-status-destructive-bg text-status-destructive-text [&>svg]:text-status-destructive-text",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  ref?: React.Ref<HTMLDivElement>
}

function Alert({ className, variant, ref, ...props }: AlertProps) {
  return (
    <div
      ref={ref}
      role="alert"
      data-slot="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  ref?: React.Ref<HTMLHeadingElement>
}

function AlertTitle({ className, ref, ...props }: AlertTitleProps) {
  return (
    <h5
      ref={ref}
      data-slot="alert-title"
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  )
}

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>
}

function AlertDescription({ className, ref, ...props }: AlertDescriptionProps) {
  return (
    <div
      ref={ref}
      data-slot="alert-description"
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, alertVariants }
