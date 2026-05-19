"use client"

import { Command as CommandPrimitive } from "cmdk"
import { Check, ChevronsUpDown, SearchIcon, X } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Popover } from "../overlays/popover"
import { FieldShell, type LabelPosition } from "../primitives/_internal/field-shell"
import { useFieldIds } from "../primitives/_internal/use-field-ids"
import { Badge } from "../primitives/badge"
import { Button } from "../primitives/button"

const CREATE_ACTION_VALUE = "__create_action__"

function toArray<T>(v: T | T[] | undefined | null): T[] {
  if (v == null) return []
  return Array.isArray(v) ? v : [v]
}

export interface ComboboxOption {
  value: string
  label: string
  disabled?: boolean
  icon?: React.ComponentType<{ className?: string }>
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
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps

export function Combobox(props: ComboboxProps) {
  const {
    options,
    placeholder = "Selecione...",
    searchPlaceholder = "Buscar...",
    emptyMessage = "Nenhuma opção encontrada.",
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
    ref,
  } = props

  const ids = useFieldIds(id)
  const listboxId = `${ids.controlId}-listbox`
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""

  const isMultiple = props.multiple === true

  const handleSingleSelect = (currentValue: string) => {
    if (!isMultiple && props.onValueChange) {
      props.onValueChange(currentValue === props.value ? "" : currentValue)
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
    setSearch("")
  }

  const handleRemoveValue = (valueToRemove: string, e: React.SyntheticEvent) => {
    e.stopPropagation()
    if (isMultiple && props.onValueChange) {
      const currentValues = toArray(props.value)
      props.onValueChange(currentValues.filter((v) => v !== valueToRemove))
    }
  }

  const handleClearAll = (e: React.SyntheticEvent) => {
    e.stopPropagation()
    if (isMultiple && props.onValueChange) {
      props.onValueChange([])
    } else if (!isMultiple && props.onValueChange) {
      props.onValueChange("")
    }
  }

  const renderTriggerContent = () => {
    if (isMultiple) {
      const values = toArray(props.value)
      if (values.length === 0) {
        return <span className="text-muted-foreground">{placeholder}</span>
      }
      return (
        <span className="text-foreground">
          {values.length} {values.length === 1 ? "selecionado" : "selecionados"}
        </span>
      )
    }
    const selectedOption = options.find((o) => o.value === props.value)
    if (selectedOption) return selectedOption.label
    if (creatable && props.value) return props.value
    return <span className="text-muted-foreground">{placeholder}</span>
  }

  const trimmedSearch = search.trim()
  const showCreateOption =
    creatable &&
    trimmedSearch.length > 0 &&
    !options.some((o) => o.value.toLowerCase() === trimmedSearch.toLowerCase()) &&
    !options.some((o) => o.label.toLowerCase() === trimmedSearch.toLowerCase())

  const hasValue = isMultiple ? toArray(props.value).length > 0 : Boolean(props.value)

  const multiBadges = (() => {
    if (!isMultiple) return null
    const values = toArray(props.value)
    if (values.length === 0) return null
    const maxBadges = (props as ComboboxMultipleProps).maxBadges ?? 2
    const visibleValues = values.slice(0, maxBadges)
    const remainingCount = values.length - maxBadges
    return (
      <div className="flex flex-wrap gap-1 items-center" data-slot="combobox-badges">
        {visibleValues.map((val) => {
          const option = options.find((o) => o.value === val)
          const Icon = option?.icon
          const labelText = option?.label || val
          return (
            <Badge
              key={val}
              variant="outline"
              className="rounded-md px-1.5 py-0.5 font-normal bg-muted text-foreground border-border inline-flex items-center"
              aria-label={labelText}
            >
              {Icon ? <Icon className="mr-1 size-3 shrink-0" /> : null}
              {labelText}
              <button
                type="button"
                aria-label={`Remover ${labelText}`}
                className="ml-1 rounded-full outline-none cursor-pointer hover:bg-background/50"
                onClick={(e) => handleRemoveValue(val, e)}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          )
        })}
        {remainingCount > 0 ? (
          <Badge
            variant="outline"
            className="rounded-md px-1.5 py-0.5 font-normal bg-muted text-foreground border-border"
          >
            +{remainingCount}
          </Badge>
        ) : null}
      </div>
    )
  })()

  const trigger = (
    <Button
      ref={ref}
      id={ids.controlId}
      variant="outline"
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
        "w-full justify-between min-h-10 h-auto overflow-hidden",
        !hasValue && "text-muted-foreground",
        className,
      )}
    >
      <div className="flex-1 text-left truncate min-w-0">{renderTriggerContent()}</div>
      <div className="flex items-center gap-1 ml-2">
        {hasValue ? (
          <span
            // biome-ignore lint/a11y/useSemanticElements: avoid nested button inside Button
            role="button"
            tabIndex={0}
            aria-label="Limpar seleção"
            className="inline-flex"
            onClick={handleClearAll}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                handleClearAll(e)
              }
            }}
          >
            <X className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100" />
          </span>
        ) : null}
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </div>
    </Button>
  )

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
        <Popover
          open={open}
          onOpenChange={(isOpen) => {
            if (disabled) return
            setOpen(isOpen)
            if (!isOpen) setSearch("")
          }}
          align="start"
          trigger={trigger}
          className={cn("p-0", popoverWidth || "w-[--radix-popover-trigger-width]")}
        >
          <CommandPrimitive
            filter={
              creatable
                ? (value, searchText) => {
                    if (value === CREATE_ACTION_VALUE) return 1
                    return value.toLowerCase().includes(searchText.toLowerCase()) ? 1 : 0
                  }
                : undefined
            }
            className="flex h-full w-full flex-col"
          >
            <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
              <SearchIcon className="mr-2 size-4 shrink-0 opacity-50" aria-hidden="true" />
              <CommandPrimitive.Input
                placeholder={searchPlaceholder}
                onValueChange={setSearch}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-input"
              />
            </div>
            <CommandPrimitive.List
              id={listboxId}
              className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1"
            >
              {!showCreateOption ? (
                <CommandPrimitive.Empty className="py-6 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </CommandPrimitive.Empty>
              ) : null}
              <CommandPrimitive.Group>
                {showCreateOption ? (
                  <CommandPrimitive.Item
                    value={CREATE_ACTION_VALUE}
                    keywords={[trimmedSearch]}
                    onSelect={() => handleCreate(trimmedSearch)}
                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                  >
                    Usar: &ldquo;{trimmedSearch}&rdquo;
                  </CommandPrimitive.Item>
                ) : null}
                {options.map((option) => {
                  const isSelected = isMultiple
                    ? toArray(props.value).includes(option.value)
                    : props.value === option.value

                  return (
                    <CommandPrimitive.Item
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      onSelect={() => {
                        if (isMultiple) handleMultipleSelect(option.value)
                        else handleSingleSelect(option.value)
                      }}
                      className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50"
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-md border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible",
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </div>
                      {option.icon ? <option.icon className="mr-2 size-4 shrink-0" /> : null}
                      {option.label}
                    </CommandPrimitive.Item>
                  )
                })}
              </CommandPrimitive.Group>
            </CommandPrimitive.List>
          </CommandPrimitive>
        </Popover>
      </div>
    </FieldShell>
  )
}

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
