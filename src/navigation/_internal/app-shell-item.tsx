"use client"

import { ChevronDown } from "lucide-react"
import * as React from "react"

import { DEFAULT_ALLOWED_LINK_PROTOCOLS, isAllowedUrl } from "@/lib/url"
import { cn } from "@/lib/utils"
import { Tooltip } from "../../overlays/tooltip"

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
  onClick?: () => void
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
}: AppShellNavItemProps) {
  const active = isActive?.(item) ?? false
  const Icon = item.icon
  const hasChildren = !!item.items?.length
  const [expanded, setExpanded] = React.useState<boolean>(item.defaultOpen ?? false)
  const showSubmenu = hasChildren && !collapsed && expanded

  const baseClass = cn(
    "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
    "state-layer",
    "focus-visible:focus-outline",
    touch && "min-h-11",
    active && "bg-accent text-accent-foreground",
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
        aria-expanded={expanded}
        className={baseClass}
        onClick={() => {
          setExpanded((v) => !v)
          item.onClick?.()
        }}
      >
        {inner}
      </button>
    )
  } else if (hrefIsSafe) {
    trigger = (
      <a
        href={item.disabled ? undefined : item.href}
        data-slot="app-shell-item"
        data-active={active ? "true" : undefined}
        aria-label={collapsedLabel}
        aria-disabled={item.disabled ? "true" : undefined}
        aria-current={active ? "page" : undefined}
        tabIndex={item.disabled ? -1 : undefined}
        className={baseClass}
        onClick={(e) => {
          if (item.disabled) {
            e.preventDefault()
            return
          }
          item.onClick?.()
          onNavigate?.()
        }}
      >
        {inner}
      </a>
    )
  } else {
    trigger = (
      <button
        type="button"
        data-slot="app-shell-item"
        data-active={active ? "true" : undefined}
        disabled={item.disabled}
        aria-label={collapsedLabel}
        className={baseClass}
        onClick={() => {
          item.onClick?.()
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
            />
          ))}
        </div>
      ) : null}
    </>
  )
})
