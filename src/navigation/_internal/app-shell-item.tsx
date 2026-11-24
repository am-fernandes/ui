"use client"

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { ChevronDown } from "lucide-react"
import * as React from "react"

import { type RenderLink, type RenderLinkProps, renderLinkElement } from "@/lib/render-link"
import { DEFAULT_ALLOWED_LINK_PROTOCOLS, isAllowedUrl } from "@/lib/url"
import { cn } from "@/lib/utils"
import { motionMenu } from "../../overlays/_internal/animations"
import { useOverlayContainer } from "../../overlays/_internal/overlay-container"
import { Tooltip } from "../../overlays/tooltip"
import { isModifiedClick } from "./link-click"

function isSafeHref(href: string | undefined): href is string {
  return href != null && isAllowedUrl(href, DEFAULT_ALLOWED_LINK_PROTOCOLS)
}

const flyoutContentClass = cn(
  "z-(--z-popover) min-w-48 overflow-y-auto overflow-x-hidden",
  "max-h-(--radix-dropdown-menu-content-available-height) rounded-container border border-border-strong bg-popover p-1 text-popover-foreground outline-none",
  motionMenu,
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
  "origin-(--radix-dropdown-menu-content-transform-origin)",
)

const flyoutRowClass = cn(
  "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-element px-2 py-1.5 text-left text-sm outline-none transition-colors",
  "focus:state-hover",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
)

interface FlyoutProps {
  item: AppShellItem
  isActive?: (item: AppShellItem) => boolean
  renderLink?: RenderLink
}

/** One row of the rail flyout: a link, an action, or a labelled set of rows. */
function FlyoutEntry({ item, isActive, renderLink }: FlyoutProps) {
  if (item.items?.length) {
    return (
      <DropdownMenuPrimitive.Group>
        <DropdownMenuPrimitive.Label className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          {item.label}
        </DropdownMenuPrimitive.Label>
        {item.items.map((child) => (
          <FlyoutEntry key={child.id} item={child} isActive={isActive} renderLink={renderLink} />
        ))}
      </DropdownMenuPrimitive.Group>
    )
  }
  const active = isActive?.(item) ?? false
  const className = cn(flyoutRowClass, active && "bg-accent font-semibold text-accent-foreground")
  const Icon = item.icon
  const content = (
    <>
      {Icon ? <Icon className="size-4 shrink-0" aria-hidden /> : null}
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
    </>
  )

  if (isSafeHref(item.href) && !item.disabled) {
    const linkProps: RenderLinkProps & { "data-slot": string } = {
      href: item.href,
      "data-slot": "app-shell-flyout-item",
      "aria-current": active ? "page" : undefined,
      className,
      onClick: (event) => {
        if (isModifiedClick(event)) return
        item.onClick?.(event)
      },
      children: content,
    }
    return (
      <DropdownMenuPrimitive.Item asChild>
        {renderLinkElement(renderLink, linkProps)}
      </DropdownMenuPrimitive.Item>
    )
  }
  return (
    <DropdownMenuPrimitive.Item asChild disabled={item.disabled}>
      <button
        type="button"
        data-slot="app-shell-flyout-item"
        aria-current={active ? "page" : undefined}
        className={className}
        onClick={(event) => item.onClick?.(event)}
      >
        {content}
      </button>
    </DropdownMenuPrimitive.Item>
  )
}

/**
 * A group in the collapsed rail: its children have no room there, so the
 * group opens a menu next to the rail (Enter, Space or a click; Escape
 * closes it and gives focus back to the group).
 */
function RailGroup({
  item,
  isActive,
  renderLink,
  trigger,
}: FlyoutProps & { trigger: React.ReactElement }) {
  // Same container as the rest of the overlays (the modal it sits in, if any).
  const container = useOverlayContainer()
  return (
    <DropdownMenuPrimitive.Root modal={false}>
      <Tooltip content={item.label} side="right">
        <DropdownMenuPrimitive.Trigger asChild disabled={item.disabled}>
          {trigger}
        </DropdownMenuPrimitive.Trigger>
      </Tooltip>
      {container === null ? null : (
        <DropdownMenuPrimitive.Portal container={container}>
          <DropdownMenuPrimitive.Content
            data-slot="app-shell-flyout"
            side="right"
            align="start"
            // The trigger sits 12px inside the 64px rail: start just past its edge.
            sideOffset={16}
            collisionPadding={8}
            loop
            className={flyoutContentClass}
          >
            <DropdownMenuPrimitive.Label className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              {item.label}
            </DropdownMenuPrimitive.Label>
            {item.items?.map((child) => (
              <FlyoutEntry
                key={child.id}
                item={child}
                isActive={isActive}
                renderLink={renderLink}
              />
            ))}
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      )}
    </DropdownMenuPrimitive.Root>
  )
}

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
  /**
   * Expand the submenu on mount when this item has children. A group also
   * opens by itself when one of its children is the current page (`isActive`).
   */
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
  /**
   * Groups the user opened or closed, by id. Kept by the shell, so the
   * desktop menu and the mobile menu (which remounts on every opening) agree.
   */
  openGroups?: Readonly<Record<string, boolean>>
  onOpenGroupChange?: (id: string, open: boolean) => void
}

/** `true` when an item below this one is the current page. */
export function hasActiveDescendant(
  item: AppShellItem,
  isActive: ((item: AppShellItem) => boolean) | undefined,
): boolean {
  if (!isActive || !item.items) return false
  return item.items.some((child) => isActive(child) || hasActiveDescendant(child, isActive))
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
  openGroups,
  onOpenGroupChange,
}: AppShellNavItemProps) {
  const Icon = item.icon
  const hasChildren = !!item.items?.length
  const containsActive = hasChildren && hasActiveDescendant(item, isActive)
  // A group opens by itself on the current page's branch; what the user
  // chose (open or closed) wins from then on.
  const expanded = openGroups?.[item.id] ?? (item.defaultOpen === true || containsActive)
  const setExpanded = (next: boolean) => onOpenGroupChange?.(item.id, next)
  const showSubmenu = hasChildren && !collapsed && expanded
  // The current page is out of sight (rail, or a closed group): the group
  // stands for it, as the current item of its set.
  const standsForActive = containsActive && (collapsed || !expanded)
  const active = (isActive?.(item) ?? false) || standsForActive

  const baseClass = cn(
    "flex w-full cursor-pointer items-center gap-3 rounded-element px-3 py-2 text-left text-sm font-medium transition-colors",
    "state-layer",
    "focus-visible:focus-outline",
    touch && "min-h-11",
    // Inactive items recede to the supporting text colour; the active one
    // takes the accent, a heavier weight and a marker in the functional blue.
    // An open group of the current page keeps the text colour.
    active
      ? "relative bg-accent font-semibold text-accent-foreground before:absolute before:left-0 before:top-1/2 before:h-4 before:w-[3px] before:-translate-y-1/2 before:rounded-inner before:bg-link"
      : containsActive
        ? "font-semibold text-foreground"
        : "text-muted-foreground hover:text-foreground",
    collapsed && "justify-center",
    item.disabled && "pointer-events-none opacity-50",
    depth > 0 && "pl-9",
  )

  // In the 64px rail only a mark is shown: the icon, or the label's initial
  // when there is none, with a dot when there is a badge. The label and the
  // badge stay in the DOM, visually hidden, so the item is still named (and
  // its count still read) by assistive technology.
  let mark: React.ReactNode = Icon ? (
    <Icon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
  ) : null
  if (collapsed && !Icon) {
    mark = (
      <span
        data-slot="app-shell-item-initial"
        aria-hidden="true"
        className="flex size-4 shrink-0 items-center justify-center text-xs font-semibold"
      >
        {item.label.trim().charAt(0).toLocaleUpperCase("pt-BR")}
      </span>
    )
  }
  if (collapsed && item.badge) {
    mark = (
      <span className="relative flex shrink-0">
        {mark}
        <span
          data-slot="app-shell-item-dot"
          aria-hidden="true"
          className="absolute -right-1 -top-1 size-2 rounded-full bg-destructive ring-2 ring-sidebar forced-colors:bg-[CanvasText]"
        />
      </span>
    )
  }

  const inner = (
    <>
      {mark}
      <span className={collapsed ? "sr-only" : "flex-1 truncate"}>{item.label}</span>
      {item.badge ? (
        <>
          <span className="sr-only">, </span>
          <span data-slot="app-shell-item-badge" className={collapsed ? "sr-only" : undefined}>
            {item.badge}
          </span>
        </>
      ) : null}
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

  const hrefIsSafe = isSafeHref(item.href)
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

  // The current page, whatever element the item is (link, action or group).
  const ariaCurrent = isActive?.(item)
    ? ("page" as const)
    : standsForActive
      ? ("true" as const)
      : undefined

  if (hasChildren && collapsed && depth === 0) {
    return (
      <RailGroup
        item={item}
        isActive={isActive}
        renderLink={renderLink}
        trigger={
          <button
            type="button"
            data-slot="app-shell-item"
            data-active={active ? "true" : undefined}
            disabled={item.disabled}
            aria-current={ariaCurrent}
            className={baseClass}
            onClick={(event) => item.onClick?.(event)}
          >
            {inner}
          </button>
        }
      />
    )
  }

  let trigger: React.ReactNode
  if (hasChildren) {
    trigger = (
      <button
        type="button"
        data-slot="app-shell-item"
        data-active={active ? "true" : undefined}
        data-state={expanded ? "open" : "closed"}
        disabled={item.disabled}
        aria-current={ariaCurrent}
        aria-expanded={expanded}
        className={baseClass}
        onClick={(event) => {
          setExpanded(!expanded)
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
              openGroups={openGroups}
              onOpenGroupChange={onOpenGroupChange}
            />
          ))}
        </div>
      ) : null}
    </>
  )
})
