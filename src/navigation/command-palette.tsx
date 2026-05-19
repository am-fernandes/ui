"use client"

import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"
import type * as React from "react"

import { cn } from "@/lib/utils"
import { Dialog } from "../overlays/dialog"

export interface CommandPaletteItem {
  label?: string
  icon?: React.ComponentType<{ className?: string }>
  shortcut?: string
  onSelect: () => void
  disabled?: boolean
  render?: React.ReactNode
  keywords?: string[]
}

export interface CommandPaletteGroup {
  heading?: React.ReactNode
  items: CommandPaletteItem[]
}

export interface CommandPaletteProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  groups: CommandPaletteGroup[]
  placeholder?: string
  emptyMessage?: React.ReactNode
  loading?: boolean
  title: string
  description?: string
  value?: string
  onValueChange?: (value: string) => void
}

function CommandPalette({
  open,
  onOpenChange,
  groups,
  placeholder = "Buscar...",
  emptyMessage = "Nenhum resultado",
  loading,
  title,
  description = "",
  value,
  onValueChange,
}: CommandPaletteProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={<span className="sr-only">{title}</span>}
      description={description ? <span className="sr-only">{description}</span> : undefined}
      hideCloseButton
      className="overflow-hidden p-0"
    >
      <CommandPrimitive
        data-slot="command-palette"
        value={value}
        onValueChange={onValueChange}
        className="flex h-full w-full flex-col"
      >
        <div
          data-slot="command-input-wrap"
          className="flex items-center border-b px-3"
          cmdk-input-wrapper=""
        >
          <SearchIcon className="mr-2 size-4 shrink-0 opacity-50" aria-hidden="true" />
          <CommandPrimitive.Input
            placeholder={placeholder}
            className="flex w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-input"
          />
        </div>
        <CommandPrimitive.List
          data-slot="command-list"
          className="max-h-[300px] overflow-y-auto overflow-x-hidden"
        >
          {loading ? (
            <CommandPrimitive.Loading className="py-6 text-center text-sm text-muted-foreground">
              Carregando…
            </CommandPrimitive.Loading>
          ) : null}
          <CommandPrimitive.Empty className="py-6 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </CommandPrimitive.Empty>
          {groups.map((group, gi) => (
            <CommandPrimitive.Group
              // biome-ignore lint/suspicious/noArrayIndexKey: groups are positional in the prop array
              key={`g-${gi}`}
              heading={typeof group.heading === "string" ? group.heading : undefined}
              className={cn(
                "overflow-hidden p-1 text-foreground",
                "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
              )}
            >
              {group.items.map((item, ii) => (
                <CommandPrimitive.Item
                  key={`${gi}-${ii}-${item.label ?? "custom"}`}
                  disabled={item.disabled}
                  keywords={item.keywords}
                  onSelect={() => {
                    item.onSelect()
                  }}
                  className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    "data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50",
                  )}
                >
                  {item.render ?? (
                    <>
                      {item.icon ? <item.icon className="mr-2 size-4" /> : null}
                      <span>{item.label}</span>
                      {item.shortcut ? (
                        <span className="ml-auto text-xs tracking-widest text-muted-foreground">
                          {item.shortcut}
                        </span>
                      ) : null}
                    </>
                  )}
                </CommandPrimitive.Item>
              ))}
            </CommandPrimitive.Group>
          ))}
        </CommandPrimitive.List>
      </CommandPrimitive>
    </Dialog>
  )
}

CommandPalette.displayName = "CommandPalette"

export { CommandPalette }
