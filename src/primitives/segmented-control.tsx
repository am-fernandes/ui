"use client"

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Tooltip } from "../overlays/tooltip"
import { useComposedRefs } from "./_internal/compose-refs"
import { type ControlSize, controlHeight } from "./_internal/control-size"
import type { LabelPosition } from "./_internal/field-shell"
import { Label } from "./_internal/label"
import { useControllableState } from "./_internal/use-controllable-state"
import { useFieldIds } from "./_internal/use-field-ids"
import { useFormReset } from "./_internal/use-form-reset"

// Horizontal padding and text of a segment. The height comes from the track
// (the control height minus its 4px of padding on each side).
const segmentSize: Record<ControlSize, { text: string; iconOnly: string }> = {
  sm: { text: "px-2.5 text-xs", iconOnly: "px-1.5" },
  md: { text: "px-3 text-sm", iconOnly: "px-2" },
  lg: { text: "px-4 text-sm", iconOnly: "px-2.5" },
}

// A label beside the track (`labelPosition="left"`): its 20px line centred
// on the track of the size.
const labelBesideTrack: Record<ControlSize, string> = {
  sm: "pt-1.5",
  md: "pt-2.5",
  lg: "pt-3",
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

export interface SegmentedControlProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "defaultValue" | "onChange" | "children" | "dir"
  > {
  /** 2–5 mutually exclusive options, always visible. */
  options: SegmentedControlOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /**
   * Name of the group ("Visualização", "Período"). By default it is not drawn
   * (`labelPosition="hidden"`): the options are expected to make sense on
   * their own next to the content they control. In a form, draw it with
   * `labelPosition="up"` or `"left"`.
   */
  label: string
  /** Where the label goes. @default "hidden" */
  labelPosition?: LabelPosition
  /** Help text under the control, read with the group. */
  description?: React.ReactNode
  /** Error message under the control: marks the group invalid and is read with it. */
  error?: string
  /** Classes for the field around the control, label and messages. */
  fieldClassName?: string
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
 * Built on Radix RadioGroup: `role="radiogroup"`, the four arrow keys move and select,
 * one Tab stop for the whole group.
 */
function SegmentedControl({
  options,
  value: valueProp,
  defaultValue,
  onValueChange,
  label,
  labelPosition = "hidden",
  description,
  error,
  fieldClassName,
  id,
  "aria-describedby": describedBy,
  size = "md",
  fill = false,
  iconOnly = false,
  disabled,
  name,
  required,
  className,
  ref,
  ...props
}: SegmentedControlProps) {
  const ids = useFieldIds(id)
  const hasDescription = description != null && description !== ""
  const hasError = error != null && error !== ""
  const showLabel = labelPosition !== "hidden"
  // Nothing drawn around the control: the field takes no box of its own
  // (`contents`), so the control sits in its parent's layout as if alone (a
  // toolbar, `ml-auto` in its `className`) and still does when an error
  // shows up later, with no remount.
  const drawsSomething = showLabel || hasDescription || hasError
  // `null`: no segment chosen (Radix takes `undefined` as "uncontrolled").
  // Going back to it on a reset is not reported: `onValueChange` only ever
  // receives an option.
  const [value, setValue] = useControllableState<string | null>(
    valueProp,
    defaultValue ?? null,
    (next) => {
      if (next != null) onValueChange?.(next)
    },
  )
  // A form reset brings back the choice the control was created with.
  const initialValue = React.useRef(value)
  const [node, setNode] = React.useState<HTMLDivElement | null>(null)
  const composedRef = useComposedRefs(ref, setNode)
  useFormReset(node, () => setValue(initialValue.current))

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

  const control = (
    <RadioGroupPrimitive.Root
      {...props}
      id={ids.controlId}
      onKeyDownCapture={(event) => {
        if (ARROW_KEYS.has(event.key)) lastArrowAt.current = performance.now()
      }}
      ref={composedRef}
      data-slot="segmented-control"
      // Drawn, the label names the group; hidden, it is the group's name.
      aria-label={showLabel ? undefined : label}
      aria-labelledby={showLabel ? ids.labelId : props["aria-labelledby"]}
      aria-describedby={ids.describedBy(
        { description: hasDescription, error: hasError },
        describedBy,
      )}
      aria-invalid={hasError ? true : undefined}
      value={value}
      onValueChange={setValue}
      disabled={disabled}
      // Radix disables each segment; the group says it too.
      aria-disabled={disabled || undefined}
      name={name}
      required={required}
      // No `orientation`: with one, Radix drops the arrows of the other axis,
      // and a radio group answers to all four.
      loop
      className={cn(
        // The track has the control height; the segments stretch to fill it.
        "items-stretch gap-1 rounded-track bg-muted p-1 text-muted-foreground",
        // On paper the track and the chosen segment keep their fills.
        "[print-color-adjust:exact] forced-colors:border forced-colors:border-[ButtonText]",
        controlHeight[size],
        fill ? "flex w-full" : "inline-flex max-w-full",
        // Disabled dims once: here when the control is alone, on the field
        // when it has a label or messages.
        disabled && !drawsSomething && "opacity-50",
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
              // Forced colours drop the fills: the chosen segment takes the
              // system's selection colours, as they are (no page-coloured
              // plate behind its text).
              "forced-colors:data-[state=checked]:bg-[Highlight] forced-colors:data-[state=checked]:text-[HighlightText] forced-colors:data-[state=checked]:forced-color-adjust-none",
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

  return (
    <div
      data-slot="segmented-control-field"
      data-label-position={labelPosition}
      className={cn(
        !drawsSomething && "contents",
        drawsSomething &&
          (labelPosition === "left" ? "flex items-start gap-3" : "flex flex-col gap-1.5"),
        drawsSomething && (fill ? "w-full" : "max-w-full"),
        disabled && drawsSomething && "opacity-50",
        fieldClassName,
      )}
    >
      {showLabel ? (
        <Label
          as="span"
          id={ids.labelId}
          required={required}
          className={cn(labelPosition === "left" && cn("shrink-0", labelBesideTrack[size]))}
        >
          {label}
        </Label>
      ) : null}
      <div
        className={cn(
          drawsSomething ? "flex min-w-0 flex-col gap-1.5" : "contents",
          drawsSomething && fill && "w-full",
        )}
      >
        {control}
        {hasDescription ? (
          <p id={ids.descriptionId} className="text-xs text-muted-foreground">
            {description}
          </p>
        ) : null}
        {hasError ? (
          <p id={ids.errorId} role="alert" className="text-xs text-destructive-text">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  )
}

SegmentedControl.displayName = "SegmentedControl"

export { SegmentedControl }
