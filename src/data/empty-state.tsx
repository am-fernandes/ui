"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Main message: what is empty ("Nenhum lead encontrado"). */
  title: React.ReactNode
  /** Why it is empty, or what to do next. */
  description?: React.ReactNode
  /** Decorative icon or illustration above the title (hidden from screen readers). */
  icon?: React.ReactNode
  /** Buttons below the text ("Novo lead", "Limpar filtros"). */
  actions?: React.ReactNode
  /**
   * Heading tag of the title, to fit the page outline. Semantic only — the
   * visual size stays the same.
   * @default 3
   */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
  /** Tighter spacing and stacked actions, for cards, popovers and narrow columns. */
  compact?: boolean
  /**
   * Announce the title and description to screen readers when the empty state
   * appears. Use it when it results from a user action (a search or a filter
   * with no results) — not for content that is empty on page load.
   */
  announce?: boolean
  ref?: React.Ref<HTMLDivElement>
}

/**
 * Placeholder for a content area with no data: icon, title, description and
 * actions. Pass it to `DataTable`'s `emptyMessage`, or render it in place of
 * a list.
 */
function EmptyState({
  title,
  description,
  icon,
  actions,
  headingLevel = 3,
  compact = false,
  announce = false,
  className,
  ref,
  ...props
}: EmptyStateProps) {
  const Heading = `h${headingLevel}` as const
  const titleRef = React.useRef<HTMLHeadingElement>(null)
  const descriptionRef = React.useRef<HTMLParagraphElement>(null)
  const [announcement, setAnnouncement] = React.useState("")

  // A live region only speaks when its content *changes* after it is in the
  // DOM, so the text is filled in after mount (and refreshed when it changes).
  // biome-ignore lint/correctness/useExhaustiveDependencies: the text is read from the rendered DOM, so title/description are the change signal.
  React.useEffect(() => {
    if (!announce) return
    const text = [titleRef.current?.textContent, descriptionRef.current?.textContent]
      .filter(Boolean)
      .join(". ")
    const id = window.setTimeout(() => setAnnouncement(text), 100)
    return () => window.clearTimeout(id)
  }, [announce, title, description])

  return (
    <div
      ref={ref}
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-3 px-4 py-6" : "gap-4 px-6 py-12",
        className,
      )}
      {...props}
    >
      {icon ? (
        <div
          aria-hidden="true"
          data-slot="empty-state-icon"
          className={cn(
            "flex shrink-0 items-center justify-center rounded-element bg-muted text-muted-foreground",
            compact ? "size-10 [&_svg]:size-5" : "size-12 [&_svg]:size-6",
          )}
        >
          {icon}
        </div>
      ) : null}
      <div className="flex max-w-prose flex-col gap-1">
        <Heading ref={titleRef} className="text-base font-semibold text-foreground">
          {title}
        </Heading>
        {description ? (
          <p ref={descriptionRef} className="text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div
          data-slot="empty-state-actions"
          className={cn(
            "flex items-center justify-center gap-2",
            compact ? "w-full flex-col [&>*]:w-full" : "flex-wrap",
          )}
        >
          {actions}
        </div>
      ) : null}
      {announce ? (
        <output className="sr-only" data-slot="empty-state-announcer">
          {announcement}
        </output>
      ) : null}
    </div>
  )
}

EmptyState.displayName = "EmptyState"

export { EmptyState }
