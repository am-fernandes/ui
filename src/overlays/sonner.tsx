"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

// A typed toast is neutral by default: the popover surface, with the icon in
// the status colour. With `richColors` it takes the strong fill of the status.
// Sonner's own tinted palette is replaced through its CSS variables: utility
// classes would lose to its stylesheet, which is not in a cascade layer.
const iconClass = "size-4 group-data-[rich-colors=true]/toast:text-current"

const Toaster = (props: ToasterProps) => {
  return (
    <Sonner
      // sonner forwards className but drops unknown data-* props from the root, so we
      // tag via class instead — tests query for the toaster element below.
      className="toaster group [&_section]:data-[sonner-toaster]"
      icons={{
        success: <CircleCheckIcon className={`${iconClass} text-success`} />,
        info: <InfoIcon className={`${iconClass} text-link`} />,
        warning: <TriangleAlertIcon className={`${iconClass} text-warning`} />,
        error: <OctagonXIcon className={`${iconClass} text-destructive-text`} />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{ classNames: { toast: "group/toast" } }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border-strong)",
          "--success-bg": "var(--success)",
          "--success-text": "var(--success-foreground)",
          "--success-border": "transparent",
          "--error-bg": "var(--destructive)",
          "--error-text": "var(--destructive-foreground)",
          "--error-border": "transparent",
          "--warning-bg": "var(--warning)",
          "--warning-text": "var(--warning-foreground)",
          "--warning-border": "transparent",
          "--info-bg": "var(--info)",
          "--info-text": "var(--info-foreground)",
          "--info-border": "transparent",
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
export type { ToasterProps } from "sonner"
