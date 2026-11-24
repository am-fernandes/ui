"use client"

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import * as React from "react"

import { type RenderLink, type RenderLinkProps, renderLinkElement } from "@/lib/render-link"
import { DEFAULT_ALLOWED_LINK_PROTOCOLS, isAllowedUrl } from "@/lib/url"
import { cn } from "@/lib/utils"
import { buttonVariants } from "../primitives/button"
import { IconButton } from "../primitives/icon-button"
import { isModifiedClick } from "./_internal/link-click"

const numberFormatter = new Intl.NumberFormat("pt-BR")
const fmt = (n: number) => numberFormatter.format(n)

export interface PaginationLabels {
  /** Accessible name of the `<nav>` landmark. */
  navigation: string
  previous: string
  next: string
  first: string
  last: string
  /** Accessible name of a page button/link, and the cursor-mode indicator. */
  page: (page: number) => string
  /** Indicator of the `compact` variant. */
  pageOf: (page: number, total: number) => string
  /** Summary shown when `totalItems` is known ("11–20 de 243"). */
  range: (from: number, to: number, total: number) => string
  /** Visible label (and accessible name) of the page-size select. */
  pageSize: string
}

export const defaultPaginationLabels: PaginationLabels = {
  navigation: "Paginação",
  previous: "Página anterior",
  next: "Próxima página",
  first: "Primeira página",
  last: "Última página",
  page: (page) => `Página ${fmt(page)}`,
  pageOf: (page, total) => `Página ${fmt(page)} de ${fmt(total)}`,
  range: (from, to, total) => `${fmt(from)}–${fmt(to)} de ${fmt(total)}`,
  pageSize: "Itens por página",
}

export interface PaginationProps {
  /** Current page, 1-based. Out-of-range values are clamped for display and navigation. */
  page: number
  onPageChange: (page: number) => void
  /** Number of pages, when you know it but not the item count. */
  totalPages?: number
  /**
   * Number of items. With `pageSize` it gives the page count and a range
   * summary ("11–20 de 243"). Takes precedence over `totalPages`.
   */
  totalItems?: number
  /** @default 10 */
  pageSize?: number
  /** Shows a page-size select. Changing it calls `onPageSizeChange` and goes back to page 1. */
  pageSizeOptions?: number[]
  onPageSizeChange?: (pageSize: number) => void
  /**
   * Cursor pagination (total unknown): only previous/next are shown, and
   * next is enabled while `hasMore` is true. Used when neither `totalItems`
   * nor `totalPages` is given.
   */
  hasMore?: boolean
  /**
   * `pages`: numbered buttons with ellipses. `compact`: "Página 3 de 10"
   * between previous and next.
   * @default "pages"
   */
  variant?: "pages" | "compact"
  /** Pages shown on each side of the current one. @default 1 */
  siblingCount?: number
  /**
   * Also show first/last page buttons. In a container narrower than 320px
   * they give way, and previous/next remain. @default false
   */
  showFirstLast?: boolean
  /**
   * Render real links instead of buttons (`?page=3` URLs, crawlable, open in
   * a new tab). `onPageChange` still fires, right after the browser follows
   * the link, except for a click that opens it elsewhere (Ctrl/⌘, Shift or
   * the middle button): this page then stays where it is. Unsafe protocols
   * fall back to buttons.
   */
  getPageHref?: (page: number) => string
  /**
   * With `getPageHref`, renders the links with your router's `<Link>`, so a
   * page change does not reload the page:
   * `renderLink={({ href, ...props }) => <Link to={href} {...props} />}`.
   * Pass every prop on: they carry the classes, `aria-current` and the click
   * handler that reports the page.
   */
  renderLink?: RenderLink
  disabled?: boolean
  /** `md` = 40px controls (the `Button` height), `sm` = 32px. @default "md" */
  size?: "sm" | "md"
  labels?: Partial<PaginationLabels>
  className?: string
}

type PageItem = number | "start-ellipsis" | "end-ellipsis"

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i)
}

/**
 * Page numbers to show. Always the same number of slots (first, last,
 * current ± siblings and two ellipses) so the control never changes width
 * while paging. An ellipsis only replaces two or more pages — a single
 * hidden page is shown instead.
 */
export function getPaginationItems(page: number, totalPages: number, siblingCount = 1): PageItem[] {
  const siblings = Math.max(0, Math.floor(siblingCount))
  const totalSlots = siblings * 2 + 5
  if (totalPages <= totalSlots) return range(1, totalPages)

  const left = Math.max(page - siblings, 1)
  const right = Math.min(page + siblings, totalPages)
  const showStartEllipsis = left > 3
  const showEndEllipsis = right < totalPages - 2
  const edgeCount = 3 + siblings * 2

  if (!showStartEllipsis) return [...range(1, edgeCount), "end-ellipsis", totalPages]
  if (!showEndEllipsis) {
    return [1, "start-ellipsis", ...range(totalPages - edgeCount + 1, totalPages)]
  }
  return [1, "start-ellipsis", ...range(left, right), "end-ellipsis", totalPages]
}

// Container widths (Tailwind's named sizes) and the classes that show the
// page numbers from that width up. Literal strings, so Tailwind finds them.
const ROOM = [
  { min: 320, block: "@xs:block", flex: "@xs:flex", hide: "@xs:hidden" },
  { min: 384, block: "@sm:block", flex: "@sm:flex", hide: "@sm:hidden" },
  { min: 448, block: "@md:block", flex: "@md:flex", hide: "@md:hidden" },
  { min: 512, block: "@lg:block", flex: "@lg:flex", hide: "@lg:hidden" },
  { min: 576, block: "@xl:block", flex: "@xl:flex", hide: "@xl:hidden" },
  { min: 672, block: "@2xl:block", flex: "@2xl:flex", hide: "@2xl:hidden" },
  { min: 768, block: "@3xl:block", flex: "@3xl:flex", hide: "@3xl:hidden" },
  { min: 896, block: "@4xl:block", flex: "@4xl:flex", hide: "@4xl:hidden" },
] as const

/** The smallest container that holds `controls` square controls on one row. */
function roomFor(controls: number, controlPx: number) {
  const need = controls * (controlPx + 4) - 4
  return ROOM.find((room) => room.min >= need) ?? ROOM[ROOM.length - 1]!
}

function totalPageCount(totalItems?: number, totalPages?: number, pageSize = 10) {
  if (totalItems != null) return Math.max(1, Math.ceil(Math.max(0, totalItems) / pageSize))
  if (totalPages != null) return Math.max(1, Math.floor(totalPages))
  return undefined
}

/**
 * Standalone pagination for lists, cards and server-side tables. Works with a
 * known total (`totalItems` / `totalPages`) or with cursors (`hasMore`).
 */
function Pagination({
  page,
  onPageChange,
  totalPages,
  totalItems,
  pageSize = 10,
  pageSizeOptions,
  onPageSizeChange,
  hasMore = false,
  variant = "pages",
  siblingCount = 1,
  showFirstLast = false,
  getPageHref,
  renderLink,
  disabled = false,
  size = "md",
  labels,
  className,
}: PaginationProps) {
  const l: PaginationLabels = { ...defaultPaginationLabels, ...labels }
  const safePageSize = pageSize > 0 ? pageSize : 10
  const total = totalPageCount(totalItems, totalPages, safePageSize)
  const isCursor = total === undefined
  const current = isCursor
    ? Math.max(1, Math.floor(page))
    : Math.min(Math.max(1, Math.floor(page)), total)
  const canPrevious = !disabled && current > 1
  const canNext = !disabled && (isCursor ? hasMore : current < total)

  const lastPage = total ?? current

  // At the ends a step link becomes the plain disabled <a> (a router's Link
  // needs an href): a different element, mounted anew. When the focused step
  // is swapped like that, focus goes back to the same step.
  const navRef = React.useRef<HTMLElement>(null)
  const refocusSlot = React.useRef<string | null>(null)
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs when the page changes.
  React.useLayoutEffect(() => {
    const slot = refocusSlot.current
    refocusSlot.current = null
    const nav = navRef.current
    if (!slot || !nav || nav.contains(document.activeElement)) return
    nav.querySelector<HTMLElement>(`[data-slot="${slot}"]`)?.focus()
  }, [current])

  const go = (target: number) => {
    if (target === current) return
    onPageChange(target)
  }

  // A link is followed *after* its click handlers run. Updating the page
  // synchronously would re-render "next" with the following href first and
  // the browser would skip a page — so report the change right after.
  const goAfterNavigation = (target: number) => {
    window.setTimeout(() => go(target), 0)
  }

  const hrefFor = (target: number): string | undefined => {
    if (!getPageHref) return undefined
    const href = getPageHref(target)
    if (isAllowedUrl(href, DEFAULT_ALLOWED_LINK_PROTOCOLS)) return href
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[Pagination] href "${href}" was blocked because its protocol is not on the allowlist. Rendering a button instead.`,
      )
    }
    return undefined
  }

  const controlSize = size === "sm" ? "h-8 min-w-8 px-1.5" : "h-10 min-w-10 px-2"

  const step = (
    target: number,
    enabled: boolean,
    label: string,
    icon: React.ReactNode,
    slot: string,
  ) => {
    const href = hrefFor(target)
    if (href !== undefined) {
      const className = cn(
        buttonVariants({ variant: "outline" }),
        "p-0",
        size === "sm" ? "size-8" : "size-10",
        !enabled && "pointer-events-none opacity-50",
      )
      if (!enabled) {
        // Links can't be disabled: at the ends they lose their href and are
        // announced as disabled instead. Never through `renderLink`: a router
        // link needs an href.
        return (
          <a
            data-slot={slot}
            // biome-ignore lint/a11y/useSemanticElements: without an href an <a> has no role of its own.
            role="link"
            aria-disabled="true"
            aria-label={label}
            // Reached the end while focused: it stays in the tab order, so
            // focus is not thrown to the page body (unless the whole pager
            // is disabled, unavailable from the start).
            tabIndex={disabled ? undefined : 0}
            // biome-ignore lint/a11y/useValidAnchor: a disabled link has no href; the click only stops here.
            onClick={(event) => event.preventDefault()}
            className={className}
          >
            {icon}
          </a>
        )
      }
      return renderLinkElement(renderLink, {
        "data-slot": slot,
        href,
        "aria-label": label,
        onClick: (event) => {
          // A new tab or window: this page stays where it is.
          if (isModifiedClick(event)) return
          if (event.currentTarget === document.activeElement) refocusSlot.current = slot
          goAfterNavigation(target)
        },
        className,
        children: icon,
      } as RenderLinkProps)
    }
    return (
      <IconButton
        data-slot={slot}
        icon={icon}
        label={label}
        variant="outline"
        size={size}
        disabled={!enabled}
        onClick={() => go(target)}
      />
    )
  }

  const pageControl = (target: number) => {
    const isCurrent = target === current
    const className = cn(
      buttonVariants({ variant: isCurrent ? "default" : "ghost" }),
      "p-0 tabular-nums",
      controlSize,
      size === "sm" && "text-xs",
    )
    const href = hrefFor(target)
    if (href !== undefined && disabled) {
      return (
        <a
          data-slot="pagination-page"
          // biome-ignore lint/a11y/useSemanticElements: without an href an <a> has no role of its own.
          role="link"
          aria-label={l.page(target)}
          aria-current={isCurrent ? "page" : undefined}
          aria-disabled="true"
          // biome-ignore lint/a11y/useValidAnchor: a disabled link has no href; the click only stops here.
          onClick={(event) => event.preventDefault()}
          className={cn(className, "pointer-events-none opacity-50")}
        >
          {fmt(target)}
        </a>
      )
    }
    if (href !== undefined) {
      return renderLinkElement(renderLink, {
        "data-slot": "pagination-page",
        href,
        "aria-label": l.page(target),
        "aria-current": isCurrent ? "page" : undefined,
        onClick: (event) => {
          // A new tab or window: this page stays where it is.
          if (isModifiedClick(event)) return
          goAfterNavigation(target)
        },
        className,
        children: fmt(target),
      } as RenderLinkProps)
    }
    return (
      <button
        type="button"
        data-slot="pagination-page"
        aria-label={l.page(target)}
        aria-current={isCurrent ? "page" : undefined}
        disabled={disabled}
        onClick={() => go(target)}
        className={className}
      >
        {fmt(target)}
      </button>
    )
  }

  const indicatorClass = cn(
    "px-2 text-muted-foreground tabular-nums whitespace-nowrap",
    size === "sm" ? "text-xs" : "text-sm",
  )

  let middle: React.ReactNode
  if (isCursor) {
    middle = (
      <li data-slot="pagination-indicator" className={indicatorClass}>
        {l.page(current)}
      </li>
    )
  } else if (variant === "compact") {
    middle = (
      <li data-slot="pagination-indicator" className={indicatorClass}>
        {l.pageOf(current, total)}
      </li>
    )
  } else {
    // When the numbers do not fit on one row (a phone, a narrow card), the
    // pager falls back to the compact layout instead of wrapping: a container
    // query on the <nav> swaps the numbers for "Página 3 de 10".
    const pageItems = getPaginationItems(current, total, siblingCount)
    const steps = 2 + (showFirstLast ? 2 : 0)
    const room = roomFor(pageItems.length + steps, size === "sm" ? 32 : 40)
    middle = (
      <>
        {pageItems.map((item) =>
          typeof item === "number" ? (
            <li key={item} className={cn("hidden", room.block)}>
              {pageControl(item)}
            </li>
          ) : (
            <li
              key={item}
              aria-hidden="true"
              data-slot="pagination-ellipsis"
              className={cn(
                "hidden items-center justify-center text-muted-foreground",
                room.flex,
                size === "sm" ? "h-8 w-6 text-xs" : "h-10 w-8 text-sm",
              )}
            >
              …
            </li>
          ),
        )}
        <li data-slot="pagination-indicator" className={cn(indicatorClass, room.hide)}>
          {l.pageOf(current, total)}
        </li>
      </>
    )
  }

  const showFirstLastButtons = showFirstLast && !isCursor
  const summary =
    totalItems != null
      ? l.range(
          totalItems <= 0 ? 0 : (current - 1) * safePageSize + 1,
          Math.min(current * safePageSize, Math.max(0, totalItems)),
          Math.max(0, totalItems),
        )
      : null

  const sizes =
    pageSizeOptions && pageSizeOptions.length > 0
      ? pageSizeOptions.includes(safePageSize)
        ? pageSizeOptions
        : [...pageSizeOptions, safePageSize].sort((a, b) => a - b)
      : null

  return (
    <nav
      ref={navRef}
      aria-label={l.navigation}
      data-slot="pagination"
      // A container: the page numbers show only when they fit in one row.
      className={cn(
        "@container flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2",
        className,
      )}
    >
      {summary !== null || sizes !== null ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {summary !== null ? (
            <span
              data-slot="pagination-range"
              className="text-xs text-muted-foreground tabular-nums"
            >
              {summary}
            </span>
          ) : null}
          {sizes !== null ? (
            // Same control as DataTable's "Linhas por página" select.
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{l.pageSize}</span>
              <select
                data-slot="pagination-page-size"
                value={safePageSize}
                disabled={disabled}
                onChange={(event) => {
                  const next = Number(event.target.value)
                  onPageSizeChange?.(next)
                  if (current !== 1) onPageChange(1)
                }}
                className={cn(
                  "rounded-element border border-input bg-card px-2 text-xs text-foreground field-states disabled:cursor-default disabled:opacity-50",
                  size === "sm" ? "h-8" : "h-9",
                )}
              >
                {sizes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      ) : null}
      <ul className="flex flex-wrap items-center gap-1">
        {/* Below 320px even the compact row would wrap: the first/last
            shortcuts give way, previous and next stay. */}
        {showFirstLastButtons ? (
          <li className="hidden @xs:block">
            {step(1, canPrevious, l.first, <ChevronsLeft />, "pagination-first")}
          </li>
        ) : null}
        <li>
          {step(current - 1, canPrevious, l.previous, <ChevronLeft />, "pagination-previous")}
        </li>
        {middle}
        <li>{step(current + 1, canNext, l.next, <ChevronRight />, "pagination-next")}</li>
        {showFirstLastButtons ? (
          <li className="hidden @xs:block">
            {step(lastPage, canNext, l.last, <ChevronsRight />, "pagination-last")}
          </li>
        ) : null}
      </ul>
    </nav>
  )
}

Pagination.displayName = "Pagination"

export { Pagination }
