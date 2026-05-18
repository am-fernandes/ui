import { ChevronRight } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

export interface BreadcrumbItemData {
  /** Display content for the breadcrumb entry. */
  label: React.ReactNode
  /** Navigation URL. Omit for the current page. */
  href?: string
  /** Marks the current page. Auto-detected as true when href is omitted. */
  isCurrentPage?: boolean
}

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<"nav"> {
  items: BreadcrumbItemData[]
  /** Custom separator. Default: ChevronRight icon. */
  separator?: React.ReactNode
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, separator, className, ...props }, ref) => {
    const sep = separator ?? <ChevronRight />
    return (
      <nav
        ref={ref}
        data-slot="breadcrumb"
        aria-label="breadcrumb"
        className={className}
        {...props}
      >
        <ol
          data-slot="breadcrumb-list"
          className={cn(
            "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
          )}
        >
          {items.map((item, i) => {
            const isLast = i === items.length - 1
            const isCurrent = item.isCurrentPage ?? !item.href
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: items are positional; consumers don't have a stable id for a trail
              <React.Fragment key={i}>
                <li data-slot="breadcrumb-item" className="inline-flex items-center gap-1.5">
                  {isCurrent || !item.href ? (
                    <span
                      data-slot="breadcrumb-page"
                      aria-current="page"
                      className="font-normal text-foreground"
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
                    aria-hidden="true"
                    className="[&>svg]:w-3.5 [&>svg]:h-3.5"
                  >
                    {sep}
                  </li>
                ) : null}
              </React.Fragment>
            )
          })}
        </ol>
      </nav>
    )
  },
)
Breadcrumb.displayName = "Breadcrumb"

export { Breadcrumb }
