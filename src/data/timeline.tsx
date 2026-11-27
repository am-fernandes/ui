import type { LucideIcon } from "lucide-react"
import type * as React from "react"

import { cn } from "@/lib/utils"
import { Avatar } from "../primitives/avatar"

export interface TimelineItemData {
  id: string
  content: React.ReactNode
  actorName?: string
  avatarUrl?: string | null
  icon?: LucideIcon
}

export interface TimelineLabels {
  list: string
  system: string
  systemInitials: string
}

export const defaultTimelineLabels: TimelineLabels = {
  list: "Histórico",
  system: "Sistema",
  systemInitials: "SI",
}

export interface TimelineProps extends Omit<React.ComponentPropsWithoutRef<"ol">, "children"> {
  items: TimelineItemData[]
  allowedProtocols?: string[]
  orientation?: "horizontal" | "vertical"
  labels?: Partial<TimelineLabels>
  ref?: React.Ref<HTMLOListElement>
}

function initialsOf(words: string[]) {
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}

function Marker({
  item,
  allowedProtocols,
  labels,
}: {
  item: TimelineItemData
  allowedProtocols: string[] | undefined
  labels: TimelineLabels
}) {
  const Icon = item.icon
  if (Icon) {
    return (
      <span
        aria-hidden="true"
        data-slot="timeline-icon"
        className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-border-strong text-muted-foreground"
      >
        <Icon className="size-4" />
      </span>
    )
  }

  const words = item.actorName?.split(/\s+/).filter(Boolean) ?? []
  const named = words.length > 0
  return (
    <Avatar
      src={item.avatarUrl ?? undefined}
      alt={named ? words.join(" ") : labels.system}
      fallback={named ? initialsOf(words) : labels.systemInitials}
      allowedProtocols={allowedProtocols}
      className="size-8 font-medium"
    />
  )
}

function Timeline({
  items,
  orientation = "vertical",
  allowedProtocols,
  labels,
  className,
  "aria-label": ariaLabel,
  ref,
  ...props
}: TimelineProps) {
  const l: TimelineLabels = { ...defaultTimelineLabels, ...labels }
  const vertical = orientation === "vertical"

  return (
    <ol
      ref={ref}
      aria-label={ariaLabel ?? l.list}
      data-slot="timeline"
      data-orientation={orientation}
      className={cn("flex", vertical ? "flex-col" : "w-full", className)}
      {...props}
    >
      {items.map((item, index) => {
        const hasNext = index < items.length - 1
        return (
          <li
            key={item.id}
            data-slot="timeline-item"
            className={cn("flex gap-3", !vertical && "min-w-0 flex-1 flex-col")}
          >
            <div className={cn("flex items-center gap-1", vertical ? "flex-col pb-1" : "pr-1")}>
              <Marker item={item} allowedProtocols={allowedProtocols} labels={l} />
              {hasNext ? (
                <span
                  aria-hidden="true"
                  data-slot="timeline-connector"
                  className={cn("flex-1 bg-border", vertical ? "w-0.5" : "h-0.5")}
                />
              ) : null}
            </div>
            <div
              data-slot="timeline-content"
              className={cn(
                "min-w-0 flex-1 break-words text-sm leading-6",
                vertical && "pt-1",
                hasNext && (vertical ? "pb-6" : "pr-6"),
              )}
            >
              {item.content}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

Timeline.displayName = "Timeline"

export { Timeline }
