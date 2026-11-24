"use client"

import * as TabsPrimitive from "@radix-ui/react-tabs"
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TabsItemData {
  value: string
  label: React.ReactNode
  content: React.ReactNode
  badge?: React.ReactNode
  disabled?: boolean
}

export interface TabsProps
  extends Omit<React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>, "children"> {
  items: TabsItemData[]
  /**
   * Keep the panels in the DOM, hidden while inactive, so what they hold
   * survives a tab switch: an uncontrolled form, table filters, an upload in
   * progress. Without it a panel is unmounted when you leave it.
   * @default false
   */
  keepMounted?: boolean
  /**
   * With `keepMounted`, mount each panel on its first visit (and keep it from
   * then on) instead of all at once. Without `keepMounted` only the active
   * panel is ever mounted, `lazy` or not.
   * @default false
   */
  lazy?: boolean
  ref?: React.Ref<React.ComponentRef<typeof TabsPrimitive.Root>>
}

function Tabs({
  items,
  className,
  orientation,
  keepMounted = false,
  lazy = false,
  value,
  defaultValue,
  onValueChange,
  ref,
  ...props
}: TabsProps) {
  const isVertical = orientation === "vertical"
  // Without value or defaultValue the first tab that can be chosen is open:
  // Radix alone would select nothing (every tab unselected, no panel).
  const [internalValue, setInternalValue] = React.useState<string | undefined>(
    () => defaultValue ?? items.find((item) => !item.disabled)?.value,
  )
  const activeValue = value ?? internalValue

  // Panels visited so far: with `keepMounted` and `lazy`, they stay mounted.
  const [visited, setVisited] = React.useState<ReadonlySet<string>>(
    () => new Set(activeValue === undefined ? [] : [activeValue]),
  )
  if (activeValue !== undefined && !visited.has(activeValue)) {
    setVisited(new Set(visited).add(activeValue))
  }

  const handleValueChange = (v: string) => {
    if (value === undefined) setInternalValue(v)
    onValueChange?.(v)
  }

  return (
    <TabsPrimitive.Root
      ref={ref}
      data-slot="tabs"
      orientation={orientation}
      value={activeValue ?? ""}
      onValueChange={handleValueChange}
      className={cn(isVertical ? "flex gap-2" : undefined, className)}
      {...props}
    >
      <TabsPrimitive.List
        data-slot="tabs-list"
        className={cn(
          "inline-flex items-center justify-center rounded-element bg-muted p-1 text-muted-foreground",
          isVertical ? "flex-col items-stretch" : undefined,
        )}
      >
        {items.map((item) => (
          <TabsPrimitive.Trigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            data-slot="tabs-trigger"
            className={cn(
              "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-inner px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer state-layer focus-visible:focus-outline disabled:pointer-events-none disabled:cursor-default disabled:opacity-50 data-[state=active]:bg-card data-[state=active]:text-foreground",
            )}
          >
            {item.label}
            {item.badge ? <span data-slot="tabs-badge">{item.badge}</span> : null}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((item) => {
        const isActive = item.value === activeValue
        const contentClass = cn("focus-visible:focus-outline", isVertical ? "flex-1" : "mt-2")
        if (keepMounted) {
          if (lazy && !visited.has(item.value)) return null
          return (
            <TabsPrimitive.Content
              key={item.value}
              value={item.value}
              forceMount
              hidden={!isActive}
              data-slot="tabs-content"
              className={contentClass}
            >
              {item.content}
            </TabsPrimitive.Content>
          )
        }
        // Radix unmounts an inactive panel's content; `lazy` drops its empty shell too.
        if (lazy && !isActive) return null
        return (
          <TabsPrimitive.Content
            key={item.value}
            value={item.value}
            data-slot="tabs-content"
            className={contentClass}
          >
            {item.content}
          </TabsPrimitive.Content>
        )
      })}
    </TabsPrimitive.Root>
  )
}
Tabs.displayName = "Tabs"

export { Tabs }
