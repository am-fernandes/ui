"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Menu, PanelLeftClose, PanelLeftOpen, XIcon } from "lucide-react"
import * as React from "react"

import { useIsMobile } from "@/hooks/use-is-mobile"
import { cn } from "@/lib/utils"
import { overlayBase } from "../overlays/_internal/animations"
import { Tooltip } from "../overlays/tooltip"
import { type AppShellItem, AppShellNavItem } from "./_internal/app-shell-item"

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
  /** Mark the matching item as active (background accent + `aria-current`). */
  isActive?: (item: AppShellItem) => boolean
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
   * Initial collapsed state when the user never toggled the menu (the choice
   * is persisted in localStorage).
   * @default true
   */
  defaultCollapsed?: boolean
  /** Override any of the default pt-BR strings. */
  labels?: Partial<AppShellLabels>
  /**
   * Classes for the root element. The shell fills the viewport (`h-dvh`);
   * pass `"h-full"` to fill the parent instead (e.g. under an Electron title bar).
   */
  className?: string
  /** Page content, rendered inside `<main id="conteudo">` — the only area that scrolls. */
  children?: React.ReactNode
}

export interface AppShellState {
  /** `true` while the desktop menu is the 64px icon rail. Always `false` inside the mobile menu. */
  collapsed: boolean
  /** `true` below 768px (same breakpoint as `useIsMobile`). */
  isMobile: boolean
  /** Closes the mobile menu. No-op when it is already closed. */
  closeMenu: () => void
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

function readStoredCollapsed(fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === "true") return true
    if (stored === "false") return false
  } catch {
    // Storage can be blocked (private mode, sandboxed iframes): use the default.
  }
  return fallback
}

function writeStoredCollapsed(value: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value))
  } catch {
    // Storage can be blocked: the choice just won't survive a reload.
  }
}

const iconButtonClass = cn(
  "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors",
  "hover:bg-accent hover:text-accent-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
)

interface BrandMarkProps {
  brand: React.ReactNode
  onClick?: () => void
  label: string
  className: string
  withTooltip?: boolean
}

function BrandMark({ brand, onClick, label, className, withTooltip = false }: BrandMarkProps) {
  const box = cn("shrink-0 overflow-hidden rounded", className)
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
      className={cn(
        box,
        "cursor-pointer transition-opacity hover:opacity-70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
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
  brand,
  brandText,
  onBrandClick,
  navbar,
  footer,
  contentPadding = true,
  defaultCollapsed = true,
  labels,
  className,
  children,
}: AppShellProps) {
  const l: AppShellLabels = { ...defaultAppShellLabels, ...labels }
  const isMobile = useIsMobile()
  const [collapsed, setCollapsed] = React.useState(() => readStoredCollapsed(defaultCollapsed))
  const [menuOpen, setMenuOpen] = React.useState(false)
  const sidebarId = React.useId()

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    writeStoredCollapsed(next)
  }

  const closeMenu = React.useCallback(() => setMenuOpen(false), [])

  // The menu dialog only exists below the breakpoint. Growing the window past
  // it must not leave an open modal (and its scroll lock) behind.
  React.useEffect(() => {
    if (!isMobile) setMenuOpen(false)
  }, [isMobile])

  const shell = React.useMemo<AppShellState>(
    () => ({ collapsed, isMobile, closeMenu }),
    [collapsed, isMobile, closeMenu],
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
        "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
        className={cn("flex h-dvh w-full overflow-hidden bg-background text-foreground", className)}
      >
        <a
          href={`#${MAIN_ID}`}
          data-slot="app-shell-skip-link"
          className={cn(
            "sr-only",
            "focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-toast)] focus:rounded-md",
            "focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
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
            "hidden shrink-0 flex-col overflow-hidden border-r bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex",
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
            className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 py-4"
          >
            {items.map((item) => (
              <AppShellNavItem
                key={item.id}
                item={item}
                collapsed={collapsed}
                isActive={isActive}
              />
            ))}
          </nav>

          <div className="border-t px-3 py-2">
            {collapsed ? (
              <Tooltip content={l.expand} side="right">
                {collapseButton}
              </Tooltip>
            ) : (
              collapseButton
            )}
          </div>

          {footer ? (
            <div data-slot="app-shell-footer" className="border-t p-3">
              {footer}
            </div>
          ) : null}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* One bar for both layouts: on desktop it is the navbar (hidden
              when there is none); below 768px it also carries the menu
              button and the brand. Rendering `navbar` once avoids mounting
              the app's navbar twice. */}
          <header
            data-slot="app-shell-navbar"
            className={cn(
              "flex h-16 shrink-0 items-center gap-2 border-b bg-background px-2 md:gap-3 md:px-6",
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
                    "fixed inset-y-0 left-0 z-[var(--z-modal)] flex w-72 max-w-[85vw] flex-col border-r bg-sidebar text-sidebar-foreground",
                    "duration-[var(--motion-slowest)] data-[state=open]:animate-in data-[state=closed]:animate-out",
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
                      className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4"
                    >
                      {items.map((item) => (
                        <AppShellNavItem
                          key={item.id}
                          item={item}
                          collapsed={false}
                          isActive={isActive}
                          touch
                          onNavigate={closeMenu}
                        />
                      ))}
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
            className={cn(
              "min-h-0 flex-1 overflow-y-auto focus:outline-none",
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
