"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = (props: ToasterProps) => {
  return (
    <Sonner
      // sonner forwards className but drops unknown data-* props from the root, so we
      // tag via class instead — tests query for the toaster element below.
      className="toaster group [&_section]:data-[sonner-toaster]"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          success:
            "group-[.toaster]:bg-status-success-bg group-[.toaster]:text-status-success-text group-[.toaster]:border-status-success-border [&_svg]:!text-success",
          error:
            "group-[.toaster]:bg-status-destructive-bg group-[.toaster]:text-status-destructive-text group-[.toaster]:border-status-destructive-border [&_svg]:!text-destructive",
          warning:
            "group-[.toaster]:bg-status-warning-bg group-[.toaster]:text-status-warning-text group-[.toaster]:border-status-warning-border [&_svg]:!text-status-warning-text",
          info: "group-[.toaster]:bg-status-info-bg group-[.toaster]:text-status-info-text group-[.toaster]:border-status-info-border [&_svg]:!text-status-info-text",
          loading:
            "group-[.toaster]:bg-popover group-[.toaster]:text-popover-foreground group-[.toaster]:border-border",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          // Override Sonner's default 999999999 to keep toasts inside the system scale.
          zIndex: "var(--z-toast)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

Toaster.displayName = "Toaster"

export { Toaster }
export { toast } from "sonner"
