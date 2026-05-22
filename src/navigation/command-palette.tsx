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

export interface CommandPaletteLabels {
  /** Search input placeholder. */
  placeholder: string
  /** Empty-state message shown when no item matches the search. */
  emptyMessage: React.ReactNode
  /** Loader text rendered when `loading={true}`. */
  loading: React.ReactNode
}

export const defaultCommandPaletteLabels: CommandPaletteLabels = {
  placeholder: "Buscar...",
  emptyMessage: "Nenhum resultado",
  loading: "Carregando…",
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
  /**
   * Override individual UI strings. Defaults are pt-BR. The standalone
   * `placeholder` and `emptyMessage` props still win when provided.
   */
  labels?: Partial<CommandPaletteLabels>
}

function CommandPalette({
  open,
  onOpenChange,
  groups,
  placeholder,
  emptyMessage,
  loading,
  title,
  description = "",
  value,
  onValueChange,
  labels,
}: CommandPaletteProps) {
  const mergedLabels: CommandPaletteLabels = { ...defaultCommandPaletteLabels, ...labels }
  const resolvedPlaceholder = placeholder ?? mergedLabels.placeholder
  const resolvedEmptyMessage = emptyMessage ?? mergedLabels.emptyMessage
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
          className="flex items-center gap-2 border-b px-3"
          cmdk-input-wrapper=""
        >
          <SearchIcon className="size-4 shrink-0 opacity-50" aria-hidden="true" />
          <CommandPrimitive.Input
            placeholder={resolvedPlaceholder}
            className="flex w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-placeholder"
          />
        </div>
        <CommandPrimitive.List
          data-slot="command-list"
          className="max-h-[300px] overflow-y-auto overflow-x-hidden"
        >
          {loading ? (
            <CommandPrimitive.Loading className="py-6 text-center text-sm text-muted-foreground">
              {mergedLabels.loading}
            </CommandPrimitive.Loading>
          ) : (
            <CommandPrimitive.Empty className="py-6 text-center text-sm text-muted-foreground">
              {resolvedEmptyMessage}
            </CommandPrimitive.Empty>
          )}
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
                    "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    "data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50",
                  )}
                >
                  {item.render ?? (
                    <>
                      {item.icon ? <item.icon className="size-4" /> : null}
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
