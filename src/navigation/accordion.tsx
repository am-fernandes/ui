"use client"

import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

export interface AccordionItemData {
  value: string
  title: React.ReactNode
  content: React.ReactNode
  disabled?: boolean
}

type AccordionBase = Omit<
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>,
  "children" | "type"
>

export type AccordionProps =
  | (AccordionBase & {
      type?: "single"
      items: AccordionItemData[]
      collapsible?: boolean
    })
  | (AccordionBase & {
      type: "multiple"
      items: AccordionItemData[]
    })

const Accordion = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Root>,
  AccordionProps
>(({ items, className, ...props }, ref) => (
  <AccordionPrimitive.Root
    ref={ref}
    data-slot="accordion"
    className={className}
    // biome-ignore lint/suspicious/noExplicitAny: Radix Root has a discriminated union over `type`; forwarding the narrowed AccordionProps requires bypassing the narrowing here.
    {...(props as any)}
  >
    {items.map((item) => (
      <AccordionPrimitive.Item
        key={item.value}
        value={item.value}
        disabled={item.disabled}
        data-slot="accordion-item"
        className="border-b"
      >
        <AccordionPrimitive.Header className="flex">
          <AccordionPrimitive.Trigger
            data-slot="accordion-trigger"
            className={cn(
              "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left cursor-pointer [&[data-state=open]>svg]:rotate-180",
            )}
          >
            {item.title}
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
          </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
        <AccordionPrimitive.Content
          data-slot="accordion-content"
          className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
        >
          <div className="pb-4 pt-0">{item.content}</div>
        </AccordionPrimitive.Content>
      </AccordionPrimitive.Item>
    ))}
  </AccordionPrimitive.Root>
))
Accordion.displayName = "Accordion"

export { Accordion }
