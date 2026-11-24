import { ChevronRight, Ellipsis } from "lucide-react"
import type * as React from "react"

import { type RenderLink, type RenderLinkProps, renderLinkElement } from "@/lib/render-link"
import { DEFAULT_ALLOWED_LINK_PROTOCOLS, isAllowedUrl } from "@/lib/url"
import { cn } from "@/lib/utils"
import { DropdownMenu } from "../overlays/dropdown-menu"

export interface BreadcrumbItemData {
  /** Display content for the breadcrumb entry. */
  label: React.ReactNode
  /**
   * Navigation URL. Omit for the current page. Values that don't resolve
   * to an `http:`/`https:`/`mailto:`/`tel:` URL (e.g. `javascript:` or
   * `vbscript:`) are dropped — the item then renders as plain text.
   */
  href?: string
  /**
   * Runs when the link is clicked and receives the event:
   * `event.preventDefault()` stops the navigation.
   */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
  /** Marks the current page. Auto-detected as true when href is omitted on the last item. */
  isCurrentPage?: boolean
}

export interface BreadcrumbLabels {
  /** Name of the `<nav>` landmark. */
  navigation: string
  /** Name of the "…" button that lists the items hidden by `maxItems`. */
  showHidden: string
}

export const defaultBreadcrumbLabels: BreadcrumbLabels = {
  navigation: "Trilha de navegação",
  showHidden: "Mostrar itens ocultos da trilha",
}

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<"nav"> {
  items: BreadcrumbItemData[]
  /**
   * Show at most this many entries: the first one, a "…" button and the last
   * `maxItems - 1`. The "…" opens a menu with the hidden entries, as plain
   * links. No limit by default.
   */
  maxItems?: number
  labels?: Partial<BreadcrumbLabels>
  /** @deprecated Use `labels={{ navigation }}`. */
  ariaLabel?: string
  /**
   * Renders the links with your router's `<Link>`, so a click navigates
   * without reloading the page:
   * `renderLink={({ href, ...props }) => <Link to={href} {...props} />}`.
   * Pass every prop on: they carry the classes and the click handler.
   */
  renderLink?: RenderLink
  ref?: React.Ref<HTMLElement>
}

type Entry = { kind: "item"; item: BreadcrumbItemData; index: number } | { kind: "hidden" }

function Breadcrumb({
  items,
  className,
  maxItems,
  labels: labelsProp,
  ariaLabel,
  renderLink,
  ref,
  ...props
}: BreadcrumbProps) {
  const labels = { ...defaultBreadcrumbLabels, ...labelsProp }
  const navigationLabel = labelsProp?.navigation ?? ariaLabel ?? labels.navigation

  const collapse = maxItems != null && maxItems >= 2 && items.length > maxItems
  const tailCount = collapse ? maxItems - 1 : items.length
  const hiddenItems = collapse ? items.slice(1, items.length - tailCount) : []
  const entries: Entry[] = collapse
    ? [
        { kind: "item", item: items[0] as BreadcrumbItemData, index: 0 },
        { kind: "hidden" },
        ...items
          .slice(items.length - tailCount)
          .map((item, i) => ({ kind: "item" as const, item, index: items.length - tailCount + i })),
      ]
    : items.map((item, index) => ({ kind: "item" as const, item, index }))

  return (
    <nav
      ref={ref}
      data-slot="breadcrumb"
      aria-label={navigationLabel}
      className={className}
      {...props}
    >
      <ol
        data-slot="breadcrumb-list"
        className="flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5"
      >
        {entries.map((entry, position) => {
          const isLastEntry = position === entries.length - 1
          const separator = isLastEntry ? null : (
            <ChevronRight
              data-slot="breadcrumb-separator"
              aria-hidden="true"
              className="size-3.5 shrink-0"
            />
          )

          if (entry.kind === "hidden") {
            return (
              <li
                key="hidden"
                data-slot="breadcrumb-item"
                className="inline-flex items-center gap-1.5 sm:gap-2.5"
              >
                <DropdownMenu
                  trigger={
                    <button
                      type="button"
                      data-slot="breadcrumb-ellipsis"
                      aria-label={labels.showHidden}
                      className="inline-flex size-6 cursor-pointer items-center justify-center rounded-inner state-layer focus-visible:focus-outline"
                    >
                      <Ellipsis aria-hidden="true" className="size-4" />
                    </button>
                  }
                  items={hiddenItems.map((item, i) => ({
                    id: `${i}-${item.href ?? ""}`,
                    label: item.label,
                    href: item.href,
                  }))}
                />
                {separator}
              </li>
            )
          }

          const { item, index } = entry
          const isLast = index === items.length - 1
          const isCurrent = item.isCurrentPage ?? (isLast && !item.href)
          const hrefIsSafe =
            item.href != null && isAllowedUrl(item.href, DEFAULT_ALLOWED_LINK_PROTOCOLS)
          if (
            process.env.NODE_ENV !== "production" &&
            item.href != null &&
            item.href !== "" &&
            !hrefIsSafe
          ) {
            console.warn(
              `[Breadcrumb] href "${item.href}" was blocked because its protocol is not on the allowlist. Rendering the item as plain text.`,
            )
          }
          const key = item.href ?? `${index}-${typeof item.label === "string" ? item.label : ""}`

          let content: React.ReactNode
          if (isCurrent) {
            content = (
              <span
                data-slot="breadcrumb-page"
                aria-current="page"
                className="font-semibold text-foreground"
              >
                {item.label}
              </span>
            )
          } else if (!hrefIsSafe) {
            // A step of the path that is not a link (a group with no page of
            // its own): plain text, not styled as the current page.
            content = <span data-slot="breadcrumb-text">{item.label}</span>
          } else {
            const linkProps: RenderLinkProps = {
              "data-slot": "breadcrumb-link",
              href: item.href as string,
              className:
                "rounded-inner transition-colors hover:text-foreground focus-visible:focus-outline",
              children: item.label,
              ...(item.onClick ? { onClick: item.onClick } : {}),
            } as RenderLinkProps
            content = renderLinkElement(renderLink, linkProps)
          }

          return (
            <li
              key={key}
              data-slot="breadcrumb-item"
              className="inline-flex items-center gap-1.5 sm:gap-2.5"
            >
              {content}
              {separator}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
Breadcrumb.displayName = "Breadcrumb"

export { Breadcrumb }
