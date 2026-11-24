"use client"

import { Command as CommandPrimitive } from "cmdk"
import { Check, ChevronsUpDown, SearchIcon, X } from "lucide-react"
import * as React from "react"

import { matchesSearch, normalizeText } from "@/lib/text"
import { cn } from "@/lib/utils"
import { Popover } from "../overlays/popover"
import {
  FieldShell,
  type LabelPosition,
  fieldTriggerClass,
} from "../primitives/_internal/field-shell"
import { useFieldIds } from "../primitives/_internal/use-field-ids"
import { Badge } from "../primitives/badge"
import { assignRef } from "./_internal/assign-ref"

const CREATE_ACTION_VALUE = "__create_action__"

// The search looks at what the user reads (the label) and at the option's
// keywords, never at `value`: with numeric ids, "10" would match id 101.
function optionMatches(option: ComboboxOption, search: string) {
  return (
    matchesSearch(option.label, search) ||
    (option.keywords ?? []).some((keyword) => matchesSearch(keyword, search))
  )
}

const countFormatter = new Intl.NumberFormat("pt-BR")

export interface ComboboxLabels {
  /** Shown instead of the empty message while `loading`. */
  loading: string
  /**
   * The line under a long list, when only the first `maxVisibleOptions`
   * matches are on screen. Receives how many are left out.
   */
  hiddenOptions: (count: number) => string
}

export const defaultComboboxLabels: ComboboxLabels = {
  loading: "Carregando…",
  hiddenOptions: (count) =>
    `${countFormatter.format(count)} ${count === 1 ? "opção a mais" : "opções a mais"}. Continue digitando para filtrar.`,
}

function toArray<T>(v: T | T[] | undefined | null): T[] {
  if (v == null) return []
  return Array.isArray(v) ? v : [v]
}

export interface ComboboxOption {
  value: string
  label: string
  disabled?: boolean
  /**
   * Other words that find this option in the search, besides its label (a
   * code, an old name, a synonym). The search never looks at `value`.
   */
  keywords?: string[]
}

interface ComboboxBaseProps {
  options: ComboboxOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
  popoverWidth?: string
  creatable?: boolean
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  labelPosition?: LabelPosition
  required?: boolean
  id?: string
  /**
   * Called with the search text as the user types (and with `""` when the
   * list closes). For a search on the server, pass the results in `options`
   * and turn the local filter off with `shouldFilter={false}`.
   */
  onSearchChange?: (search: string) => void
  /** The options are being fetched: the list says so instead of "nothing found". */
  loading?: boolean
  /**
   * `false` shows `options` exactly as given, without filtering them by the
   * search: for options that already come filtered from the server.
   * @default true
   */
  shouldFilter?: boolean
  /**
   * Most options rendered at once. With a long list only the first matches
   * are on screen (plus the chosen ones), and a line says how many were left
   * out and asks to keep typing. Opening and typing stay fast with thousands
   * of options.
   * @default 100
   */
  maxVisibleOptions?: number
  /** Texts of the list. Defaults in `defaultComboboxLabels`. */
  labels?: Partial<ComboboxLabels>
  ref?: React.Ref<HTMLButtonElement>
}

interface ComboboxSingleProps extends ComboboxBaseProps {
  multiple?: false
  value?: string
  onValueChange?: (value: string) => void
}

interface ComboboxMultipleProps extends ComboboxBaseProps {
  multiple: true
  value?: string[]
  onValueChange?: (value: string[]) => void
  maxBadges?: number
  /**
   * Hide the chip row that sits above the trigger. With many selections
   * the chips wrap and push surrounding rows around — set `false` for
   * a compact filter row where only the count in the trigger matters.
   * Defaults to `true` to preserve existing behaviour.
   */
  showBadges?: boolean
  /**
   * Override the trigger label when the user has selected at least one
   * option. Receives the current count; return the full string. Default
   * is "N selecionado" / "N selecionados". Useful for noun agreement
   * (e.g. `n => n === 1 ? "1 jornada selecionada" : ${n} jornadas selecionadas`).
   */
  selectedCountLabel?: (count: number) => string
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps

export function Combobox(props: ComboboxProps) {
  const {
    options,
    placeholder,
    searchPlaceholder,
    emptyMessage,
    disabled = false,
    className,
    popoverWidth,
    creatable = false,
    label,
    description,
    error,
    labelPosition,
    required,
    id,
    onSearchChange,
    loading = false,
    shouldFilter = true,
    maxVisibleOptions = 100,
    ref,
  } = props
  const l: ComboboxLabels = { ...defaultComboboxLabels, ...props.labels }

  const resolvedPlaceholder = placeholder ?? "Selecione..."
  const resolvedSearchPlaceholder = searchPlaceholder ?? "Buscar..."
  const resolvedEmptyMessage = emptyMessage ?? "Nenhuma opção encontrada."

  const ids = useFieldIds(id)
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const setTriggerRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node
      assignRef(ref, node)
    },
    [ref],
  )
  const listboxId = `${ids.controlId}-listbox`
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  // The highlighted option (cmdk's value), which Enter would choose.
  const [highlight, setHighlight] = React.useState("")
  const listRef = React.useRef<HTMLDivElement>(null)
  // Whether the option being chosen was clicked, not picked with Enter.
  const pickedWithPointer = React.useRef(false)
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""

  const isMultiple = props.multiple === true
  const chosen = React.useMemo(() => toArray(props.value), [props.value])

  // Labels of the options seen so far, so a choice keeps its name in the
  // trigger and chips after a server search replaces `options`.
  const seenLabels = React.useRef(new Map<string, string>())
  for (const option of options) seenLabels.current.set(option.value, option.label)
  const labelOf = (value: string) => seenLabels.current.get(value)

  const changeSearch = (next: string) => {
    setSearch(next)
    onSearchChange?.(next)
  }

  // Only the first matches are rendered: mounting thousands of options made
  // opening and every key take hundreds of milliseconds. The chosen ones are
  // always kept, so the list can open on them.
  const { visibleOptions, hiddenCount } = React.useMemo(() => {
    const matches =
      shouldFilter && search.trim() !== ""
        ? options.filter((option) => optionMatches(option, search))
        : options
    const chosenSet = new Set(chosen)
    const visible = matches.filter(
      (option, index) => index < maxVisibleOptions || chosenSet.has(option.value),
    )
    return { visibleOptions: visible, hiddenCount: matches.length - visible.length }
  }, [options, search, shouldFilter, maxVisibleOptions, chosen])

  // The list opens on the chosen option (the first one, in multiple mode),
  // so Enter right after opening keeps the value instead of taking the first
  // option of the list.
  const openList = () => {
    setHighlight(chosen[0] ?? "")
    setOpen(true)
  }

  React.useEffect(() => {
    if (!open) return
    // The options mount in the popover's portal after this render.
    const frame = requestAnimationFrame(() => {
      const list = listRef.current
      const item = list?.querySelector<HTMLElement>('[cmdk-item][aria-selected="true"]')
      if (!list || !item) return
      const listBox = list.getBoundingClientRect()
      const itemBox = item.getBoundingClientRect()
      list.scrollTop += itemBox.top - listBox.top - (listBox.height - itemBox.height) / 2
    })
    return () => cancelAnimationFrame(frame)
  }, [open])

  const handleSingleSelect = (currentValue: string) => {
    const byPointer = pickedWithPointer.current
    pickedWithPointer.current = false
    if (!isMultiple && props.onValueChange) {
      if (currentValue !== props.value) props.onValueChange(currentValue)
      // A click on the chosen option of an optional field clears it, as
      // before. Enter on it (where the list opens) and a required field keep it.
      else if (byPointer && !required) props.onValueChange("")
    }
    setOpen(false)
  }

  const handleMultipleSelect = (currentValue: string) => {
    if (isMultiple && props.onValueChange) {
      const currentValues = toArray(props.value)
      const newValues = currentValues.includes(currentValue)
        ? currentValues.filter((v) => v !== currentValue)
        : [...currentValues, currentValue]
      props.onValueChange(newValues)
    }
  }

  const handleCreate = (createdValue: string) => {
    const trimmed = createdValue.trim()
    if (!trimmed) return
    if (isMultiple) {
      if (props.onValueChange) {
        const currentValues = toArray(props.value)
        if (!currentValues.includes(trimmed)) {
          props.onValueChange([...currentValues, trimmed])
        }
      }
    } else if (props.onValueChange) {
      props.onValueChange(trimmed)
    }
    setOpen(false)
    changeSearch("")
  }

  const handleRemoveValue = (valueToRemove: string, e: React.SyntheticEvent) => {
    e.stopPropagation()
    if (isMultiple && props.onValueChange) {
      const currentValues = toArray(props.value)
      props.onValueChange(currentValues.filter((v) => v !== valueToRemove))
    }
  }

  const handleClearAll = () => {
    if (isMultiple && props.onValueChange) {
      props.onValueChange([])
    } else if (!isMultiple && props.onValueChange) {
      props.onValueChange("")
    }
    // The clear button goes away with the value: keep the focus in the field.
    triggerRef.current?.focus()
  }

  const renderTriggerContent = () => {
    if (isMultiple) {
      const values = toArray(props.value)
      if (values.length === 0) {
        return <span className="text-placeholder">{resolvedPlaceholder}</span>
      }
      const count = values.length
      const formatter = (props as ComboboxMultipleProps).selectedCountLabel
      const countText = formatter
        ? formatter(count)
        : `${count} ${count === 1 ? "selecionado" : "selecionados"}`
      return <span className="text-foreground">{countText}</span>
    }
    const selectedLabel = props.value ? labelOf(props.value) : undefined
    if (selectedLabel != null) return selectedLabel
    if (creatable && props.value) return props.value
    return <span className="text-placeholder">{resolvedPlaceholder}</span>
  }

  const trimmedSearch = search.trim()
  const showCreateOption =
    creatable &&
    trimmedSearch.length > 0 &&
    !options.some((o) => normalizeText(o.value) === normalizeText(trimmedSearch)) &&
    !options.some((o) => normalizeText(o.label) === normalizeText(trimmedSearch))

  const hasValue = isMultiple ? toArray(props.value).length > 0 : Boolean(props.value)

  const multiBadges = (() => {
    if (!isMultiple) return null
    if ((props as ComboboxMultipleProps).showBadges === false) return null
    const values = toArray(props.value)
    if (values.length === 0) return null
    const maxBadges = (props as ComboboxMultipleProps).maxBadges ?? 2
    const visibleValues = values.slice(0, maxBadges)
    const remainingCount = values.length - maxBadges
    return (
      <div className="flex flex-wrap gap-1 items-center" data-slot="combobox-badges">
        {visibleValues.map((val) => {
          const labelText = labelOf(val) || val
          return (
            <Badge
              key={val}
              variant="outline"
              className="rounded-inner px-1.5 py-0.5 font-normal bg-muted text-foreground border-border inline-flex items-center gap-1"
              aria-label={labelText}
            >
              {labelText}
              <button
                type="button"
                aria-label={`Remover ${labelText}`}
                className="rounded-inner cursor-pointer state-layer focus-visible:focus-outline"
                onClick={(e) => handleRemoveValue(val, e)}
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            </Badge>
          )
        })}
        {remainingCount > 0 ? (
          <Badge
            variant="outline"
            className="rounded-inner px-1.5 py-0.5 font-normal bg-muted text-foreground border-border"
          >
            +{remainingCount}
          </Badge>
        ) : null}
      </div>
    )
  })()

  // Clearing is a separate button next to the trigger, never inside it: a
  // control nested in a <button> is unreachable for some screen readers and
  // stays focusable while the trigger is disabled.
  const showClear = hasValue && !disabled

  const trigger = (
    <button
      type="button"
      ref={setTriggerRef}
      id={ids.controlId}
      // biome-ignore lint/a11y/useSemanticElements: combobox button pattern (WAI-ARIA listbox combobox)
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-controls={listboxId}
      aria-autocomplete="list"
      aria-invalid={hasError ? true : undefined}
      aria-describedby={ids.describedBy({ description: hasDescription, error: hasError })}
      disabled={disabled}
      className={cn(
        fieldTriggerClass,
        "w-full justify-between min-h-10 h-auto overflow-hidden",
        !hasValue && "text-placeholder",
        hasError && "border-destructive-text field-error",
        className,
      )}
    >
      <div className="flex-1 text-left truncate min-w-0">{renderTriggerContent()}</div>
      {/* Room for the clear button, which sits over this spot. */}
      {showClear ? <span aria-hidden="true" className="size-6 shrink-0" /> : null}
      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
    </button>
  )

  const clearButton = showClear ? (
    <button
      type="button"
      aria-label="Limpar seleção"
      data-slot="combobox-clear"
      className="absolute top-1/2 right-9 inline-flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-inner state-layer focus-visible:focus-outline"
      onClick={handleClearAll}
    >
      <X aria-hidden="true" className="size-4 shrink-0 opacity-50" />
    </button>
  ) : null

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
      disabled={disabled}
    >
      <div className="flex flex-col gap-2" data-slot="combobox">
        {multiBadges}
        <div className="relative" data-slot="combobox-control">
          <Popover
            open={open}
            onOpenChange={(isOpen) => {
              if (disabled) return
              if (isOpen) openList()
              else setOpen(false)
              if (!isOpen && search !== "") changeSearch("")
            }}
            align="start"
            trigger={trigger}
            aria-labelledby={label != null && label !== "" ? ids.labelId : undefined}
            className={cn("p-0", popoverWidth || "w-[--radix-popover-trigger-width]")}
          >
            {/* The list is filtered here, not by cmdk: it only gets what is on screen. */}
            <CommandPrimitive
              shouldFilter={false}
              value={highlight}
              onValueChange={setHighlight}
              onKeyDown={() => {
                pickedWithPointer.current = false
              }}
              className="flex h-full w-full flex-col"
            >
              <div className="flex items-center gap-2 border-b px-3" cmdk-input-wrapper="">
                <SearchIcon className="size-4 shrink-0 opacity-50" aria-hidden="true" />
                <CommandPrimitive.Input
                  placeholder={resolvedSearchPlaceholder}
                  value={search}
                  onValueChange={changeSearch}
                  className="flex w-full rounded-element bg-transparent py-2.5 text-sm outline-none placeholder:text-placeholder"
                />
              </div>
              <CommandPrimitive.List
                ref={listRef}
                id={listboxId}
                onTouchMove={(e) => e.stopPropagation()}
                className="max-h-75 overflow-y-auto overflow-x-hidden overscroll-y-contain p-1"
              >
                {!showCreateOption && !loading ? (
                  <CommandPrimitive.Empty className="py-6 text-center text-sm text-muted-foreground">
                    {resolvedEmptyMessage}
                  </CommandPrimitive.Empty>
                ) : null}
                <CommandPrimitive.Group>
                  {showCreateOption ? (
                    <CommandPrimitive.Item
                      value={CREATE_ACTION_VALUE}
                      onSelect={() => handleCreate(trimmedSearch)}
                      className="relative flex cursor-default select-none items-center rounded-element px-2 py-1.5 text-sm outline-none transition-colors aria-selected:state-hover"
                    >
                      Usar: &ldquo;{trimmedSearch}&rdquo;
                    </CommandPrimitive.Item>
                  ) : null}
                  {visibleOptions.map((option) => {
                    const isSelected = chosen.includes(option.value)

                    return (
                      <CommandPrimitive.Item
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                        // cmdk marks the highlighted option aria-selected; the
                        // chosen one is told apart by aria-checked.
                        aria-checked={isSelected}
                        onPointerDown={() => {
                          pickedWithPointer.current = true
                        }}
                        onSelect={() => {
                          if (isMultiple) handleMultipleSelect(option.value)
                          else handleSingleSelect(option.value)
                        }}
                        className="relative flex cursor-default select-none items-center gap-2 rounded-element px-2 py-1.5 text-sm outline-none transition-colors aria-selected:state-hover data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50"
                      >
                        <div
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-inner border",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input [&_svg]:invisible",
                          )}
                        >
                          <Check className="h-3 w-3" />
                        </div>
                        {option.label}
                      </CommandPrimitive.Item>
                    )
                  })}
                </CommandPrimitive.Group>
              </CommandPrimitive.List>
              {loading || hiddenCount > 0 ? (
                // biome-ignore lint/a11y/useSemanticElements: <output> is for the result of a calculation; this tells that the list is loading or cut short.
                <p
                  role="status"
                  data-slot="combobox-status"
                  className="border-t px-3 py-2 text-xs text-muted-foreground"
                >
                  {loading ? l.loading : l.hiddenOptions(hiddenCount)}
                </p>
              ) : null}
            </CommandPrimitive>
          </Popover>
          {clearButton}
        </div>
      </div>
    </FieldShell>
  )
}

Combobox.displayName = "Combobox"

export function useComboboxOptions<
  T extends { id: number | string; nome?: string; label?: string },
>(data: T[] | undefined, labelKey: keyof T = "nome" as keyof T): ComboboxOption[] {
  return React.useMemo(() => {
    if (!data) return []
    return data.map((item) => ({
      value: String(item.id),
      label: String(item[labelKey] ?? item.nome ?? item.id),
    }))
  }, [data, labelKey])
}
