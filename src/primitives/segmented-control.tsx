"use client"

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Tooltip } from "../overlays/tooltip"
import { type ControlSize, controlHeight } from "./_internal/control-size"

// Horizontal padding and text of a segment. The height comes from the track
// (the control height minus its 4px of padding on each side).
const segmentSize: Record<ControlSize, { text: string; iconOnly: string }> = {
  sm: { text: "px-2.5 text-xs", iconOnly: "px-1.5" },
  md: { text: "px-3 text-sm", iconOnly: "px-2" },
  lg: { text: "px-4 text-sm", iconOnly: "px-2.5" },
}

const ARROW_KEYS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"])
/** How long after an arrow keydown a focus change still counts as arrow navigation. */
const ARROW_FOCUS_WINDOW_MS = 500

export interface SegmentedControlOption {
  value: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  disabled?: boolean
}

export interface SegmentedControlProps {
  /** 2–5 mutually exclusive options, always visible. */
  options: SegmentedControlOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /**
   * Accessible name of the group ("Visualização", "Período"). Not rendered —
   * the options are expected to make sense on their own next to the content
   * they control.
   */
  label: string
  /**
   * `sm` 32px, `md` 40px, `lg` 44px: the height of the whole track, the same
   * as a `Button` or an `Input` of that size. @default "md"
   */
  size?: ControlSize
  /** Stretch the segments equally to fill the container. */
  fill?: boolean
  /** Show only the icons; each label becomes the accessible name and a tooltip. */
  iconOnly?: boolean
  disabled?: boolean
  /** Form field name. Renders a hidden input, so the choice is submitted with the form. */
  name?: string
  required?: boolean
  className?: string
  ref?: React.Ref<HTMLDivElement>
}

/**
 * A row of mutually exclusive options with exactly one selected — an input,
 * not navigation. Use it to switch how the same content is shown ("Lista |
 * Grade", "Dia | Semana | Mês") or as a compact choice in a form. For
 * switching between different panels of content use `Tabs`; for an
 * independent on/off use `Toggle`.
 *
 * Built on Radix RadioGroup: `role="radiogroup"`, arrow keys move and select,
 * one Tab stop for the whole group.
 */
function SegmentedControl({
  options,
  value,
  defaultValue,
  onValueChange,
  label,
  size = "md",
  fill = false,
  iconOnly = false,
  disabled,
  name,
  required,
  className,
  ref,
}: SegmentedControlProps) {
  // Radix selects the focused radio only if the arrow key is *still down*
  // when its deferred focus lands. A short tap on a busy page can release the
  // key first, leaving focus on an unselected segment. Remember when an arrow
  // was pressed instead, and select whatever receives focus right after.
  const lastArrowAt = React.useRef(Number.NEGATIVE_INFINITY)
  // Whether Radix is going to select on that focus. It tracks the arrow keys
  // with keydown and keyup on the document; this mirrors it with the same
  // events, so exactly one of the two selects. Both selecting would report
  // the same change twice to a controlled parent, whose value only changes
  // on its next render.
  const isArrowHeld = React.useRef(false)
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (ARROW_KEYS.has(event.key)) isArrowHeld.current = true
    }
    const onKeyUp = () => {
      isArrowHeld.current = false
    }
    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("keyup", onKeyUp)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("keyup", onKeyUp)
    }
  }, [])

  return (
    <RadioGroupPrimitive.Root
      onKeyDownCapture={(event) => {
        if (ARROW_KEYS.has(event.key)) lastArrowAt.current = performance.now()
      }}
      ref={ref}
      data-slot="segmented-control"
      aria-label={label}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      name={name}
      required={required}
      orientation="horizontal"
      loop
      className={cn(
        // The track has the control height; the segments stretch to fill it.
        "items-stretch gap-1 rounded-element bg-muted p-1 text-muted-foreground",
        controlHeight[size],
        fill ? "flex w-full" : "inline-flex max-w-full",
        disabled && "opacity-50",
        className,
      )}
    >
      {options.map((option) => {
        const Icon = option.icon
        const item = (
          <RadioGroupPrimitive.Item
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            aria-label={iconOnly ? option.label : undefined}
            data-slot="segmented-control-item"
            onFocus={(event) => {
              const wasArrow = performance.now() - lastArrowAt.current < ARROW_FOCUS_WINDOW_MS
              lastArrowAt.current = Number.NEGATIVE_INFINITY
              // Key still down: Radix selects on this very focus.
              if (wasArrow && !isArrowHeld.current) event.currentTarget.click()
            }}
            className={cn(
              "inline-flex min-w-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-inner font-medium transition-colors",
              "focus-visible:focus-outline data-[state=unchecked]:state-layer",
              "disabled:cursor-default",
              // One option disabled: it dims itself. The whole control
              // disabled: the track dims once, and its segments must not dim
              // again inside it (50% of 50%).
              option.disabled && !disabled && "opacity-50",
              "data-[state=checked]:bg-card data-[state=checked]:text-foreground",
              "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
              segmentSize[size].text,
              iconOnly && segmentSize[size].iconOnly,
              fill && "flex-1",
            )}
          >
            {Icon ? <Icon className="size-4" aria-hidden /> : null}
            {iconOnly ? null : <span className="truncate">{option.label}</span>}
          </RadioGroupPrimitive.Item>
        )
        return iconOnly ? (
          <Tooltip key={option.value} content={option.label}>
            {item}
          </Tooltip>
        ) : (
          item
        )
      })}
    </RadioGroupPrimitive.Root>
  )
}

SegmentedControl.displayName = "SegmentedControl"

export { SegmentedControl }
