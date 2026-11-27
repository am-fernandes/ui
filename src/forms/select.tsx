"use client"

import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { motionMenu } from "../overlays/_internal/animations"
import { useLayerTheme } from "../overlays/_internal/layer-theme"
import { useOverlayContainer } from "../overlays/_internal/overlay-container"
import { useComposedRefs } from "../primitives/_internal/compose-refs"
import type { ControlSize } from "../primitives/_internal/control-size"
import {
  FieldShell,
  type LabelPosition,
  fieldReadOnlyClass,
  fieldTriggerSizeClass,
} from "../primitives/_internal/field-shell"
import { useFieldIds } from "../primitives/_internal/use-field-ids"

export interface SelectOption {
  /** Sent in forms and to `onValueChange`. Not empty: "" means no choice. */
  value: string
  label: string
  disabled?: boolean
}

export interface SelectGroup {
  label: string
  options: SelectOption[]
}

export interface SelectLabels {
  /** Shown in the trigger while nothing is chosen. */
  placeholder: string
}

export const defaultSelectLabels: SelectLabels = {
  placeholder: "Selecione…",
}

export interface SelectProps {
  /** Options, or groups of options with a heading. Up to about 15: past that, use Combobox. */
  options: Array<SelectOption | SelectGroup>
  /** Chosen value; `""` shows the placeholder. */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Shown while nothing is chosen. Overrides `labels.placeholder`. */
  placeholder?: string
  labels?: Partial<SelectLabels>
  label?: React.ReactNode
  labelPosition?: LabelPosition
  description?: React.ReactNode
  error?: string
  required?: boolean
  disabled?: boolean
  /** The value shows and can be copied, but the list does not open. */
  readOnly?: boolean
  /** Height of the trigger, the same as an Input of that size. @default "md" */
  size?: ControlSize
  /** Field name: a native `<select>` carries the value in `FormData`. */
  name?: string
  /** Id of a `<form>` elsewhere in the page that the value belongs to. */
  form?: string
  id?: string
  /** Name for a select with no visible `label`. */
  "aria-label"?: string
  "aria-describedby"?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Class of the trigger. */
  className?: string
  /** Class of the field (label, trigger, description, error). */
  wrapperClassName?: string
  /** Class of the list. */
  contentClassName?: string
  onBlur?: React.FocusEventHandler<HTMLButtonElement>
  /** The trigger button. */
  ref?: React.Ref<HTMLButtonElement>
}

function isGroup(entry: SelectOption | SelectGroup): entry is SelectGroup {
  return "options" in entry
}

// The list's look is the DropdownMenu's: same panel, rows, motion and
// highlighted row (hover layer for the pointer, inset ring for the keyboard,
// system highlight in forced colours).
const contentClass = cn(
  "relative z-(--z-popover) min-w-[max(8rem,var(--radix-select-trigger-width))] max-w-(--radix-select-content-available-width) overflow-hidden",
  "max-h-(--radix-select-content-available-height) rounded-container border border-border-strong bg-popover text-popover-foreground outline-none",
  "origin-(--radix-select-content-transform-origin)",
  motionMenu,
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
)

const rowClass = cn(
  "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-element py-1.5 pr-2 pl-8 text-left text-sm outline-none transition-colors",
  "data-highlighted:state-hover in-data-[modality=keyboard]:data-highlighted:focus-outline-inset",
  "forced-colors:data-highlighted:bg-[Highlight] forced-colors:data-highlighted:text-[HighlightText]",
  "data-disabled:pointer-events-none data-disabled:opacity-50",
)

const scrollButtonClass =
  "flex h-6 cursor-default items-center justify-center text-muted-foreground [&_svg]:size-4"

function OptionRow({ option }: { option: SelectOption }) {
  return (
    <SelectPrimitive.Item
      value={option.value}
      disabled={option.disabled}
      textValue={option.label}
      data-slot="select-item"
      className={rowClass}
    >
      {/* The chosen option is marked by a check, not by colour alone. */}
      <span className="absolute left-2 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check aria-hidden="true" className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function Select({
  options,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  placeholder,
  labels: labelsProp,
  label,
  labelPosition,
  description,
  error,
  required,
  disabled,
  readOnly = false,
  size = "md",
  name,
  form,
  id,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className,
  wrapperClassName,
  contentClassName,
  onBlur,
  ref,
}: SelectProps) {
  const labels = { ...defaultSelectLabels, ...labelsProp }
  const ids = useFieldIds(id)
  const container = useOverlayContainer()
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  // Opened from a dark part of the page, the list is dark too.
  const theme = useLayerTheme()
  const composedRef = useComposedRefs(triggerRef, theme.anchorRef, ref)

  // Value and open state are always handed to Radix as controlled, so a
  // read-only select can refuse a change (Radix also changes the value from
  // typeahead on the closed trigger).
  const [innerValue, setInnerValue] = React.useState(defaultValue)
  const controlled = valueProp !== undefined
  const value = controlled ? valueProp : innerValue
  const [innerOpen, setInnerOpen] = React.useState(defaultOpen)
  const open = readOnly ? false : (openProp ?? innerOpen)

  const changeValue = (next: string) => {
    if (readOnly || disabled) return
    if (!controlled) setInnerValue(next)
    onValueChange?.(next)
  }
  const changeOpen = (next: boolean) => {
    if (readOnly && next) return
    if (openProp === undefined) setInnerOpen(next)
    onOpenChange?.(next)
  }

  // A form reset puts the native select back without a change event, and
  // to its first option: a controlled <select> has no default option for the
  // browser to return to. The listener runs before the reset itself (React
  // even re-renders in between), so the sync waits for it to finish: the
  // default value when uncontrolled, the current `value` when controlled.
  const nativeRef = React.useRef<HTMLSelectElement>(null)
  const latest = React.useRef({ defaultValue, value, controlled })
  latest.current = { defaultValue, value, controlled }
  React.useEffect(() => {
    const owner = nativeRef.current?.form
    if (!owner) return
    let timer: number | undefined
    const reset = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        const { defaultValue: initial, value: current, controlled: isControlled } = latest.current
        const next = isControlled ? current : initial
        if (!isControlled) setInnerValue(initial)
        if (nativeRef.current) nativeRef.current.value = next
      })
    }
    owner.addEventListener("reset", reset)
    return () => {
      window.clearTimeout(timer)
      owner.removeEventListener("reset", reset)
    }
  }, [])

  const flatOptions = options.flatMap((entry) => (isGroup(entry) ? entry.options : [entry]))

  const hasDescription = description != null && description !== ""
  const hasError = error != null && error !== ""
  const modality = React.useRef<"keyboard" | "pointer">("pointer")
  const mark = (next: "keyboard" | "pointer") => (event: React.SyntheticEvent<HTMLElement>) => {
    modality.current = next
    event.currentTarget.setAttribute("data-modality", next)
  }

  return (
    <FieldShell
      controlId={ids.controlId}
      labelId={ids.labelId}
      descriptionId={ids.descriptionId}
      errorId={ids.errorId}
      label={label}
      description={description}
      error={error}
      labelPosition={labelPosition}
      required={required}
      // The trigger carries aria-required: the label draws only the asterisk.
      nativeRequired
      disabled={disabled}
      size={size}
      className={wrapperClassName}
    >
      <SelectPrimitive.Root
        value={value}
        onValueChange={changeValue}
        open={open}
        onOpenChange={changeOpen}
        disabled={disabled}
      >
        <div className="relative" data-slot="select-control">
          <SelectPrimitive.Trigger
            ref={composedRef}
            id={ids.controlId}
            data-slot="select-trigger"
            data-readonly={readOnly ? "" : undefined}
            aria-label={ariaLabel}
            aria-invalid={hasError ? true : undefined}
            aria-required={required ? true : undefined}
            aria-readonly={readOnly ? true : undefined}
            aria-describedby={ids.describedBy(
              { description: hasDescription, error: hasError },
              ariaDescribedBy,
            )}
            onBlur={onBlur}
            className={cn(
              fieldTriggerSizeClass(size),
              "justify-between overflow-hidden data-placeholder:text-placeholder",
              hasError && "border-destructive-text field-error",
              fieldReadOnlyClass,
              readOnly && "cursor-default",
              className,
            )}
          >
            <span className="min-w-0 flex-1 truncate text-left">
              {/* Read-only, no "Selecione...": nothing is chosen here, and the
                  hint would be drawn on the muted fill below 4.5:1. */}
              <SelectPrimitive.Value
                placeholder={readOnly ? "" : (placeholder ?? labels.placeholder)}
              />
            </span>
            <SelectPrimitive.Icon asChild>
              <ChevronDown aria-hidden="true" className="opacity-50" />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>
          {/* The form's copy of the value. Radix's own hidden select (only
            rendered inside a form) gets no name: with nothing chosen the
            browser selects its first option, and a reset desyncs it. Here an
            empty, disabled option stands for "nothing chosen", so the field
            sends nothing and `required` is checked by the browser. It sits
            over the trigger, so the browser's validation bubble points there,
            and gives focus to the trigger. */}
          {name || required || form ? (
            <select
              ref={nativeRef}
              aria-hidden="true"
              tabIndex={-1}
              data-slot="select-native"
              name={name}
              form={form}
              required={required}
              disabled={disabled}
              value={value}
              onChange={(event) => changeValue(event.target.value)}
              onFocus={() => triggerRef.current?.focus()}
              className="pointer-events-none absolute inset-0 size-full opacity-0"
            >
              <option value="" disabled hidden />
              {value !== "" && !flatOptions.some((option) => option.value === value) ? (
                <option value={value} hidden />
              ) : null}
              {flatOptions.map((option) => (
                <option key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : null}
        </div>
        <SelectPrimitive.Portal container={container}>
          <SelectPrimitive.Content
            ref={theme.contentRef}
            data-slot="select-content"
            data-modality={modality.current}
            onKeyDown={mark("keyboard")}
            onPointerMove={mark("pointer")}
            position="popper"
            sideOffset={4}
            collisionPadding={8}
            className={cn(contentClass, theme.className, contentClassName)}
          >
            <SelectPrimitive.ScrollUpButton className={scrollButtonClass}>
              <ChevronUp aria-hidden="true" />
            </SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.Viewport className="p-0.75">
              {options.map((entry, index) =>
                isGroup(entry) ? (
                  <React.Fragment key={`group-${entry.label}`}>
                    {index > 0 ? (
                      <SelectPrimitive.Separator className="-mx-1 my-1 h-px bg-border" />
                    ) : null}
                    <SelectPrimitive.Group data-slot="select-group">
                      <SelectPrimitive.Label className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        {entry.label}
                      </SelectPrimitive.Label>
                      {entry.options.map((option) => (
                        <OptionRow key={option.value} option={option} />
                      ))}
                    </SelectPrimitive.Group>
                  </React.Fragment>
                ) : (
                  <OptionRow key={entry.value} option={entry} />
                ),
              )}
            </SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton className={scrollButtonClass}>
              <ChevronDown aria-hidden="true" />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </FieldShell>
  )
}

Select.displayName = "Select"

export { Select }
