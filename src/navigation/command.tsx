"use client"

import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"
import type * as React from "react"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../overlays/dialog"

type CommandRef = React.ComponentRef<typeof CommandPrimitive>
type CommandPropsType = React.ComponentPropsWithoutRef<typeof CommandPrimitive> & {
  ref?: React.Ref<CommandRef>
}

function Command({ className, ref, ...props }: CommandPropsType) {
  return (
    <CommandPrimitive
      ref={ref}
      data-slot="command"
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
        className,
      )}
      {...props}
    />
  )
}
Command.displayName = "Command"

type CommandDialogProps = React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  children?: React.ReactNode
}

function CommandDialog({
  title = "Command palette",
  description = "Search and run commands.",
  children,
  ...props
}: CommandDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>
        <Command
          data-slot="command-dialog"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

type CommandInputProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> & {
  ref?: React.Ref<React.ComponentRef<typeof CommandPrimitive.Input>>
}

function CommandInput({ className, ref, ...props }: CommandInputProps) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex items-center border-b px-3"
      cmdk-input-wrapper=""
    >
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        ref={ref}
        data-slot="command-input"
        className={cn(
          "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  )
}
CommandInput.displayName = "CommandInput"

type CommandListProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.List> & {
  ref?: React.Ref<React.ComponentRef<typeof CommandPrimitive.List>>
}

function CommandList({ className, ref, ...props }: CommandListProps) {
  return (
    <CommandPrimitive.List
      ref={ref}
      data-slot="command-list"
      className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
      {...props}
    />
  )
}
CommandList.displayName = "CommandList"

type CommandEmptyProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty> & {
  ref?: React.Ref<React.ComponentRef<typeof CommandPrimitive.Empty>>
}

function CommandEmpty({ ref, ...props }: CommandEmptyProps) {
  return (
    <CommandPrimitive.Empty
      ref={ref}
      data-slot="command-empty"
      className="py-6 text-center text-sm"
      {...props}
    />
  )
}
CommandEmpty.displayName = "CommandEmpty"

type CommandGroupProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group> & {
  ref?: React.Ref<React.ComponentRef<typeof CommandPrimitive.Group>>
}

function CommandGroup({ className, ref, ...props }: CommandGroupProps) {
  return (
    <CommandPrimitive.Group
      ref={ref}
      data-slot="command-group"
      className={cn(
        "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}
CommandGroup.displayName = "CommandGroup"

type CommandSeparatorProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator> & {
  ref?: React.Ref<React.ComponentRef<typeof CommandPrimitive.Separator>>
}

function CommandSeparator({ className, ref, ...props }: CommandSeparatorProps) {
  return (
    <CommandPrimitive.Separator
      ref={ref}
      data-slot="command-separator"
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  )
}
CommandSeparator.displayName = "CommandSeparator"

type CommandItemProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> & {
  ref?: React.Ref<React.ComponentRef<typeof CommandPrimitive.Item>>
}

function CommandItem({ className, ref, ...props }: CommandItemProps) {
  return (
    <CommandPrimitive.Item
      ref={ref}
      data-slot="command-item"
      className={cn(
        "relative flex cursor-pointer aria-selected:cursor-pointer data-[disabled=true]:cursor-not-allowed gap-2 select-none items-center rounded-md px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  )
}
CommandItem.displayName = "CommandItem"

type CommandShortcutProps = React.HTMLAttributes<HTMLSpanElement> & {
  ref?: React.Ref<HTMLSpanElement>
}

function CommandShortcut({ className, ref, ...props }: CommandShortcutProps) {
  return (
    <span
      ref={ref}
      data-slot="command-shortcut"
      className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
      {...props}
    />
  )
}
CommandShortcut.displayName = "CommandShortcut"

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
}
