"use client"

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"
import * as React from "react"

import { DEFAULT_ALLOWED_LINK_PROTOCOLS, isAllowedUrl } from "@/lib/url"
import { cn } from "@/lib/utils"
import { motionMenu } from "./_internal/animations"

type MenuIcon = React.ComponentType<{ className?: string }>

/** Action row. The default entry type — `type` can be omitted. */
export interface DropdownMenuActionItem {
  type?: "item"
  /** Stable React key. Needed only when the list reorders or filters. */
  id?: string
  label: React.ReactNode
  icon?: MenuIcon
  /** Hint on the right, e.g. "⌘D". Display only — wire the shortcut yourself. */
  shortcut?: string
  onSelect?: () => void
  /**
   * Turns the row into a real link (middle-click / ⌘-click keep working).
   * Unsafe protocols (`javascript:`, `vbscript:`, `file:`…) are dropped and
   * the row falls back to a plain action.
   */
  href?: string
  /** Link target. `"_blank"` also sets `rel="noopener noreferrer"`. */
  target?: React.HTMLAttributeAnchorTarget
  /** `"destructive"` paints the row in the error colour (delete, archive). */
  variant?: "default" | "destructive"
  disabled?: boolean
  /** Keep the menu open after selecting (e.g. a counter you click repeatedly). */
  keepOpen?: boolean
}

/** Row with a check mark, for independent on/off options. */
export interface DropdownMenuCheckboxItem {
  type: "checkbox"
  id?: string
  label: React.ReactNode
  icon?: MenuIcon
  shortcut?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  /** Keep the menu open after toggling (e.g. show/hide several columns). */
  keepOpen?: boolean
}

export interface DropdownMenuRadioOption {
  value: string
  label: React.ReactNode
  icon?: MenuIcon
  disabled?: boolean
}

/** Mutually exclusive options (sort order, density…). */
export interface DropdownMenuRadioGroup {
  type: "radio"
  id?: string
  /** Optional heading above the options. */
  label?: React.ReactNode
  value: string
  onValueChange: (value: string) => void
  options: DropdownMenuRadioOption[]
  keepOpen?: boolean
}

/** Labelled section of rows. */
export interface DropdownMenuGroup {
  type: "group"
  id?: string
  label?: React.ReactNode
  items: DropdownMenuEntry[]
}

/** Row that opens a nested menu to the side. */
export interface DropdownMenuSubmenu {
  type: "submenu"
  id?: string
  label: React.ReactNode
  icon?: MenuIcon
  disabled?: boolean
  items: DropdownMenuEntry[]
}

export interface DropdownMenuSeparator {
  type: "separator"
  id?: string
}

export type DropdownMenuEntry =
  | DropdownMenuActionItem
  | DropdownMenuCheckboxItem
  | DropdownMenuRadioGroup
  | DropdownMenuGroup
  | DropdownMenuSubmenu
  | DropdownMenuSeparator

export interface DropdownMenuProps {
  /**
   * Element that opens the menu — usually a `Button` or an `IconButton`. It
   * receives the trigger props and ref, so it must be a single element that
   * spreads props onto a focusable node.
   */
  trigger: React.ReactNode
  items: DropdownMenuEntry[]
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** @default "bottom" */
  side?: "top" | "right" | "bottom" | "left"
  /** @default "start" */
  align?: "start" | "center" | "end"
  /** @default 4 */
  sideOffset?: number
  /**
   * When `true` (default) the rest of the page is inert while the menu is
   * open. Set `false` for a menu inside a toolbar that must keep scrolling.
   */
  modal?: boolean
  /** Classes for the menu panel (e.g. a fixed width). */
  className?: string
}

const contentClass = cn(
  "z-(--z-popover) min-w-[max(8rem,var(--radix-dropdown-menu-trigger-width))] overflow-y-auto overflow-x-hidden",
  "max-h-(--radix-dropdown-menu-content-available-height) rounded-md border bg-popover p-1 text-popover-foreground outline-none",
  motionMenu,
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
)

const rowClass = cn(
  "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none transition-colors",
  "focus:state-hover",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
)

// Checkbox and radio rows reserve the left gutter for their indicator.
const indicatorRowClass = cn(rowClass, "pl-8")

const labelClass = "px-2 py-1.5 text-xs font-medium text-muted-foreground"

function Shortcut({ value }: { value?: string }) {
  if (!value) return null
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className="ml-auto pl-4 font-mono text-xs tracking-widest text-muted-foreground"
    >
      {value}
    </span>
  )
}

function keepOpenHandler(keepOpen: boolean | undefined, run?: () => void) {
  return (event: Event) => {
    if (keepOpen) event.preventDefault()
    run?.()
  }
}

function entryKey(entry: DropdownMenuEntry, index: number) {
  return entry.id ?? `${entry.type ?? "item"}-${index}`
}

function ActionRow({ item }: { item: DropdownMenuActionItem }) {
  const Icon = item.icon
  const destructive = item.variant === "destructive"
  const className = cn(rowClass, destructive && "text-destructive")
  const content = (
    <>
      {Icon ? <Icon className="size-4" aria-hidden /> : null}
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      <Shortcut value={item.shortcut} />
    </>
  )

  const hrefIsSafe = item.href != null && isAllowedUrl(item.href, DEFAULT_ALLOWED_LINK_PROTOCOLS)
  if (
    process.env.NODE_ENV !== "production" &&
    item.href != null &&
    item.href !== "" &&
    !hrefIsSafe
  ) {
    console.warn(
      `[DropdownMenu] href "${item.href}" was blocked because its protocol is not on the allowlist. Rendering the item as an action.`,
    )
  }

  if (hrefIsSafe) {
    return (
      <DropdownMenuPrimitive.Item
        asChild
        disabled={item.disabled}
        data-slot="dropdown-menu-item"
        data-variant={item.variant ?? "default"}
        className={className}
        onSelect={keepOpenHandler(item.keepOpen, item.onSelect)}
      >
        <a
          href={item.href}
          target={item.target}
          rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
        >
          {content}
        </a>
      </DropdownMenuPrimitive.Item>
    )
  }

  return (
    <DropdownMenuPrimitive.Item
      disabled={item.disabled}
      data-slot="dropdown-menu-item"
      data-variant={item.variant ?? "default"}
      className={className}
      onSelect={keepOpenHandler(item.keepOpen, item.onSelect)}
    >
      {content}
    </DropdownMenuPrimitive.Item>
  )
}

function CheckboxRow({ item }: { item: DropdownMenuCheckboxItem }) {
  const Icon = item.icon
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      checked={item.checked}
      onCheckedChange={(checked) => item.onCheckedChange(checked === true)}
      disabled={item.disabled}
      className={indicatorRowClass}
      onSelect={keepOpenHandler(item.keepOpen)}
    >
      <span className="absolute left-2 flex size-4 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check className="size-4" aria-hidden />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {Icon ? <Icon className="size-4" aria-hidden /> : null}
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      <Shortcut value={item.shortcut} />
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function RadioGroupRows({ group }: { group: DropdownMenuRadioGroup }) {
  const labelId = React.useId()
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      value={group.value}
      onValueChange={group.onValueChange}
      aria-labelledby={group.label ? labelId : undefined}
    >
      {group.label ? (
        <DropdownMenuPrimitive.Label id={labelId} className={labelClass}>
          {group.label}
        </DropdownMenuPrimitive.Label>
      ) : null}
      {group.options.map((option) => {
        const Icon = option.icon
        return (
          <DropdownMenuPrimitive.RadioItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            data-slot="dropdown-menu-radio-item"
            className={indicatorRowClass}
            onSelect={keepOpenHandler(group.keepOpen)}
          >
            <span className="absolute left-2 flex size-4 items-center justify-center">
              <DropdownMenuPrimitive.ItemIndicator>
                <Circle className="size-2 fill-current" aria-hidden />
              </DropdownMenuPrimitive.ItemIndicator>
            </span>
            {Icon ? <Icon className="size-4" aria-hidden /> : null}
            <span className="min-w-0 flex-1 truncate">{option.label}</span>
          </DropdownMenuPrimitive.RadioItem>
        )
      })}
    </DropdownMenuPrimitive.RadioGroup>
  )
}

function GroupRows({ group }: { group: DropdownMenuGroup }) {
  const labelId = React.useId()
  return (
    <DropdownMenuPrimitive.Group
      data-slot="dropdown-menu-group"
      aria-labelledby={group.label ? labelId : undefined}
    >
      {group.label ? (
        <DropdownMenuPrimitive.Label id={labelId} className={labelClass}>
          {group.label}
        </DropdownMenuPrimitive.Label>
      ) : null}
      <Entries items={group.items} />
    </DropdownMenuPrimitive.Group>
  )
}

function SubmenuRow({ item }: { item: DropdownMenuSubmenu }) {
  const Icon = item.icon
  return (
    <DropdownMenuPrimitive.Sub>
      <DropdownMenuPrimitive.SubTrigger
        data-slot="dropdown-menu-sub-trigger"
        disabled={item.disabled}
        className={cn(
          rowClass,
          "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        )}
      >
        {Icon ? <Icon className="size-4" aria-hidden /> : null}
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        <ChevronRight className="ml-auto size-4" aria-hidden />
      </DropdownMenuPrimitive.SubTrigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.SubContent
          data-slot="dropdown-menu-sub-content"
          sideOffset={4}
          collisionPadding={8}
          loop
          className={cn(contentClass, "origin-(--radix-dropdown-menu-content-transform-origin)")}
        >
          <Entries items={item.items} />
        </DropdownMenuPrimitive.SubContent>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Sub>
  )
}

function Entries({ items }: { items: DropdownMenuEntry[] }) {
  return (
    <>
      {items.map((entry, index) => {
        const key = entryKey(entry, index)
        switch (entry.type) {
          case "separator":
            return (
              <DropdownMenuPrimitive.Separator
                key={key}
                data-slot="dropdown-menu-separator"
                className="-mx-1 my-1 h-px bg-border"
              />
            )
          case "checkbox":
            return <CheckboxRow key={key} item={entry} />
          case "radio":
            return <RadioGroupRows key={key} group={entry} />
          case "group":
            return <GroupRows key={key} group={entry} />
          case "submenu":
            return <SubmenuRow key={key} item={entry} />
          default:
            return <ActionRow key={key} item={entry} />
        }
      })}
    </>
  )
}

/**
 * Menu of actions anchored to a trigger. Data-driven: describe the rows in
 * `items` (actions, links, checkboxes, radio groups, labelled groups,
 * separators and submenus) and the component renders them with full
 * keyboard support (arrows, Home/End, typeahead, Escape returns focus).
 *
 * For page navigation use `AppShell`/`Tabs`; for picking a form value use
 * `Combobox`.
 */
function DropdownMenu({
  trigger,
  items,
  open,
  defaultOpen,
  onOpenChange,
  side = "bottom",
  align = "start",
  sideOffset = 4,
  modal = true,
  className,
}: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      modal={modal}
    >
      <DropdownMenuPrimitive.Trigger asChild data-slot="dropdown-menu-trigger">
        {trigger}
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          data-slot="dropdown-menu-content"
          side={side}
          align={align}
          sideOffset={sideOffset}
          collisionPadding={8}
          loop
          className={cn(
            contentClass,
            "origin-(--radix-dropdown-menu-content-transform-origin)",
            className,
          )}
        >
          <Entries items={items} />
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}

DropdownMenu.displayName = "DropdownMenu"

export { DropdownMenu }
