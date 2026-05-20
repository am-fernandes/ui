"use client"

import { ChevronDown } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { useIsMobile } from "../hooks/use-is-mobile"
import { Sheet } from "../overlays/sheet"

export interface SidebarItem {
  id?: string
  label: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  href?: string
  onClick?: () => void
  badge?: React.ReactNode
  disabled?: boolean
  items?: SidebarItem[]
  tooltip?: React.ReactNode
  /**
   * When the item has children (`items`), controls the initial submenu state.
   * `true` opens the submenu at mount; `false` (default) keeps it collapsed.
   * Ignored when the item has no children.
   */
  defaultOpen?: boolean
}

export interface SidebarGroup {
  label?: React.ReactNode
  items: SidebarItem[]
}

export interface SidebarProps {
  items?: SidebarItem[]
  groups?: SidebarGroup[]
  header?: React.ReactNode
  footer?: React.ReactNode
  collapsible?: "offcanvas" | "icon" | "none"
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  persistOpenState?: boolean
  keyboardShortcut?: string | null
  isActive?: (item: SidebarItem) => boolean
  className?: string
}

const SIDEBAR_COOKIE_NAME = "amf-ui:sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_ICON = "3rem"

function getCookieValue(): boolean | undefined {
  if (typeof document === "undefined") return undefined
  const match = document.cookie.match(new RegExp(`(^|; )${SIDEBAR_COOKIE_NAME}=([^;]+)`))
  if (!match) return undefined
  return match[2] === "true"
}

function Sidebar({
  items,
  groups,
  header,
  footer,
  collapsible = "icon",
  defaultOpen = true,
  open,
  onOpenChange,
  persistOpenState = false,
  keyboardShortcut = "b",
  isActive,
  className,
}: SidebarProps) {
  const isMobile = useIsMobile()
  const isControlled = open !== undefined
  const [internalOpen, setInternalOpen] = React.useState<boolean>(() => {
    if (persistOpenState) {
      const persisted = getCookieValue()
      if (persisted !== undefined) return persisted
    }
    return defaultOpen
  })
  const isOpen = isControlled ? open : internalOpen

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next)
      onOpenChange?.(next)
      if (persistOpenState && !isControlled && typeof document !== "undefined") {
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}; SameSite=Lax; Secure`
      }
    },
    [isControlled, onOpenChange, persistOpenState],
  )

  React.useEffect(() => {
    if (!keyboardShortcut) return
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isEditable =
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      if (isEditable) return
      if ((event.metaKey || event.ctrlKey) && event.key === keyboardShortcut) {
        event.preventDefault()
        setOpen(!isOpen)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [keyboardShortcut, isOpen, setOpen])

  const resolvedGroups: SidebarGroup[] = React.useMemo(() => {
    if (groups) return groups
    if (items) return [{ items }]
    return []
  }, [groups, items])

  if (isMobile && collapsible !== "none") {
    return (
      <Sheet
        open={isOpen}
        onOpenChange={setOpen}
        title="Sidebar"
        description="Menu principal"
        side="left"
        className="w-[--sidebar-width] p-0"
      >
        <div
          data-slot="sidebar"
          data-mobile="true"
          style={{ "--sidebar-width": SIDEBAR_WIDTH } as React.CSSProperties}
          className={cn("flex h-full flex-col", className)}
        >
          {header ? <div data-slot="sidebar-header">{header}</div> : null}
          <div data-slot="sidebar-body" className="flex-1 overflow-auto">
            {resolvedGroups.map((g, gi) => (
              <SidebarGroupRender
                // biome-ignore lint/suspicious/noArrayIndexKey: groups are positional
                key={gi}
                group={g}
                isActive={isActive}
                collapsedToIcon={false}
              />
            ))}
          </div>
          {footer ? <div data-slot="sidebar-footer">{footer}</div> : null}
        </div>
      </Sheet>
    )
  }

  const collapsedToIcon = collapsible === "icon" && !isOpen

  return (
    <aside
      data-slot="sidebar"
      data-collapsible={collapsible}
      data-state={isOpen ? "expanded" : "collapsed"}
      style={
        {
          "--sidebar-width": SIDEBAR_WIDTH,
          "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
          width: collapsedToIcon ? SIDEBAR_WIDTH_ICON : SIDEBAR_WIDTH,
        } as React.CSSProperties
      }
      className={cn(
        "flex h-full flex-col border-r bg-background transition-[width] duration-200",
        className,
      )}
    >
      {header ? <div data-slot="sidebar-header">{header}</div> : null}
      <div data-slot="sidebar-body" className="flex-1 overflow-auto">
        {resolvedGroups.map((g, gi) => (
          <SidebarGroupRender
            // biome-ignore lint/suspicious/noArrayIndexKey: groups are positional
            key={gi}
            group={g}
            isActive={isActive}
            collapsedToIcon={collapsedToIcon}
          />
        ))}
      </div>
      {footer ? <div data-slot="sidebar-footer">{footer}</div> : null}
    </aside>
  )
}

function SidebarGroupRender({
  group,
  isActive,
  collapsedToIcon,
}: {
  group: SidebarGroup
  isActive?: SidebarProps["isActive"]
  collapsedToIcon: boolean
}) {
  return (
    <div data-slot="sidebar-group" className="px-2 py-1.5">
      {group.label && !collapsedToIcon ? (
        <div
          data-slot="sidebar-group-label"
          className="px-2 py-1.5 text-xs font-medium text-muted-foreground"
        >
          {group.label}
        </div>
      ) : null}
      <ul data-slot="sidebar-menu" className="flex flex-col gap-0.5">
        {group.items.map((item, ii) => (
          <SidebarItemRender
            key={item.id ?? `${ii}-${typeof item.label === "string" ? item.label : ""}`}
            item={item}
            isActive={isActive}
            collapsedToIcon={collapsedToIcon}
            depth={0}
          />
        ))}
      </ul>
    </div>
  )
}

function SidebarItemRender({
  item,
  isActive,
  collapsedToIcon,
  depth,
}: {
  item: SidebarItem
  isActive?: SidebarProps["isActive"]
  collapsedToIcon: boolean
  depth: number
}) {
  const active = isActive?.(item) ?? false
  const Icon = item.icon
  const hasChildren = !!item.items?.length
  const submenuId = React.useId()
  const [expanded, setExpanded] = React.useState<boolean>(item.defaultOpen ?? false)

  const showSubmenu = hasChildren && !collapsedToIcon && expanded

  const labelAndBadge = (
    <>
      {Icon ? <Icon className="size-4 shrink-0" /> : null}
      {!collapsedToIcon ? <span className="flex-1 truncate">{item.label}</span> : null}
      {!collapsedToIcon && item.badge ? (
        <span data-slot="sidebar-item-badge">{item.badge}</span>
      ) : null}
    </>
  )

  const baseClass = cn(
    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors cursor-pointer",
    "hover:bg-accent hover:text-accent-foreground",
    "disabled:pointer-events-none disabled:opacity-50",
    active && "bg-accent text-accent-foreground",
    depth > 0 && "pl-7",
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
        aria-controls={submenuId}
        onClick={() => {
          setExpanded((v) => !v)
          item.onClick?.()
        }}
      >
        {labelAndBadge}
        {!collapsedToIcon ? (
          <ChevronDown
            aria-hidden
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              expanded ? "rotate-0" : "-rotate-90",
            )}
          />
        ) : null}
      </button>
    )
  } else if (item.href) {
    const disabled = !!item.disabled
    trigger = (
      <a
        href={disabled ? undefined : item.href}
        data-active={active ? "true" : undefined}
        aria-disabled={disabled ? "true" : undefined}
        aria-current={active ? "page" : undefined}
        tabIndex={disabled ? -1 : undefined}
        className={cn(baseClass, disabled && "pointer-events-none opacity-50")}
        onClick={(e) => {
          if (disabled) {
            e.preventDefault()
            return
          }
          item.onClick?.()
        }}
      >
        {labelAndBadge}
      </a>
    )
  } else {
    trigger = (
      <button
        type="button"
        data-active={active ? "true" : undefined}
        aria-current={active ? "true" : undefined}
        disabled={item.disabled}
        className={baseClass}
        onClick={item.onClick}
      >
        {labelAndBadge}
      </button>
    )
  }

  return (
    <li data-slot="sidebar-item">
      {trigger}
      {showSubmenu ? (
        <ul
          id={submenuId}
          data-slot="sidebar-submenu"
          data-state="open"
          className="mt-0.5 flex flex-col gap-0.5"
        >
          {item.items?.map((child, ci) => (
            <SidebarItemRender
              key={child.id ?? `${ci}-${typeof child.label === "string" ? child.label : ""}`}
              item={child}
              isActive={isActive}
              collapsedToIcon={collapsedToIcon}
              depth={depth + 1}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

Sidebar.displayName = "Sidebar"

export { Sidebar }
