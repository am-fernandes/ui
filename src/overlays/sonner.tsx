"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import * as React from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

// A typed toast is neutral by default: the popover surface, with the icon in
// the status colour. With `richColors` it takes the strong fill of the status.
// Sonner's own tinted palette is replaced through its CSS variables: utility
// classes would lose to its stylesheet, which is not in a cascade layer.
const iconClass = "size-4 group-data-[rich-colors=true]/toast:text-current"

/**
 * Keeps the toasts usable while a modal is open.
 *
 * A modal (Dialog, AlertDialog, Sheet, a modal menu) makes the page behind it
 * inert, and the toasts are part of that page for it:
 *
 * - `<body>` gets `pointer-events: none`. The toaster turns them back on for
 *   itself (`pointerEvents: "auto"` in its style), so a toast can be clicked.
 * - The modal's focus trap listens on `document` and sends focus back the
 *   moment it leaves the modal, so Alt+T and Tab never reached a toast. The
 *   two events it listens to are stopped at `<html>`, one step before, when
 *   focus is going into the toasts. Focus leaving them is not touched: the
 *   trap takes it back into the modal, as for any other element.
 * - Escape with focus in the toasts hands focus back to where it was (Sonner
 *   restores it on blur) instead of leaving it there. The modals do not close
 *   on that Escape (`isToastFocused`).
 */
function useToastsAboveModals(sectionRef: React.RefObject<HTMLElement | null>) {
  React.useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const root = document.documentElement
    const inToasts = (node: EventTarget | null) => node instanceof Node && section.contains(node)

    const onFocusIn = (event: FocusEvent) => {
      if (inToasts(event.target)) event.stopPropagation()
    }
    const onFocusOut = (event: FocusEvent) => {
      if (inToasts(event.relatedTarget)) event.stopPropagation()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      const active = document.activeElement
      if (event.key === "Escape" && active instanceof HTMLElement && inToasts(active)) {
        active.blur()
      }
    }
    root.addEventListener("focusin", onFocusIn)
    root.addEventListener("focusout", onFocusOut)
    section.addEventListener("keydown", onKeyDown)
    return () => {
      root.removeEventListener("focusin", onFocusIn)
      root.removeEventListener("focusout", onFocusOut)
      section.removeEventListener("keydown", onKeyDown)
    }
  }, [sectionRef])
}

const Toaster = (props: ToasterProps) => {
  const sectionRef = React.useRef<HTMLElement>(null)
  useToastsAboveModals(sectionRef)

  return (
    <Sonner
      ref={sectionRef}
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
          // A modal turns pointer events off on <body>: the toasts stay clickable.
          pointerEvents: "auto",
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
