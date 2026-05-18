"use client"

import * as TabsPrimitive from "@radix-ui/react-tabs"
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TabsItemData {
  value: string
  label: React.ReactNode
  content: React.ReactNode
  disabled?: boolean
}

type TabsRootProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & {
  /**
   * Optional simplified API: pass an array of items and the component renders
   * the TabsList + TabsContent structure for you. When `children` is provided
   * it always wins so consumers can fall back to the compositional API.
   */
  items?: TabsItemData[]
}

const Tabs = React.forwardRef<React.ComponentRef<typeof TabsPrimitive.Root>, TabsRootProps>(
  ({ items, children, ...props }, ref) => {
    const content =
      children ??
      (items ? (
        <>
          <TabsList>
            {items.map((item) => (
              <TabsTrigger key={item.value} value={item.value} disabled={item.disabled}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {items.map((item) => (
            <TabsContent key={item.value} value={item.value}>
              {item.content}
            </TabsContent>
          ))}
        </>
      ) : null)

    return (
      <TabsPrimitive.Root ref={ref} data-slot="tabs" {...props}>
        {content}
      </TabsPrimitive.Root>
    )
  },
)
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    data-slot="tabs-list"
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className,
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    data-slot="tabs-trigger"
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all cursor-pointer focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground",
      className,
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    data-slot="tabs-content"
    className={cn("mt-2 focus-visible:outline-none", className)}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
