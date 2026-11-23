"use client"

import { X } from "lucide-react"
import type * as React from "react"

import { type RenderLink, type RenderLinkProps, renderLinkElement } from "@/lib/render-link"
import { DEFAULT_ALLOWED_LINK_PROTOCOLS, isAllowedUrl } from "@/lib/url"
import { cn } from "@/lib/utils"
import { ignoreActivation } from "./_internal/soft-disabled"

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

// Literal class strings so Tailwind can see them. Text on the faint background
// is ≥ 8.7:1. The solid (icon, border) is ≥ 3:1 on the surface and sits at a
// different lightness in each colour: it and the label tell categories apart.
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

// The × is drawn at 16px (sm) and 20px (md); its hit area (`before:`) is
// 24px either way, the minimum target of WCAG 2.2 (SC 2.5.8).
const sizeClasses = {
  sm: {
    root: "h-6 gap-1 px-2 text-xs",
    icon: "size-3.5",
    remove: "size-4 -mr-1 before:-inset-1",
    x: "size-3",
  },
  md: {
    root: "h-7 gap-1.5 px-2.5 text-sm",
    icon: "size-4",
    remove: "size-5 -mr-1.5 before:-inset-0.5",
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
  /**
   * Makes the whole token a button; with `href`, runs on the link's click.
   * Receives the event: `event.preventDefault()` stops the link.
   */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
  /**
   * Makes the whole token a link. Unsafe protocols (`javascript:`…) are
   * dropped and the token renders as plain text (or a button with `onClick`).
   */
  href?: string
  /**
   * Renders the link with your router's `<Link>`, so it navigates without
   * reloading the page: `renderLink={({ href, ...props }) => <Link to={href} {...props} />}`.
   * Pass every prop on: they carry the classes and the click handler.
   */
  renderLink?: RenderLink
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
  renderLink,
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
    "after:absolute after:inset-0 after:rounded-inner after:transition-colors",
    "focus-visible:after:focus-outline",
    disabled
      ? "cursor-default"
      : "cursor-pointer hover:after:state-hover active:after:state-pressed",
  )

  let content: React.ReactNode
  if (hrefIsSafe && disabled) {
    // Nowhere to go: a link with no href, still announced as a link,
    // unavailable. Never through `renderLink`: a router link needs an href.
    content = (
      <a
        data-slot="token-action"
        // biome-ignore lint/a11y/useSemanticElements: without an href an <a> has no role of its own.
        role="link"
        aria-disabled="true"
        // biome-ignore lint/a11y/useValidAnchor: a disabled link has no href; the click only stops here.
        onClick={ignoreActivation}
        className={actionClass}
      >
        {label}
      </a>
    )
  } else if (hrefIsSafe) {
    const linkProps: RenderLinkProps & { "data-slot": string } = {
      "data-slot": "token-action",
      href,
      target,
      rel: target === "_blank" ? "noopener noreferrer" : undefined,
      onClick,
      className: actionClass,
      children: label,
    }
    content = renderLinkElement(renderLink, linkProps)
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
        "relative inline-flex max-w-full shrink-0 items-center rounded-inner border font-medium leading-none whitespace-nowrap",
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
            "relative z-10 inline-flex shrink-0 items-center justify-center rounded-inner opacity-70 transition",
            "before:absolute before:content-['']",
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
