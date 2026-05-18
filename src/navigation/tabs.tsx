"use client"

import * as TabsPrimitive from "@radix-ui/react-tabs"
import type * as React from "react"

import { cn } from "@/lib/utils"

export interface TabsItemData {
  value: string
  label: React.ReactNode
  content: React.ReactNode
  disabled?: boolean
}

export interface TabsProps
  extends Omit<React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>, "children"> {
  items: TabsItemData[]
  ref?: React.Ref<React.ComponentRef<typeof TabsPrimitive.Root>>
}

function Tabs({ items, className, orientation, ref, ...props }: TabsProps) {
  const isVertical = orientation === "vertical"
  return (
    <TabsPrimitive.Root
      ref={ref}
      data-slot="tabs"
      orientation={orientation}
      className={cn(isVertical ? "flex gap-2" : undefined, className)}
      {...props}
    >
      <TabsPrimitive.List
        data-slot="tabs-list"
        className={cn(
          "inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
          isVertical ? "flex-col items-stretch h-auto" : "h-9",
        )}
      >
        {items.map((item) => (
          <TabsPrimitive.Trigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            data-slot="tabs-trigger"
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground",
            )}
          >
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((item) => (
        <TabsPrimitive.Content
          key={item.value}
          value={item.value}
          data-slot="tabs-content"
          className={cn(
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isVertical ? "flex-1" : "mt-2",
          )}
        >
          {item.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  )
}
Tabs.displayName = "Tabs"

export { Tabs }
