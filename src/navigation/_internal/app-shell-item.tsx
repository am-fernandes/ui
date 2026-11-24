"use client"

import { ChevronDown } from "lucide-react"
import * as React from "react"

import { type RenderLink, type RenderLinkProps, renderLinkElement } from "@/lib/render-link"
import { DEFAULT_ALLOWED_LINK_PROTOCOLS, isAllowedUrl } from "@/lib/url"
import { cn } from "@/lib/utils"
import { Tooltip } from "../../overlays/tooltip"
import { isModifiedClick } from "./link-click"

/**
 * Single shape for an AppShell menu entry.
 *
 * - `items` (children) turns the entry into an expandable group: clicking
 *   toggles a submenu of links indented below it. Only one nesting level is
 *   supported by design.
 * - `href` makes it a navigation anchor; `onClick` makes it a button-style
 *   item. Mutually exclusive in practice.
 * - `badge` renders as a chip on the right when expanded; hidden in the
 *   collapsed (icon-only) state.
 */
export interface AppShellItem {
  /** Stable identity (React key + `isActive` lookups). */
  id: string
  label: string
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  /**
   * Navigation URL. Values that don't resolve to an `http:`/`https:`/
   * `mailto:`/`tel:` URL (e.g. `javascript:` or `vbscript:`) are dropped —
   * the item then renders as a non-anchor button. `onClick` still fires
   * if provided.
   */
  href?: string
  /**
   * Runs on activation and receives the click event: on a link,
   * `event.preventDefault()` stops the navigation. Not called for a click the
   * browser handles by itself (Ctrl/⌘, Shift, Alt or the middle button open
   * the link elsewhere and the current page stays as it is).
   */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
  badge?: React.ReactNode
  disabled?: boolean
  /** Nested children — turns the item into an expandable group. */
  items?: AppShellItem[]
  /** Expand the submenu on mount when this item has children. */
  defaultOpen?: boolean
}

export interface AppShellNavItemProps {
  item: AppShellItem
  collapsed: boolean
  isActive?: (item: AppShellItem) => boolean
  depth?: number
  /** 44px rows for touch (mobile menu). */
  touch?: boolean
  /** Called after a leaf item (link or action) is activated. Groups don't call it. */
  onNavigate?: () => void
  /** The app's router link, for items with `href`. */
  renderLink?: RenderLink
}

// Memoized so a parent re-render with stable props skips the whole subtree —
// the cn() composition and the recursive children would otherwise rebuild on
// every render of the consumer's layout.
export const AppShellNavItem = React.memo(function AppShellNavItem({
  item,
  collapsed,
  isActive,
  depth = 0,
  touch = false,
  onNavigate,
  renderLink,
}: AppShellNavItemProps) {
  const active = isActive?.(item) ?? false
  const Icon = item.icon
  const hasChildren = !!item.items?.length
  const [expanded, setExpanded] = React.useState<boolean>(item.defaultOpen ?? false)
  const showSubmenu = hasChildren && !collapsed && expanded

  const baseClass = cn(
    "flex w-full cursor-pointer items-center gap-3 rounded-element px-3 py-2 text-left text-sm font-medium transition-colors",
    "state-layer",
    "focus-visible:focus-outline",
    touch && "min-h-11",
    // Inactive items recede to the supporting text colour; the active one
    // takes the accent, a heavier weight and a marker in the functional blue.
    active
      ? "relative bg-accent font-semibold text-accent-foreground before:absolute before:left-0 before:top-1/2 before:h-4 before:w-[3px] before:-translate-y-1/2 before:rounded-inner before:bg-link"
      : "text-muted-foreground hover:text-foreground",
    collapsed && "justify-center",
    item.disabled && "pointer-events-none opacity-50",
    depth > 0 && "pl-9",
  )

  const inner = (
    <>
      {Icon ? <Icon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden /> : null}
      {!collapsed ? <span className="flex-1 truncate">{item.label}</span> : null}
      {!collapsed && item.badge ? <span data-slot="app-shell-item-badge">{item.badge}</span> : null}
      {!collapsed && hasChildren ? (
        <ChevronDown
          aria-hidden
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            expanded ? "rotate-0" : "-rotate-90",
          )}
        />
      ) : null}
    </>
  )

  const hrefIsSafe = item.href != null && isAllowedUrl(item.href, DEFAULT_ALLOWED_LINK_PROTOCOLS)
  if (
    process.env.NODE_ENV !== "production" &&
    item.href != null &&
    item.href !== "" &&
    !hrefIsSafe
  ) {
    console.warn(
      `[AppShell] href "${item.href}" was blocked because its protocol is not on the allowlist. Rendering the item as a button.`,
    )
  }

  // In the collapsed rail the label is not rendered, so the control needs an
  // explicit accessible name (the tooltip is only a visual hint).
  const collapsedLabel = collapsed ? item.label : undefined
  // The current page, whatever element the item is (link, action or group).
  const ariaCurrent = active ? ("page" as const) : undefined

  let trigger: React.ReactNode
  if (hasChildren) {
    trigger = (
      <button
        type="button"
        data-slot="app-shell-item"
        data-active={active ? "true" : undefined}
        data-state={expanded ? "open" : "closed"}
        disabled={item.disabled}
        aria-label={collapsedLabel}
        aria-current={ariaCurrent}
        aria-expanded={expanded}
        className={baseClass}
        onClick={(event) => {
          setExpanded((v) => !v)
          item.onClick?.(event)
        }}
      >
        {inner}
      </button>
    )
  } else if (hrefIsSafe && item.disabled) {
    // Nowhere to go: a link with no href, still announced as a link. Never
    // through `renderLink`: a router link needs an href.
    trigger = (
      <a
        data-slot="app-shell-item"
        data-active={active ? "true" : undefined}
        // biome-ignore lint/a11y/useSemanticElements: without an href an <a> has no role of its own.
        role="link"
        aria-label={collapsedLabel}
        aria-disabled="true"
        aria-current={ariaCurrent}
        tabIndex={-1}
        className={baseClass}
        // biome-ignore lint/a11y/useValidAnchor: a disabled link has no href; the click only stops here.
        onClick={(event) => event.preventDefault()}
      >
        {inner}
      </a>
    )
  } else if (hrefIsSafe) {
    const linkProps: RenderLinkProps & { "data-slot": string; "data-active"?: string } = {
      href: item.href as string,
      "data-slot": "app-shell-item",
      "data-active": active ? "true" : undefined,
      "aria-label": collapsedLabel,
      "aria-current": ariaCurrent,
      className: baseClass,
      onClick: (event) => {
        // Opening the link elsewhere leaves this page (and the menu) alone.
        if (isModifiedClick(event)) return
        item.onClick?.(event)
        onNavigate?.()
      },
      children: inner,
    }
    trigger = renderLinkElement(renderLink, linkProps)
  } else {
    trigger = (
      <button
        type="button"
        data-slot="app-shell-item"
        data-active={active ? "true" : undefined}
        disabled={item.disabled}
        aria-label={collapsedLabel}
        aria-current={ariaCurrent}
        className={baseClass}
        onClick={(event) => {
          item.onClick?.(event)
          onNavigate?.()
        }}
      >
        {inner}
      </button>
    )
  }

  // In the collapsed rail, top-level items show their label via tooltip on
  // hover (children stay hidden until the rail is expanded).
  if (collapsed && depth === 0) {
    return (
      <Tooltip content={item.label} side="right">
        <div>{trigger}</div>
      </Tooltip>
    )
  }

  return (
    <>
      {trigger}
      {showSubmenu && item.items ? (
        <div className="mt-1 space-y-1">
          {item.items.map((child) => (
            <AppShellNavItem
              key={child.id}
              item={child}
              collapsed={collapsed}
              isActive={isActive}
              depth={depth + 1}
              touch={touch}
              onNavigate={onNavigate}
              renderLink={renderLink}
            />
          ))}
        </div>
      ) : null}
    </>
  )
})
