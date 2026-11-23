"use client"

import { Loader2 } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Tooltip, type TooltipProps } from "../overlays/tooltip"
import { useAnnounceWhen } from "./_internal/announce"
import { useComposedRefs } from "./_internal/compose-refs"
import { type ControlSize, controlSquare } from "./_internal/control-size"
import { ignoreActivation } from "./_internal/soft-disabled"
import { type ButtonLabels, buttonVariants, defaultButtonLabels } from "./button"

/**
 * `sm` 32px — dense rows (table actions, menu footers); `md` 40px; `lg` 44px —
 * touch target. A square of the shared control height, so it lines up with a
 * `Button` or an `Input` of the same size.
 */
export type IconButtonSize = ControlSize

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
  /**
   * The action is not available. The button is dimmed and ignores clicks and
   * the keyboard, but it is never natively disabled: it is `aria-disabled`,
   * so Tab still reaches it and its tooltip still says what it is. An icon
   * with no tooltip and no focus would be a mystery, in a table row above all.
   */
  disabled?: boolean
  /**
   * The action is running: a spinner takes the place of the icon and the
   * button ignores clicks, keeping the focus (`aria-busy`, `aria-disabled`).
   */
  loading?: boolean
  /** Show `label` as a tooltip on hover/focus. @default true */
  tooltip?: boolean
  /** Tooltip side. @default "top" */
  tooltipSide?: TooltipProps["side"]
  /** Text for screen readers (`loading`). Defaults in `defaultButtonLabels`. */
  labels?: Partial<ButtonLabels>
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
  disabled = false,
  type = "button",
  labels,
  onClick,
  className,
  ref,
  ...props
}: IconButtonProps) {
  const buttonRef = React.useRef<HTMLButtonElement | null>(null)
  const [tooltipOpen, setTooltipOpen] = React.useState(false)
  const unavailable = disabled || loading
  useAnnounceWhen(loading, labels?.loading ?? defaultButtonLabels.loading)
  const mergedRef = useComposedRefs(buttonRef, ref)

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
      // Never the native `disabled`: it would hide the tooltip, the only
      // text this button has, and take the button out of the tab order.
      aria-disabled={unavailable || undefined}
      data-disabled={disabled ? "" : undefined}
      data-loading={loading ? "" : undefined}
      className={cn(
        buttonVariants({ variant, size }),
        // A square never gives way in a tight row: the text beside it does.
        "shrink-0 p-0",
        controlSquare[size],
        size === "lg" && "[&_svg]:size-5",
        className,
      )}
      {...props}
      onClick={unavailable ? ignoreActivation : onClick}
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
