"use client"

import { Loader2 } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Tooltip, type TooltipProps } from "../overlays/tooltip"
import { buttonVariants } from "./button"

const iconButtonSizes = {
  /** 32px — dense rows (table actions, menu footers). */
  sm: "size-8",
  /** 40px — same height as `Button`, so they line up side by side. */
  md: "size-10",
  /** 44px — touch target. */
  lg: "size-11 [&_svg]:size-5",
} as const

export type IconButtonSize = keyof typeof iconButtonSizes

export type IconButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost"

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label"> {
  /** The icon (e.g. a lucide-react element). Sized to 16px (20px at `lg`). */
  icon: React.ReactNode
  /**
   * What the button does ("Editar", "Notificações"). Required: it is the
   * accessible name and, by default, the tooltip text.
   */
  label: string
  /** Same colours as `Button`. @default "ghost" */
  variant?: IconButtonVariant
  /** @default "md" */
  size?: IconButtonSize
  /** Replaces the icon with a spinner and disables the button. */
  loading?: boolean
  /** Show `label` as a tooltip on hover/focus. @default true */
  tooltip?: boolean
  /** Tooltip side. @default "top" */
  tooltipSide?: TooltipProps["side"]
  ref?: React.Ref<HTMLButtonElement>
}

/**
 * Square button with only an icon. Unlike `Button`, the accessible name is
 * mandatory (`label`) and shows up as a tooltip, so the action is never a
 * mystery for mouse or screen-reader users.
 *
 * Defaults to `type="button"` so an icon inside a form (clear, copy, toggle
 * visibility) never submits it by accident.
 */
function IconButton({
  icon,
  label,
  variant = "ghost",
  size = "md",
  loading = false,
  tooltip = true,
  tooltipSide,
  disabled,
  type = "button",
  className,
  ref,
  ...props
}: IconButtonProps) {
  const buttonRef = React.useRef<HTMLButtonElement | null>(null)
  const [tooltipOpen, setTooltipOpen] = React.useState(false)
  const mergedRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      buttonRef.current = node
      assignRef(ref, node)
    },
    [ref],
  )

  // Radix opens a tooltip on *any* focus — including focus placed by code: a
  // Dialog auto-focusing its first control, a DropdownMenu handing focus back
  // to its trigger. After a mouse interaction that tooltip is noise, and it
  // swallows the next Escape (it becomes the top layer). Show it on hover and
  // on keyboard focus (`:focus-visible`) only.
  const handleTooltipOpenChange = (next: boolean) => {
    const node = buttonRef.current
    if (
      next &&
      node != null &&
      node === document.activeElement &&
      !matchesSafely(node, ":focus-visible") &&
      !matchesSafely(node, ":hover")
    ) {
      return
    }
    setTooltipOpen(next)
  }

  const button = (
    <button
      ref={mergedRef}
      type={type}
      data-slot="icon-button"
      aria-label={label}
      aria-busy={loading || undefined}
      disabled={loading || disabled}
      className={cn(buttonVariants({ variant }), "p-0", iconButtonSizes[size], className)}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : icon}
    </button>
  )

  if (!tooltip) return button
  return (
    <Tooltip
      content={label}
      side={tooltipSide}
      open={tooltipOpen}
      onOpenChange={handleTooltipOpenChange}
    >
      {button}
    </Tooltip>
  )
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value)
  else if (ref) (ref as React.RefObject<T | null>).current = value
}

/** `Element.matches` that treats unsupported selectors as a match (old engines). */
function matchesSafely(element: Element, selector: string) {
  try {
    return element.matches(selector)
  } catch {
    return true
  }
}

IconButton.displayName = "IconButton"

export { IconButton }
