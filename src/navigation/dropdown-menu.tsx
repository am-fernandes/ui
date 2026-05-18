"use client"

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import type * as React from "react"

import { cn } from "@/lib/utils"

export type DropdownMenuItemData =
  | {
      /** Renders an actionable item. Default when `type` is omitted. */
      type?: "item"
      label: React.ReactNode
      icon?: React.ComponentType<{ className?: string }>
      onSelect?: () => void
      disabled?: boolean
      destructive?: boolean
      shortcut?: string
    }
  | {
      /** Renders a visual separator between groups. */
      type: "separator"
    }
  | {
      /** Renders a non-interactive section label. */
      type: "label"
      label: React.ReactNode
    }

export interface DropdownMenuProps {
  /** The trigger element (a Button is recommended). Wrapped with Radix Trigger asChild. */
  trigger: React.ReactNode
  items: DropdownMenuItemData[]
  /** Optional alignment of the menu content (default "start"). */
  align?: "start" | "center" | "end"
  /** Optional Radix open/onOpenChange for controlled use. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function DropdownMenu({ trigger, items, align = "start", open, onOpenChange }: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" asChild>
        {trigger}
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          data-slot="dropdown-menu-content"
          align={align}
          sideOffset={4}
          className={cn(
            "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]",
          )}
        >
          {items.map((item, i) => {
            if (item.type === "separator") {
              return (
                <DropdownMenuPrimitive.Separator
                  // biome-ignore lint/suspicious/noArrayIndexKey: items are positional; no stable id available
                  key={`sep-${i}`}
                  data-slot="dropdown-menu-separator"
                  className="-mx-1 my-1 h-px bg-muted"
                />
              )
            }
            if (item.type === "label") {
              return (
                <DropdownMenuPrimitive.Label
                  // biome-ignore lint/suspicious/noArrayIndexKey: items are positional; no stable id available
                  key={`label-${i}`}
                  data-slot="dropdown-menu-label"
                  className="px-2 py-1.5 text-sm font-semibold"
                >
                  {item.label}
                </DropdownMenuPrimitive.Label>
              )
            }
            const Icon = item.icon
            return (
              <DropdownMenuPrimitive.Item
                // biome-ignore lint/suspicious/noArrayIndexKey: items are positional; no stable id available
                key={`item-${i}`}
                data-slot="dropdown-menu-item"
                disabled={item.disabled}
                onSelect={item.onSelect}
                className={cn(
                  "relative flex cursor-pointer data-[disabled=true]:cursor-not-allowed select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
                  item.destructive &&
                    "text-destructive focus:bg-destructive/10 focus:text-destructive",
                )}
              >
                {Icon ? <Icon className="mr-2 size-4" /> : null}
                {item.label}
                {item.shortcut ? (
                  <span
                    data-slot="dropdown-menu-shortcut"
                    className="ml-auto text-xs tracking-widest opacity-60"
                  >
                    {item.shortcut}
                  </span>
                ) : null}
              </DropdownMenuPrimitive.Item>
            )
          })}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}
DropdownMenu.displayName = "DropdownMenu"

export { DropdownMenu }
