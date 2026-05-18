"use client"

import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"
import type * as React from "react"

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

type AccordionSingleProps = Omit<
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>,
  "children" | "type"
> & {
  type?: "single"
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  collapsible?: boolean
  items: AccordionItemData[]
  ref?: React.Ref<AccordionRootRef>
}

type AccordionMultipleProps = Omit<
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>,
  "children" | "type"
> & {
  type: "multiple"
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  items: AccordionItemData[]
  ref?: React.Ref<AccordionRootRef>
}

export type AccordionProps = AccordionSingleProps | AccordionMultipleProps

function renderItems(items: AccordionItemData[]) {
  return items.map((item, i) => {
    // AccordionItemData does not carry an id; prefer the (required) `value`
    // and fall back to a positional key derived from the string title.
    const key =
      typeof item.value === "string" && item.value
        ? item.value
        : `${i}-${typeof item.title === "string" ? item.title : ""}`
    return (
      <AccordionPrimitive.Item
        key={key}
        value={item.value}
        disabled={item.disabled}
        data-slot="accordion-item"
        className="border-b last:border-b-0"
      >
        <AccordionPrimitive.Header data-slot="accordion-header" className="flex items-center">
          <AccordionPrimitive.Trigger
            data-slot="accordion-trigger"
            className={cn(
              "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left cursor-pointer [&[data-state=open]>svg]:rotate-180",
            )}
          >
            {item.title}
            <ChevronDown
              data-slot="accordion-chevron"
              className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200"
            />
          </AccordionPrimitive.Trigger>
          {item.action ? (
            <div data-slot="accordion-action" className="ml-2">
              {item.action}
            </div>
          ) : null}
        </AccordionPrimitive.Header>
        <AccordionPrimitive.Content
          data-slot="accordion-content"
          className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
        >
          <div className="pb-4 pt-0">{item.content}</div>
        </AccordionPrimitive.Content>
      </AccordionPrimitive.Item>
    )
  })
}

function Accordion(props: AccordionProps) {
  if (props.type === "multiple") {
    const { items, className, ref, type: _type, ...rest } = props
    return (
      <AccordionPrimitive.Root
        ref={ref}
        type="multiple"
        data-slot="accordion"
        className={className}
        {...rest}
      >
        {renderItems(items)}
      </AccordionPrimitive.Root>
    )
  }

  const { items, className, ref, type: _type, collapsible, ...rest } = props
  return (
    <AccordionPrimitive.Root
      ref={ref}
      type="single"
      collapsible={collapsible}
      data-slot="accordion"
      className={className}
      {...rest}
    >
      {renderItems(items)}
    </AccordionPrimitive.Root>
  )
}
Accordion.displayName = "Accordion"

export { Accordion }
