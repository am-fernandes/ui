"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Menu, PanelLeftClose, PanelLeftOpen, XIcon } from "lucide-react"
import * as React from "react"

import { useIsMobile } from "@/hooks/use-is-mobile"
import type { RenderLink } from "@/lib/render-link"
import { cn } from "@/lib/utils"
import { motionSheet, overlayBase } from "../overlays/_internal/animations"
import { Tooltip } from "../overlays/tooltip"
import { type AppShellItem, AppShellNavItem } from "./_internal/app-shell-item"
import { useStoredBoolean, writeStoredBoolean } from "./_internal/stored-boolean"

export type { AppShellItem }

/**
 * @deprecated Use `AppShellItem`. Kept as an alias so `type SidebarItem`
 * imports keep compiling while apps migrate from `<Sidebar>` to `<AppShell>`.
 */
export type SidebarItem = AppShellItem

export interface AppShellLabels {
  /** Skip link that jumps to the page content. */
  skipToContent: string
  /** Accessible name of the `<nav>` that holds the items. */
  navigation: string
  /** Accessible title of the mobile menu dialog. */
  menu: string
  /** Mobile button that opens the menu. */
  openMenu: string
  /** Button that closes the mobile menu. */
  closeMenu: string
  /** Desktop button that collapses the menu to the icon rail. */
  collapse: string
  /** Desktop button that expands the icon rail back to the full menu. */
  expand: string
  /** Accessible name and tooltip of the brand when `onBrandClick` is set. */
  brandAction: string
}

export const defaultAppShellLabels: AppShellLabels = {
  skipToContent: "Pular para o conteúdo",
  navigation: "Navegação principal",
  menu: "Menu",
  openMenu: "Abrir menu",
  closeMenu: "Fechar menu",
  collapse: "Recolher menu",
  expand: "Expandir menu",
  brandAction: "Voltar",
}

export interface AppShellProps {
  /** Menu entries. The only required prop. */
  items: AppShellItem[]
  /** Mark the matching item as active (background accent + `aria-current="page"`). */
  isActive?: (item: AppShellItem) => boolean
  /**
   * Renders the items that have `href` with your router's `<Link>`, so a
   * click navigates without reloading the page:
   * `renderLink={({ href, ...props }) => <Link to={href} {...props} />}`.
   * Pass every prop on: they carry the classes, `aria-current` and the click
   * handler that closes the mobile menu.
   */
  renderLink?: RenderLink
  /**
   * Logo shown in the menu header (32px box) and in the mobile bar (28px box).
   * When `brandText` is present, give images an empty `alt` so the name is
   * not read twice.
   */
  brand?: React.ReactNode
  /** Product name shown next to `brand` while the menu is expanded. */
  brandText?: React.ReactNode
  /**
   * Turns `brand` into a button that calls this callback (e.g. "back to the
   * list" on a detail page). Without it the brand is not interactive.
   */
  onBrandClick?: () => void
  /**
   * Fixed bar above the content. It has the same 64px height as the menu
   * header, so the bottom borders line up. Its content is laid out in a flex
   * row — use `ml-auto` to push items to the right. Below 768px it moves into
   * the mobile bar, to the right of the brand.
   */
  navbar?: React.ReactNode
  /**
   * Free area at the bottom of the menu (account menu, sign-out, version…).
   * The shell renders nothing there by itself. Read `useAppShell().collapsed`
   * to adapt the content to the 64px icon rail.
   */
  footer?: React.ReactNode
  /**
   * Standard content padding: 24px on desktop and 16px below 768px. Pass
   * `false` for edge-to-edge screens (maps, boards, full-bleed tables).
   * @default true
   */
  contentPadding?: boolean
  /**
   * The desktop menu is the 64px icon rail (controlled). Pair it with
   * `onCollapsedChange`; you then own the persistence (per user, in your
   * backend…) and `storageKey` is not used.
   */
  collapsed?: boolean
  /** Called when the menu is collapsed or expanded (button or `useAppShell().toggle`). */
  onCollapsedChange?: (collapsed: boolean) => void
  /**
   * Initial collapsed state when the user never toggled the menu (the choice
   * is persisted in localStorage, see `storageKey`).
   * @default true
   */
  defaultCollapsed?: boolean
  /**
   * localStorage key for the user's choice. Give each app (or user, or
   * screen) its own; `false` keeps the choice only while the page is open.
   * @default "amf-ui:sidebar:collapsed"
   */
  storageKey?: string | false
  /** Override any of the default pt-BR strings. */
  labels?: Partial<AppShellLabels>
  /**
   * Classes for the root element. The shell fills the viewport (`h-dvh`);
   * pass `"h-full"` to fill the parent instead (e.g. under an Electron title bar).
   */
  className?: string
  /** Page content, rendered inside `<main id="conteudo">` — the only area that scrolls. */
  children?: React.ReactNode
  /**
   * Ref to the `<main>` that scrolls. The page scrolls inside it, not the
   * window, so give it to your router's scroll restoration (or call
   * `mainRef.current.scrollTo(0, 0)` on navigation).
   */
  mainRef?: React.Ref<HTMLElement>
}

export interface AppShellState {
  /** `true` while the desktop menu is the 64px icon rail. Always `false` inside the mobile menu. */
  collapsed: boolean
  /** `true` below the `md:` breakpoint (48rem), same query as `useIsMobile`. */
  isMobile: boolean
  /** Closes the mobile menu. No-op when it is already closed. */
  closeMenu: () => void
  /** Collapses or expands the desktop menu, e.g. from a keyboard shortcut. */
  toggle: () => void
}

const AppShellContext = React.createContext<AppShellState | null>(null)

/** Shell state for content rendered inside `<AppShell>` (navbar, footer, page). */
export function useAppShell(): AppShellState {
  const shell = React.useContext(AppShellContext)
  if (!shell) {
    throw new Error("useAppShell() must be called inside <AppShell>.")
  }
  return shell
}

const STORAGE_KEY = "amf-ui:sidebar:collapsed"
const MAIN_ID = "conteudo"

const iconButtonClass = cn(
  "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-element transition-colors",
  "state-layer",
  "focus-visible:focus-outline",
)

interface BrandMarkProps {
  brand: React.ReactNode
  onClick?: () => void
  label: string
  className: string
  withTooltip?: boolean
}

function BrandMark({ brand, onClick, label, className, withTooltip = false }: BrandMarkProps) {
  const box = cn("shrink-0 overflow-hidden rounded-element", className)
  if (!onClick) {
    return (
      <span data-slot="app-shell-brand-mark" className={box}>
        {brand}
      </span>
    )
  }
  const button = (
    <button
      type="button"
      data-slot="app-shell-brand-mark"
      aria-label={label}
      onClick={onClick}
      className={cn(box, "cursor-pointer state-layer", "focus-visible:focus-outline")}
    >
      {brand}
    </button>
  )
  return withTooltip ? (
    <Tooltip content={label} side="right">
      {button}
    </Tooltip>
  ) : (
    button
  )
}

function AppShell({
  items,
  isActive,
  renderLink,
  brand,
  brandText,
  onBrandClick,
  navbar,
  footer,
  contentPadding = true,
  collapsed: collapsedProp,
  onCollapsedChange,
  defaultCollapsed = true,
  storageKey = STORAGE_KEY,
  labels,
  mainRef,
  className,
  children,
}: AppShellProps) {
  const l: AppShellLabels = { ...defaultAppShellLabels, ...labels }
  const isMobile = useIsMobile()
  // The saved choice comes through an external store: the server and the
  // hydrating render both see "nothing saved", so they agree; the saved value
  // is applied right after hydration.
  const controlled = collapsedProp !== undefined
  const persistKey = storageKey === false || controlled ? null : storageKey
  const stored = useStoredBoolean(persistKey)
  // Without storage the choice lives here, for the page's lifetime.
  const [unsaved, setUnsaved] = React.useState<boolean | null>(null)
  const collapsed = collapsedProp ?? (persistKey ? stored : unsaved) ?? defaultCollapsed
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [collapseTipOpen, setCollapseTipOpen] = React.useState(false)
  // Groups the user opened or closed, shared by the desktop menu and the
  // mobile one (which remounts every time it opens).
  const [openGroups, setOpenGroups] = React.useState<Readonly<Record<string, boolean>>>({})
  const onOpenGroupChange = React.useCallback((id: string, open: boolean) => {
    setOpenGroups((current) => ({ ...current, [id]: open }))
  }, [])
  const sidebarId = React.useId()

  const toggleCollapsed = React.useCallback(() => {
    const next = !collapsed
    if (!controlled) {
      if (persistKey) writeStoredBoolean(persistKey, next)
      else setUnsaved(next)
    }
    onCollapsedChange?.(next)
  }, [collapsed, controlled, persistKey, onCollapsedChange])

  const closeMenu = React.useCallback(() => setMenuOpen(false), [])

  // The menu dialog only exists below the breakpoint. Growing the window past
  // it must not leave an open modal (and its scroll lock) behind.
  React.useEffect(() => {
    if (!isMobile) setMenuOpen(false)
  }, [isMobile])

  const shell = React.useMemo<AppShellState>(
    () => ({ collapsed, isMobile, closeMenu, toggle: toggleCollapsed }),
    [collapsed, isMobile, closeMenu, toggleCollapsed],
  )
  // The mobile menu is always the expanded layout.
  const menuShell = React.useMemo<AppShellState>(() => ({ ...shell, collapsed: false }), [shell])

  const hasBrand = Boolean(brand) || Boolean(brandText)
  const brandInMenuClick = onBrandClick
    ? () => {
        onBrandClick()
        closeMenu()
      }
    : undefined

  const collapseButton = (
    <button
      type="button"
      data-slot="app-shell-collapse"
      aria-controls={sidebarId}
      aria-label={collapsed ? l.expand : undefined}
      onClick={toggleCollapsed}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-element px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors",
        "state-layer",
        "focus-visible:focus-outline",
        collapsed && "justify-center",
      )}
    >
      {collapsed ? (
        <PanelLeftOpen className="h-4 w-4 shrink-0" aria-hidden />
      ) : (
        <PanelLeftClose className="h-4 w-4 shrink-0" aria-hidden />
      )}
      {!collapsed ? <span className="flex-1 truncate">{l.collapse}</span> : null}
    </button>
  )

  return (
    <AppShellContext.Provider value={shell}>
      <div
        data-slot="app-shell"
        data-state={collapsed ? "collapsed" : "expanded"}
        className={cn(
          "flex h-dvh w-full overflow-hidden bg-background text-foreground",
          // On paper the page must flow: no viewport-tall box, no inner scroll.
          "print:block print:h-auto print:overflow-visible",
          className,
        )}
      >
        <a
          href={`#${MAIN_ID}`}
          data-slot="app-shell-skip-link"
          className={cn(
            "sr-only",
            "focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-toast)] focus:rounded-element",
            "focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground",
            "focus:focus-outline",
          )}
        >
          {l.skipToContent}
        </a>

        <aside
          id={sidebarId}
          data-slot="app-shell-sidebar"
          data-state={collapsed ? "collapsed" : "expanded"}
          className={cn(
            // `overflow-hidden` keeps labels growing from 0 → full width from
            // exposing a horizontal scrollbar while the width animates.
            "hidden shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-(--duration-medium) ease-(--ease-standard) md:flex print:hidden",
            collapsed ? "w-16" : "w-64",
          )}
        >
          {hasBrand ? (
            // `px-4` puts the 32px mark on the same 32px axis as the item
            // icons in both states, so it never shifts while the rail animates.
            <div
              data-slot="app-shell-brand"
              className="flex h-16 shrink-0 items-center gap-2 border-b px-4"
            >
              {brand ? (
                <BrandMark
                  brand={brand}
                  onClick={onBrandClick}
                  label={l.brandAction}
                  className="size-8"
                  withTooltip
                />
              ) : null}
              {!collapsed && brandText ? (
                <span className="truncate font-mono text-[32px] font-semibold leading-none">
                  {brandText}
                </span>
              ) : null}
            </div>
          ) : null}

          <nav
            aria-label={l.navigation}
            className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4"
          >
            <ul className="space-y-1">
              {items.map((item) => (
                <AppShellNavItem
                  key={item.id}
                  item={item}
                  collapsed={collapsed}
                  isActive={isActive}
                  renderLink={renderLink}
                  openGroups={openGroups}
                  onOpenGroupChange={onOpenGroupChange}
                />
              ))}
            </ul>
          </nav>

          <div className="border-t px-3 py-2">
            {/* The same wrapper in both states: swapping it would remount the
                button and throw keyboard focus to the page body. The tooltip
                only opens on the rail, where the label is hidden. */}
            <Tooltip
              content={l.expand}
              side="right"
              open={collapsed && collapseTipOpen}
              onOpenChange={setCollapseTipOpen}
            >
              {collapseButton}
            </Tooltip>
          </div>

          {footer ? (
            <div data-slot="app-shell-footer" className="border-t p-3">
              {footer}
            </div>
          ) : null}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col print:block">
          {/* One bar for both layouts: on desktop it is the navbar (hidden
              when there is none); below 768px it also carries the menu
              button and the brand. Rendering `navbar` once avoids mounting
              the app's navbar twice. */}
          <header
            data-slot="app-shell-navbar"
            className={cn(
              "flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border bg-sidebar px-2 text-sidebar-foreground md:gap-3 md:px-6",
              !navbar && "md:hidden",
            )}
          >
            <DialogPrimitive.Root open={menuOpen} onOpenChange={setMenuOpen}>
              <div
                data-slot="app-shell-mobile-bar"
                className="flex min-w-0 items-center gap-2 md:hidden"
              >
                <DialogPrimitive.Trigger aria-label={l.openMenu} className={iconButtonClass}>
                  <Menu className="size-5" aria-hidden />
                </DialogPrimitive.Trigger>
                {brand ? (
                  <BrandMark
                    brand={brand}
                    onClick={onBrandClick}
                    label={l.brandAction}
                    className="size-7"
                  />
                ) : null}
                {brandText ? (
                  <span className="truncate font-mono text-xl font-semibold leading-none">
                    {brandText}
                  </span>
                ) : null}
              </div>

              <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay
                  data-slot="app-shell-menu-overlay"
                  className={overlayBase}
                />
                <DialogPrimitive.Content
                  data-slot="app-shell-menu"
                  aria-describedby={undefined}
                  className={cn(
                    "fixed inset-y-0 left-0 z-[var(--z-modal)] flex w-72 max-w-[85vw] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
                    motionSheet,
                    "data-[state=open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
                  )}
                >
                  <DialogPrimitive.Title className="sr-only">{l.menu}</DialogPrimitive.Title>
                  <div className="flex h-16 shrink-0 items-center gap-2 border-b pl-4 pr-2">
                    {brand ? (
                      <BrandMark
                        brand={brand}
                        onClick={brandInMenuClick}
                        label={l.brandAction}
                        className="size-8"
                      />
                    ) : null}
                    {brandText ? (
                      <span className="min-w-0 truncate font-mono text-[32px] font-semibold leading-none">
                        {brandText}
                      </span>
                    ) : null}
                    <DialogPrimitive.Close
                      aria-label={l.closeMenu}
                      className={cn(iconButtonClass, "ml-auto")}
                    >
                      <XIcon className="size-5" aria-hidden />
                    </DialogPrimitive.Close>
                  </div>
                  <AppShellContext.Provider value={menuShell}>
                    <nav
                      aria-label={l.navigation}
                      className="min-h-0 flex-1 overflow-y-auto px-3 py-4"
                    >
                      <ul className="space-y-1">
                        {items.map((item) => (
                          <AppShellNavItem
                            key={item.id}
                            item={item}
                            collapsed={false}
                            isActive={isActive}
                            touch
                            onNavigate={closeMenu}
                            renderLink={renderLink}
                            openGroups={openGroups}
                            onOpenGroupChange={onOpenGroupChange}
                          />
                        ))}
                      </ul>
                    </nav>
                    {footer ? (
                      <div data-slot="app-shell-footer" className="border-t p-3">
                        {footer}
                      </div>
                    ) : null}
                  </AppShellContext.Provider>
                </DialogPrimitive.Content>
              </DialogPrimitive.Portal>
            </DialogPrimitive.Root>

            {navbar ? (
              <div
                data-slot="app-shell-navbar-content"
                className="flex min-w-0 flex-1 items-center justify-end gap-3 md:justify-start"
              >
                {navbar}
              </div>
            ) : null}
          </header>

          <main
            id={MAIN_ID}
            tabIndex={-1}
            data-slot="app-shell-main"
            ref={mainRef}
            className={cn(
              "min-h-0 flex-1 overflow-y-auto focus:outline-none print:overflow-visible",
              contentPadding && "p-4 md:p-6",
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </AppShellContext.Provider>
  )
}

AppShell.displayName = "AppShell"

export { AppShell }
