"use client"

import { X } from "lucide-react"
import type * as React from "react"

import { DEFAULT_ALLOWED_LINK_PROTOCOLS, isAllowedUrl } from "@/lib/url"
import { cn } from "@/lib/utils"

export type TokenColor =
  | "gray"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "teal"
  | "blue"
  | "purple"
  | "pink"

// Literal class strings so Tailwind can see them. Text on the tinted
// background is ≥ 7.3:1; the solid accent (icon, border) is ≥ 3.9:1.
const colorClasses: Record<TokenColor, { root: string; icon: string }> = {
  gray: {
    root: "bg-category-gray-bg text-category-gray-text border-category-gray-solid/30",
    icon: "text-category-gray-solid",
  },
  red: {
    root: "bg-category-red-bg text-category-red-text border-category-red-solid/30",
    icon: "text-category-red-solid",
  },
  orange: {
    root: "bg-category-orange-bg text-category-orange-text border-category-orange-solid/30",
    icon: "text-category-orange-solid",
  },
  yellow: {
    root: "bg-category-yellow-bg text-category-yellow-text border-category-yellow-solid/30",
    icon: "text-category-yellow-solid",
  },
  green: {
    root: "bg-category-green-bg text-category-green-text border-category-green-solid/30",
    icon: "text-category-green-solid",
  },
  teal: {
    root: "bg-category-teal-bg text-category-teal-text border-category-teal-solid/30",
    icon: "text-category-teal-solid",
  },
  blue: {
    root: "bg-category-blue-bg text-category-blue-text border-category-blue-solid/30",
    icon: "text-category-blue-solid",
  },
  purple: {
    root: "bg-category-purple-bg text-category-purple-text border-category-purple-solid/30",
    icon: "text-category-purple-solid",
  },
  pink: {
    root: "bg-category-pink-bg text-category-pink-text border-category-pink-solid/30",
    icon: "text-category-pink-solid",
  },
}

const sizeClasses = {
  sm: { root: "h-6 gap-1 px-2 text-xs", icon: "size-3.5", remove: "size-4 -mr-1", x: "size-3" },
  md: {
    root: "h-7 gap-1.5 px-2.5 text-sm",
    icon: "size-4",
    remove: "size-5 -mr-1.5",
    x: "size-3.5",
  },
} as const

export interface TokenLabels {
  /** Accessible name of the remove button. */
  remove: (label: string) => string
}

export const defaultTokenLabels: TokenLabels = {
  remove: (label) => `Remover ${label}`,
}

export interface TokenProps {
  label: string
  /** Categorical colour. @default "gray" */
  color?: TokenColor
  /** @default "md" */
  size?: "sm" | "md"
  icon?: React.ComponentType<{ className?: string }>
  /** Renders an × button ("Remover {label}"). */
  onRemove?: () => void
  /** Makes the whole token a button. */
  onClick?: () => void
  /**
   * Makes the whole token a link. Unsafe protocols (`javascript:`…) are
   * dropped and the token renders as plain text (or a button with `onClick`).
   */
  href?: string
  /** Link target. `"_blank"` also sets `rel="noopener noreferrer"`. */
  target?: React.HTMLAttributeAnchorTarget
  disabled?: boolean
  labels?: Partial<TokenLabels>
  className?: string
  ref?: React.Ref<HTMLSpanElement>
}

/**
 * Compact tinted chip for inline metadata, filters and selections — removable,
 * clickable or a link. For a solid status label ("Aprovado", "Pendente") use
 * `Badge`.
 *
 * The clickable part and the remove button are siblings (never nested): the
 * label's hit area is stretched over the whole chip, with the × on top.
 */
function Token({
  label,
  color = "gray",
  size = "md",
  icon: Icon,
  onRemove,
  onClick,
  href,
  target,
  disabled = false,
  labels,
  className,
  ref,
}: TokenProps) {
  const l: TokenLabels = { ...defaultTokenLabels, ...labels }
  const palette = colorClasses[color]
  const sizing = sizeClasses[size]

  const hrefIsSafe = href != null && isAllowedUrl(href, DEFAULT_ALLOWED_LINK_PROTOCOLS)
  if (process.env.NODE_ENV !== "production" && href != null && href !== "" && !hrefIsSafe) {
    console.warn(
      `[Token] href "${href}" was blocked because its protocol is not on the allowlist. Rendering the token without a link.`,
    )
  }

  // Stretched hit area + focus ring drawn over the whole chip.
  const actionClass = cn(
    "min-w-0 truncate outline-none",
    "after:absolute after:inset-0 after:rounded-md after:transition-colors",
    "focus-visible:after:focus-outline",
    disabled
      ? "cursor-default"
      : "cursor-pointer hover:after:state-hover active:after:state-pressed",
  )

  let content: React.ReactNode
  if (hrefIsSafe) {
    content = (
      <a
        data-slot="token-action"
        href={disabled ? undefined : href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        role={disabled ? "link" : undefined}
        aria-disabled={disabled ? "true" : undefined}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault()
            return
          }
          onClick?.()
        }}
        className={actionClass}
      >
        {label}
      </a>
    )
  } else if (onClick) {
    content = (
      <button
        type="button"
        data-slot="token-action"
        disabled={disabled}
        onClick={onClick}
        className={actionClass}
      >
        {label}
      </button>
    )
  } else {
    content = <span className="min-w-0 truncate">{label}</span>
  }

  return (
    <span
      ref={ref}
      data-slot="token"
      data-color={color}
      data-size={size}
      data-disabled={disabled ? "" : undefined}
      className={cn(
        "relative inline-flex max-w-full shrink-0 items-center rounded-md border font-medium leading-none whitespace-nowrap",
        palette.root,
        sizing.root,
        disabled && "opacity-50",
        className,
      )}
    >
      {Icon ? <Icon className={cn("shrink-0", sizing.icon, palette.icon)} aria-hidden /> : null}
      {content}
      {onRemove ? (
        <button
          type="button"
          data-slot="token-remove"
          aria-label={l.remove(label)}
          disabled={disabled}
          onClick={onRemove}
          className={cn(
            "relative z-10 inline-flex shrink-0 items-center justify-center rounded-sm opacity-70 transition",
            "focus-visible:focus-outline",
            disabled ? "cursor-default" : "cursor-pointer state-layer hover:opacity-100",
            sizing.remove,
          )}
        >
          <X className={sizing.x} aria-hidden />
        </button>
      ) : null}
    </span>
  )
}

Token.displayName = "Token"

export { Token }
