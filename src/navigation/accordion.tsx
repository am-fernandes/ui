"use client"

import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

export interface AccordionItemData {
  value: string
  title: React.ReactNode
  content: React.ReactNode
  /** Optional element rendered on the right side of the header (e.g. delete button). */
  action?: React.ReactNode
  disabled?: boolean
}

type AccordionRootRef = React.ComponentRef<typeof AccordionPrimitive.Root>

interface AccordionSharedProps {
  items: AccordionItemData[]
  /**
   * Keep closed sections in the DOM, hidden, so what they hold survives
   * closing them: in a long form with `type="single"`, opening section 2
   * no longer wipes the uncontrolled fields of section 1.
   * @default false
   */
  keepMounted?: boolean
  /**
   * Level of the heading that wraps each title, to fit the page outline (an
   * accordion under an `<h2>` takes `3`; under an `<h3>`, `4`).
   * @default 3
   */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  ref?: React.Ref<AccordionRootRef>
}

type AccordionSingleProps = Omit<
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>,
  "children" | "type" | "value" | "defaultValue" | "onValueChange"
> &
  AccordionSharedProps & {
    type?: "single"
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
    collapsible?: boolean
  }

type AccordionMultipleProps = Omit<
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>,
  "children" | "type" | "value" | "defaultValue" | "onValueChange"
> &
  AccordionSharedProps & {
    type: "multiple"
    value?: string[]
    defaultValue?: string[]
    onValueChange?: (value: string[]) => void
  }

export type AccordionProps = AccordionSingleProps | AccordionMultipleProps

// `overflow-hidden` is needed by the height animation, and it would clip the
// focus ring of a field or button in the panel (2px, 3px away). The negative
// margins with the matching padding give the ring 6px of room on the sides
// and on top without moving the content.
const ringRoom = "-mx-1.5 -mt-1.5 px-1.5 pt-1.5"

const contentClass =
  "overflow-hidden text-sm duration-(--duration-fast) ease-(--ease-standard) data-[state=closed]:animate-accordion-up data-[state=closed]:ease-(--ease-exit) data-[state=open]:animate-accordion-down"

function AccordionItemView({
  item,
  open,
  keepMounted,
  headingLevel,
}: {
  item: AccordionItemData
  open: boolean
  keepMounted: boolean
  headingLevel: 2 | 3 | 4 | 5 | 6
}) {
  const Heading = `h${headingLevel}` as const
  const triggerId = React.useId()
  const regionId = React.useId()

  return (
    <AccordionPrimitive.Item
      value={item.value}
      disabled={item.disabled}
      data-slot="accordion-item"
      // Disabled: dimmed once, on the whole item (title and action).
      className="border-b last:border-b-0 data-[disabled]:opacity-50"
    >
      {/* The action sits next to the heading, not inside it: a heading holds
          the title only, so "Remover" is not read as part of it. */}
      <div className="flex items-center">
        <AccordionPrimitive.Header asChild>
          <Heading data-slot="accordion-header" className="flex flex-1 items-center">
            <AccordionPrimitive.Trigger
              data-slot="accordion-trigger"
              // With `keepMounted` the panel is ours (see below): link it here.
              id={keepMounted ? triggerId : undefined}
              aria-controls={keepMounted ? regionId : undefined}
              className={cn(
                "flex flex-1 cursor-pointer items-center justify-between py-4 text-left text-sm font-medium transition-colors enabled:hover:underline disabled:cursor-default [&[data-state=open]>svg]:rotate-180",
              )}
            >
              {item.title}
              <ChevronDown
                data-slot="accordion-chevron"
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform"
              />
            </AccordionPrimitive.Trigger>
          </Heading>
        </AccordionPrimitive.Header>
        {item.action ? (
          <div data-slot="accordion-action" className="ml-2">
            {item.action}
          </div>
        ) : null}
      </div>
      {keepMounted ? (
        // Radix renders a closed panel's content as nothing, even with
        // `forceMount`: a panel that keeps its content is a region of our own,
        // hidden while closed.
        // A named <section> is a region.
        <section
          id={regionId}
          aria-labelledby={triggerId}
          hidden={!open}
          data-slot="accordion-content"
          data-state={open ? "open" : "closed"}
          className={cn("text-sm", ringRoom)}
        >
          <div className="pb-4 pt-0">{item.content}</div>
        </section>
      ) : (
        <AccordionPrimitive.Content
          data-slot="accordion-content"
          className={cn(contentClass, ringRoom)}
        >
          <div className="pb-4 pt-0">{item.content}</div>
        </AccordionPrimitive.Content>
      )}
    </AccordionPrimitive.Item>
  )
}

function renderItems(
  items: AccordionItemData[],
  openValues: string[],
  keepMounted: boolean,
  headingLevel: 2 | 3 | 4 | 5 | 6,
) {
  return items.map((item, i) => {
    // AccordionItemData does not carry an id; prefer the (required) `value`
    // and fall back to a positional key derived from the string title.
    const key =
      typeof item.value === "string" && item.value
        ? item.value
        : `${i}-${typeof item.title === "string" ? item.title : ""}`
    return (
      <AccordionItemView
        key={key}
        item={item}
        open={openValues.includes(item.value)}
        keepMounted={keepMounted}
        headingLevel={headingLevel}
      />
    )
  })
}

/** Controlled when `value` is given, else holding the value itself. */
function useAccordionValue<T>(value: T | undefined, defaultValue: T, onChange?: (next: T) => void) {
  const [internal, setInternal] = React.useState<T>(defaultValue)
  const current = value !== undefined ? value : internal
  const set = (next: T) => {
    if (value === undefined) setInternal(next)
    onChange?.(next)
  }
  return [current, set] as const
}

function MultipleAccordion(props: AccordionMultipleProps) {
  const {
    items,
    className,
    ref,
    type: _type,
    keepMounted = false,
    headingLevel = 3,
    value,
    defaultValue,
    onValueChange,
    ...rest
  } = props
  const [open, setOpen] = useAccordionValue<string[]>(value, defaultValue ?? [], onValueChange)
  return (
    <AccordionPrimitive.Root
      ref={ref}
      type="multiple"
      data-slot="accordion"
      className={className}
      {...rest}
      value={open}
      onValueChange={setOpen}
    >
      {renderItems(items, open, keepMounted, headingLevel)}
    </AccordionPrimitive.Root>
  )
}

function SingleAccordion(props: AccordionSingleProps) {
  const {
    items,
    className,
    ref,
    type: _type,
    collapsible,
    keepMounted = false,
    headingLevel = 3,
    value,
    defaultValue,
    onValueChange,
    ...rest
  } = props
  const [open, setOpen] = useAccordionValue<string>(value, defaultValue ?? "", onValueChange)
  return (
    <AccordionPrimitive.Root
      ref={ref}
      type="single"
      collapsible={collapsible}
      data-slot="accordion"
      className={className}
      {...rest}
      value={open}
      onValueChange={setOpen}
    >
      {renderItems(items, open ? [open] : [], keepMounted, headingLevel)}
    </AccordionPrimitive.Root>
  )
}

function Accordion(props: AccordionProps) {
  if (props.type === "multiple") return <MultipleAccordion {...props} />
  return <SingleAccordion {...props} />
}
Accordion.displayName = "Accordion"

export { Accordion }
