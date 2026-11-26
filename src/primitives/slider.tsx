"use client"

import * as SliderPrimitive from "@radix-ui/react-slider"
import * as React from "react"

import { cn } from "@/lib/utils"
import { useComposedRefs } from "./_internal/compose-refs"
import { useFieldIds } from "./_internal/use-field-ids"

export interface SliderLabels {
  /** Added to the name of the first thumb of a range ("Preço mínimo"). */
  min: string
  /** Added to the name of the second thumb of a range ("Preço máximo"). */
  max: string
}

export const defaultSliderLabels: SliderLabels = {
  min: "mínimo",
  max: "máximo",
}

export interface SliderMark {
  value: number
  /** Text under the tick. Without it, only the tick shows. */
  label?: string
}

interface SliderBaseProps {
  label?: React.ReactNode
  /** Name for a slider with no visible `label`. */
  "aria-label"?: string
  description?: React.ReactNode
  error?: string
  disabled?: boolean
  /** @default 0 */
  min?: number
  /** @default 100 */
  max?: number
  /** @default 1 */
  step?: number
  /** Shows the current value (or range) next to the label, formatted by `formatValue`. */
  showValue?: boolean
  /**
   * Text of a value: next to the label with `showValue`, and what a screen
   * reader says for each thumb. Defaults to the Brazilian number format
   * ("1.250", "2,5").
   */
  formatValue?: (value: number) => string
  /** Ticks under the track, with optional labels (`[0, 50, 100]` or `{ value, label }`). */
  marks?: Array<number | SliderMark>
  /** Field name: a hidden input per thumb carries the value (a range sends the name twice). */
  name?: string
  form?: string
  labels?: Partial<SliderLabels>
  id?: string
  /** Class of the field (label, track, marks, messages). */
  className?: string
  ref?: React.Ref<HTMLSpanElement>
}

export interface SliderSingleProps extends SliderBaseProps {
  range?: false
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** Called when a drag or a key press ends, with the final value. */
  onValueCommit?: (value: number) => void
}

export interface SliderRangeProps extends SliderBaseProps {
  /** Two thumbs: a minimum and a maximum. */
  range: true
  value?: [number, number]
  defaultValue?: [number, number]
  onValueChange?: (value: [number, number]) => void
  onValueCommit?: (value: [number, number]) => void
  /** Steps the two thumbs keep between them. @default 0 */
  minStepsBetweenThumbs?: number
}

export type SliderProps = SliderSingleProps | SliderRangeProps

function decimalsOf(n: number): number {
  const text = String(n)
  const dot = text.indexOf(".")
  return dot === -1 ? 0 : text.length - dot - 1
}

// Thumbs are 24px; Radix keeps them inside the track, so a value's thumb
// centre is 12px in from each end. Marks use the same inset to line up.
const THUMB_HALF = 12

function Slider(props: SliderProps) {
  const {
    label,
    "aria-label": ariaLabel,
    description,
    error,
    disabled,
    min = 0,
    max = 100,
    step = 1,
    showValue = false,
    formatValue,
    marks,
    name,
    form,
    labels: labelsProp,
    id,
    className,
    ref,
  } = props
  const range = props.range === true
  const labels = { ...defaultSliderLabels, ...labelsProp }
  const ids = useFieldIds(id)
  const rootRef = React.useRef<HTMLSpanElement>(null)
  const composedRef = useComposedRefs(rootRef, ref)

  const fallback = React.useMemo(() => {
    const f = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: decimalsOf(step) })
    return (value: number) => f.format(value)
  }, [step])
  const format = formatValue ?? fallback

  const initial = (): number[] => {
    if (range) return props.defaultValue ?? [min, max]
    return [props.defaultValue ?? min]
  }
  const [innerValues, setInnerValues] = React.useState<number[]>(initial)
  const controlled = props.value !== undefined
  const values: number[] = controlled
    ? range
      ? (props.value as [number, number])
      : [props.value as number]
    : innerValues

  const toOutside = (next: number[]) => (range ? [next[0], next[1]] : next[0])
  const change = (next: number[]) => {
    if (!controlled) setInnerValues(next)
    ;(props.onValueChange as ((value: unknown) => void) | undefined)?.(toOutside(next))
  }
  const commit = (next: number[]) =>
    (props.onValueCommit as ((value: unknown) => void) | undefined)?.(toOutside(next))

  // A form reset puts the hidden inputs back without telling Radix; after
  // the reset, the thumbs go back to the default (when uncontrolled).
  const initialRef = React.useRef(initial)
  initialRef.current = initial
  React.useEffect(() => {
    const owner = form ? document.getElementById(form) : rootRef.current?.closest("form")
    if (!(owner instanceof HTMLFormElement) || controlled) return
    let timer: number | undefined
    const reset = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setInnerValues(initialRef.current()))
    }
    owner.addEventListener("reset", reset)
    return () => {
      window.clearTimeout(timer)
      owner.removeEventListener("reset", reset)
    }
  }, [form, controlled])

  const hasLabel = label != null && label !== ""
  const hasDescription = description != null && description !== ""
  const hasError = error != null && error !== ""
  const describedBy = ids.describedBy({ description: hasDescription, error: hasError })
  const shown = values.map(format).join(" – ")
  const markList = (marks ?? []).map((mark) => (typeof mark === "number" ? { value: mark } : mark))
  const percent = (value: number) => ((value - min) / (max - min || 1)) * 100

  const thumbName = (index: number) => {
    // A thumb is a <span role="slider">: a <label for> cannot name it, so
    // the visible label is referenced, plus "mínimo"/"máximo" for a range.
    const extra = range ? `${ids.controlId}-thumb-${index}` : null
    if (hasLabel) {
      return {
        "aria-labelledby": [ids.labelId, extra].filter(Boolean).join(" "),
        "aria-label": range ? (index === 0 ? labels.min : labels.max) : undefined,
      }
    }
    return {
      "aria-label": range
        ? `${ariaLabel ?? ""} ${index === 0 ? labels.min : labels.max}`.trim()
        : ariaLabel,
    }
  }

  return (
    <div
      data-slot="slider-field"
      data-disabled={disabled ? "true" : undefined}
      className={cn("flex w-full flex-col gap-1.5", disabled && "opacity-50", className)}
    >
      {hasLabel || showValue ? (
        <div className="flex items-baseline justify-between gap-3">
          {hasLabel ? (
            <span
              id={ids.labelId}
              data-slot="slider-label"
              className="text-sm font-medium leading-5"
            >
              {label}
            </span>
          ) : (
            <span />
          )}
          {showValue ? (
            // The thumbs already say their value; this is for the eye.
            <span
              data-slot="slider-value"
              aria-hidden="true"
              // Text of an inactive control (WCAG 1.4.3 exception), dimmed
              // with it; this is how axe knows.
              aria-disabled={disabled ? true : undefined}
              className="text-sm tabular-nums text-foreground"
            >
              {shown}
            </span>
          ) : null}
        </div>
      ) : null}
      {range ? (
        <span hidden>
          <span id={`${ids.controlId}-thumb-0`}>{labels.min}</span>
          <span id={`${ids.controlId}-thumb-1`}>{labels.max}</span>
        </span>
      ) : null}
      <SliderPrimitive.Root
        ref={composedRef}
        data-slot="slider"
        value={values}
        onValueChange={change}
        onValueCommit={commit}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        form={form}
        minStepsBetweenThumbs={
          range ? (props as SliderRangeProps).minStepsBetweenThumbs : undefined
        }
        className="relative flex h-6 w-full touch-none select-none items-center data-disabled:cursor-default"
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          // The field-border colour: the track's ends read at 3:1 against the surface.
          className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-input forced-colors:border forced-colors:border-[CanvasText]"
        >
          <SliderPrimitive.Range
            data-slot="slider-range"
            className="absolute h-full bg-primary forced-colors:bg-[Highlight]"
          />
        </SliderPrimitive.Track>
        {values.map((value, index) => (
          <SliderPrimitive.Thumb
            // biome-ignore lint/suspicious/noArrayIndexKey: a thumb is its position (first, second).
            key={index}
            id={index === 0 ? ids.controlId : undefined}
            data-slot="slider-thumb"
            name={name}
            {...thumbName(index)}
            aria-valuetext={format(value)}
            aria-describedby={describedBy}
            aria-invalid={hasError ? true : undefined}
            // Radix only drops the tab stop; this tells a screen reader why.
            aria-disabled={disabled ? true : undefined}
            className={cn(
              "block size-6 cursor-grab rounded-full border-2 border-primary bg-card transition-[box-shadow] active:cursor-grabbing",
              "focus-visible:focus-outline data-disabled:cursor-default",
              hasError && "border-destructive-text",
              "forced-colors:border-[CanvasText] forced-colors:bg-[Canvas]",
            )}
          />
        ))}
      </SliderPrimitive.Root>
      {markList.length > 0 ? (
        <div
          aria-hidden="true"
          data-slot="slider-marks"
          className="relative h-5"
          style={{ marginInline: THUMB_HALF }}
        >
          {markList.map((mark) => {
            const at = percent(mark.value)
            const edge = at <= 0 ? "start" : at >= 100 ? "end" : "middle"
            return (
              <div
                key={mark.value}
                data-slot="slider-mark"
                className="absolute top-0"
                style={{ left: `${at}%` }}
              >
                <span className="absolute top-0 h-1.5 w-px -translate-x-1/2 bg-input forced-colors:bg-[CanvasText]" />
                {mark.label ? (
                  <span
                    className={cn(
                      "absolute top-2 whitespace-nowrap text-xs text-muted-foreground",
                      // The end labels line up with the ends of the track.
                      edge === "middle" && "-translate-x-1/2",
                      edge === "end" && "-translate-x-full",
                    )}
                    style={
                      edge === "start"
                        ? { left: -THUMB_HALF }
                        : edge === "end"
                          ? { left: THUMB_HALF }
                          : undefined
                    }
                  >
                    {mark.label}
                  </span>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : null}
      {hasDescription ? (
        <p
          id={ids.descriptionId}
          data-slot="field-description"
          className="text-xs text-muted-foreground"
        >
          {description}
        </p>
      ) : null}
      {hasError ? (
        <p
          id={ids.errorId}
          data-slot="field-error"
          role="alert"
          className="text-xs text-destructive-text"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}

Slider.displayName = "Slider"

export { Slider }
