import { ChevronRight } from "lucide-react"
import * as React from "react"

import { DEFAULT_ALLOWED_LINK_PROTOCOLS, isAllowedUrl } from "@/lib/url"
import { cn } from "@/lib/utils"

export interface BreadcrumbItemData {
  /** Display content for the breadcrumb entry. */
  label: React.ReactNode
  /**
   * Navigation URL. Omit for the current page. Values that don't resolve
   * to an `http:`/`https:`/`mailto:`/`tel:` URL (e.g. `javascript:` or
   * `vbscript:`) are dropped — the item then renders as plain text.
   */
  href?: string
  /** Marks the current page. Auto-detected as true when href is omitted on the last item. */
  isCurrentPage?: boolean
}

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<"nav"> {
  items: BreadcrumbItemData[]
  /** aria-label applied to the wrapping nav. Default: "Breadcrumb". */
  ariaLabel?: string
  ref?: React.Ref<HTMLElement>
}

function Breadcrumb({
  items,
  className,
  ariaLabel = "Breadcrumb",
  ref,
  ...props
}: BreadcrumbProps) {
  return (
    <nav ref={ref} data-slot="breadcrumb" aria-label={ariaLabel} className={className} {...props}>
      <ol
        data-slot="breadcrumb-list"
        className={cn(
          "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
        )}
      >
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          const isCurrent = isLast && (item.isCurrentPage ?? !item.href)
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
          const key = item.href ?? `${i}-${typeof item.label === "string" ? item.label : ""}`
          return (
            <React.Fragment key={key}>
              <li data-slot="breadcrumb-item" className="inline-flex items-center gap-1.5">
                {isCurrent || !hrefIsSafe ? (
                  <span
                    data-slot="breadcrumb-page"
                    aria-current={isCurrent ? "page" : undefined}
                    className="font-semibold text-foreground"
                  >
                    {item.label}
                  </span>
                ) : (
                  <a
                    data-slot="breadcrumb-link"
                    href={item.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </a>
                )}
              </li>
              {!isLast ? (
                <li
                  data-slot="breadcrumb-separator"
                  role="presentation"
                  className="[&>svg]:w-3.5 [&>svg]:h-3.5"
                >
                  <ChevronRight />
                </li>
              ) : null}
            </React.Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
Breadcrumb.displayName = "Breadcrumb"

export { Breadcrumb }
