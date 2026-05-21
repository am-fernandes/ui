"use client"

import { ChevronDown, LogOut, UserCog } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { AlertDialog } from "../overlays/alert-dialog"
import { Tooltip } from "../overlays/tooltip"
import { Avatar } from "../primitives/avatar"
import { Button } from "../primitives/button"

/**
 * Single shape for a sidebar entry.
 *
 * - `items` (children) turns the entry into an expandable group: clicking
 *   toggles a submenu of links indented below it. Only one nesting level is
 *   supported by design.
 * - `href` makes it a navigation anchor; `onClick` makes it a button-style
 *   item. Mutually exclusive in practice.
 * - `badge` renders as a chip on the right when expanded; hidden in the
 *   collapsed (icon-only) state.
 */
export interface SidebarItem {
  /** Stable identity (React key + `isActive` lookups). */
  id: string
  label: string
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  href?: string
  onClick?: () => void
  badge?: React.ReactNode
  disabled?: boolean
  /** Nested children — turns the item into an expandable group. */
  items?: SidebarItem[]
  /** Expand the submenu on mount when this item has children. */
  defaultOpen?: boolean
}

export interface SidebarUser {
  name: string
  /** Optional avatar image. Falls back to `initials`. */
  avatarUrl?: string
  /** Initials shown when there's no avatar image. Defaults to first letter of `name`. */
  initials?: string
}

export interface SidebarProps {
  /**
   * Rendered inside the brand button at the top of the sidebar. Clicking the
   * button toggles collapsed (icon-only) and expanded states. Typical
   * content: a logo `<img>` or a small monogram `<div>`.
   */
  brand: React.ReactNode
  /**
   * Optional wordmark shown next to the brand logo when the sidebar is
   * expanded. Hidden in the collapsed (icon-rail) state. Use for the
   * product name (e.g. "Dash"); leave empty for logo-only.
   */
  brandText?: React.ReactNode
  /** Accessible label fragment for the brand toggle button. Defaults to "menu". */
  brandLabel?: string
  user: SidebarUser
  items: SidebarItem[]
  /** Called when the user clicks the avatar or the "Editar perfil" icon. */
  onProfileClick: () => void
  /**
   * Called when the user confirms the sign-out action. By default the
   * sidebar shows an `AlertDialog` asking "Tem certeza que deseja sair?"
   * and only calls this when the user accepts; pass
   * `disableSignOutConfirm` to skip the dialog and fire on first click.
   */
  onSignOut: () => void
  /** Skip the confirmation dialog before calling `onSignOut`. */
  disableSignOutConfirm?: boolean
  /** Mark the matching item as active (background + foreground accent token). */
  isActive?: (item: SidebarItem) => boolean
  /**
   * Initial collapsed state when no localStorage value is present.
   * Default `true` (collapsed to icon rail).
   */
  defaultCollapsed?: boolean
}

const STORAGE_KEY = "amf-ui:sidebar:collapsed"

function Sidebar({
  brand,
  brandText,
  brandLabel = "menu",
  user,
  items,
  onProfileClick,
  onSignOut,
  disableSignOutConfirm,
  isActive,
  defaultCollapsed = true,
}: SidebarProps) {
  const [signOutOpen, setSignOutOpen] = React.useState(false)
  const handleSignOutClick = () => {
    if (disableSignOutConfirm) {
      onSignOut()
    } else {
      setSignOutOpen(true)
    }
  }
  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return defaultCollapsed
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored != null) return stored === "true"
    return defaultCollapsed
  })

  React.useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(STORAGE_KEY, String(collapsed))
  }, [collapsed])

  const initials = user.initials ?? user.name.slice(0, 1).toUpperCase()

  return (
    <aside
      data-slot="sidebar"
      data-state={collapsed ? "collapsed" : "expanded"}
      className={cn(
        // `overflow-hidden` keeps the in-flight content (item labels growing
        // from 0 → full width) from bumping into the rail's right edge and
        // briefly exposing a horizontal scrollbar while the width animates.
        "shrink-0 overflow-hidden border-r bg-sidebar flex flex-col transition-[width] duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Brand + collapse toggle. `justify-start` is constant across both
          states so the 32px brand square never shifts horizontally during
          the width animation — only the aside grows around it. */}
      <div className="border-b px-3 py-4 flex items-center gap-2 justify-start">
        <Tooltip
          content={collapsed ? `Expandir ${brandLabel}` : `Recolher ${brandLabel}`}
          side="right"
        >
          <button
            type="button"
            className="h-8 w-8 shrink-0 rounded overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? `Expandir ${brandLabel}` : `Recolher ${brandLabel}`}
          >
            {brand}
          </button>
        </Tooltip>
        {!collapsed && brandText ? (
          <span className="truncate text-2xl font-semibold leading-8">{brandText}</span>
        ) : null}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {items.map((item) => (
          <SidebarItemRender key={item.id} item={item} collapsed={collapsed} isActive={isActive} />
        ))}
      </nav>

      {/* User row */}
      <div className="border-t px-3 py-3">
        <div className={cn("flex items-center gap-2", collapsed && "flex-col")}>
          <Tooltip content="Editar perfil" side={collapsed ? "right" : "top"}>
            <button
              type="button"
              className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={onProfileClick}
              aria-label="Editar perfil"
            >
              <Avatar
                src={user.avatarUrl}
                alt={user.name}
                fallback={initials}
                className="size-8 text-xs"
              />
            </button>
          </Tooltip>
          {!collapsed ? (
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium truncate block">{user.name}</span>
            </div>
          ) : null}
          <div className={cn("flex", collapsed ? "flex-col gap-1" : "flex-row")}>
            {!collapsed ? (
              <Tooltip content="Editar perfil" side="top">
                <Button
                  variant="ghost"
                  className="size-8 shrink-0 p-0"
                  onClick={onProfileClick}
                  aria-label="Editar perfil"
                >
                  <UserCog className="h-4 w-4" />
                </Button>
              </Tooltip>
            ) : null}
            <Tooltip content="Sair" side={collapsed ? "right" : "top"}>
              <Button
                variant="ghost"
                className="size-8 shrink-0 p-0"
                onClick={handleSignOutClick}
                aria-label="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      {disableSignOutConfirm ? null : (
        <AlertDialog
          open={signOutOpen}
          onOpenChange={setSignOutOpen}
          title="Sair da conta"
          description="Tem certeza que deseja sair? Você precisará fazer login novamente para acessar o sistema."
          confirmLabel="Sair"
          cancelLabel="Cancelar"
          onConfirm={onSignOut}
        />
      )}
    </aside>
  )
}

function SidebarItemRender({
  item,
  collapsed,
  isActive,
  depth = 0,
}: {
  item: SidebarItem
  collapsed: boolean
  isActive?: (item: SidebarItem) => boolean
  depth?: number
}) {
  const active = isActive?.(item) ?? false
  const Icon = item.icon
  const hasChildren = !!item.items?.length
  const [expanded, setExpanded] = React.useState<boolean>(item.defaultOpen ?? false)
  const showSubmenu = hasChildren && !collapsed && expanded

  const baseClass = cn(
    "flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors w-full cursor-pointer",
    "hover:bg-accent hover:text-accent-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    active && "bg-accent text-accent-foreground",
    collapsed && "justify-center",
    item.disabled && "pointer-events-none opacity-50",
    depth > 0 && "pl-9",
  )

  const inner = (
    <>
      {Icon ? <Icon className="h-4 w-4 shrink-0" strokeWidth={2} /> : null}
      {!collapsed ? <span className="flex-1 truncate">{item.label}</span> : null}
      {!collapsed && item.badge ? <span data-slot="sidebar-item-badge">{item.badge}</span> : null}
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

  let trigger: React.ReactNode
  if (hasChildren) {
    trigger = (
      <button
        type="button"
        data-active={active ? "true" : undefined}
        data-state={expanded ? "open" : "closed"}
        disabled={item.disabled}
        className={baseClass}
        aria-expanded={expanded}
        onClick={() => {
          setExpanded((v) => !v)
          item.onClick?.()
        }}
      >
        {inner}
      </button>
    )
  } else if (item.href) {
    trigger = (
      <a
        href={item.disabled ? undefined : item.href}
        data-active={active ? "true" : undefined}
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
        }}
      >
        {inner}
      </a>
    )
  } else {
    trigger = (
      <button
        type="button"
        data-active={active ? "true" : undefined}
        disabled={item.disabled}
        className={baseClass}
        onClick={item.onClick}
      >
        {inner}
      </button>
    )
  }

  // In the collapsed rail, top-level items show their label via tooltip
  // on hover (children are inaccessible until the rail is expanded).
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
            <SidebarItemRender
              key={child.id}
              item={child}
              collapsed={collapsed}
              isActive={isActive}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </>
  )
}

Sidebar.displayName = "Sidebar"

export { Sidebar }
