"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import * as React from "react"
import { type DayButton, DayPicker, type Locale, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "../primitives/button"

type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
  ref?: React.Ref<HTMLDivElement>
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale = ptBR,
  formatters,
  components,
  ref,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()

  const memoizedComponents = React.useMemo(
    () => ({
      Root: ({
        className,
        rootRef,
        ...rootProps
      }: React.ComponentProps<"div"> & {
        rootRef?: React.Ref<HTMLDivElement>
      }) => (
        <div
          data-slot="calendar"
          ref={(node) => {
            if (typeof rootRef === "function") rootRef(node)
            else if (rootRef)
              (rootRef as React.MutableRefObject<HTMLDivElement | null>).current = node
            if (typeof ref === "function") ref(node)
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
          }}
          className={cn(className)}
          {...rootProps}
        />
      ),
      Chevron: ({
        className,
        orientation,
      }: {
        className?: string
        orientation?: "left" | "right" | "up" | "down"
      }) => {
        if (orientation === "left")
          return <ChevronLeftIcon aria-hidden="true" className={cn("size-4", className)} />
        if (orientation === "right")
          return <ChevronRightIcon aria-hidden="true" className={cn("size-4", className)} />
        return <ChevronDownIcon aria-hidden="true" className={cn("size-4", className)} />
      },
      DayButton: (dayButtonProps: React.ComponentProps<typeof DayButton>) => (
        <CalendarDayButton locale={locale} {...dayButtonProps} />
      ),
    }),
    [locale, ref],
  )

  return (
    <DayPicker
      data-slot="calendar"
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar bg-background p-2 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(7)]",
        className,
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption,
        ),
        caption_label: cn("text-sm font-medium select-none", defaultClassNames.caption_label),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none",
          defaultClassNames.weekday,
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        day: cn(
          "group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius) [&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)",
          defaultClassNames.day,
        ),
        range_start: cn(
          "relative isolate z-0 rounded-l-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-muted",
          defaultClassNames.range_start,
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn(
          "relative isolate z-0 rounded-r-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-muted",
          defaultClassNames.range_end,
        ),
        today: cn(
          "rounded-(--cell-radius) bg-muted text-foreground data-[selected=true]:rounded-none",
          defaultClassNames.today,
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside,
        ),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        ...memoizedComponents,
        ...components,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

type CalendarDayButtonProps = React.ComponentProps<typeof DayButton> & {
  locale?: Partial<Locale>
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale: _locale,
  ...props
}: CalendarDayButtonProps) {
  const defaultClassNames = getDefaultClassNames()
  const isOutside = !!modifiers.outside

  return (
    <Button
      variant="ghost"
      size="icon"
      data-slot="calendar-day-button"
      {...(!isOutside && { "data-day": format(day.date, "yyyy-MM-dd") })}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal",
        "data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground",
        "data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground",
        "data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground",
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground",
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  )
}
CalendarDayButton.displayName = "CalendarDayButton"

export { Calendar, CalendarDayButton }
