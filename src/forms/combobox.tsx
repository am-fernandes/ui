"use client"

import { Check, ChevronsUpDown, X } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../navigation/command"
import { Popover, PopoverContent, PopoverTrigger } from "../overlays/popover"
import { Badge } from "../primitives/badge"
import { Button } from "../primitives/button"

/**
 * Cmdk-internal sentinel used to mark the "Create…" option. Picked so it
 * cannot collide with any legitimate user-supplied value.
 */
const CREATE_ACTION_VALUE = "__create_action__"

/** Normalize unknown values into an array. */
function toArray<T>(v: T | T[] | undefined | null): T[] {
  if (v == null) return []
  return Array.isArray(v) ? v : [v]
}

/**
 * Opção do Combobox
 */
export interface ComboboxOption {
  value: string
  label: string
  disabled?: boolean
  /** Optional leading icon component (e.g. a lucide-react icon). */
  icon?: React.ComponentType<{ className?: string }>
}

/**
 * Props base compartilhadas entre single e multi select
 */
interface ComboboxBaseProps {
  /** Lista de opções disponíveis */
  options: ComboboxOption[]
  /** Placeholder quando nenhuma opção está selecionada */
  placeholder?: string
  /** Placeholder do campo de busca */
  searchPlaceholder?: string
  /** Mensagem quando nenhuma opção é encontrada */
  emptyMessage?: string
  /** Desabilita o combobox */
  disabled?: boolean
  /** Classes CSS adicionais para o trigger */
  className?: string
  /** Largura do popover (padrão: mesma do trigger) */
  popoverWidth?: string
  /** Permite criar valores que não estão na lista */
  creatable?: boolean
  /** Ref encaminhada ao botão trigger. */
  ref?: React.Ref<HTMLButtonElement>
}

/**
 * Props para seleção única
 */
interface ComboboxSingleProps extends ComboboxBaseProps {
  /** Modo de seleção única */
  multiple?: false
  /** Valor selecionado */
  value?: string
  /** Callback quando o valor muda */
  onValueChange?: (value: string) => void
}

/**
 * Props para seleção múltipla
 */
interface ComboboxMultipleProps extends ComboboxBaseProps {
  /** Modo de seleção múltipla */
  multiple: true
  /** Valores selecionados */
  value?: string[]
  /** Callback quando os valores mudam */
  onValueChange?: (value: string[]) => void
  /** Máximo de badges visíveis antes de mostrar contador */
  maxBadges?: number
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps

/**
 * Combobox - Select com busca e suporte a seleção múltipla
 *
 * @example
 * // Single select
 * <Combobox
 *   options={[{ value: "1", label: "Opção 1" }]}
 *   value={selected}
 *   onValueChange={setSelected}
 *   placeholder="Selecione..."
 * />
 *
 * @example
 * // Multi select
 * <Combobox
 *   multiple
 *   options={[{ value: "1", label: "Opção 1" }]}
 *   value={selectedList}
 *   onValueChange={setSelectedList}
 *   placeholder="Selecione..."
 * />
 */
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
    ref,
  } = props

  const listboxId = React.useId()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  // Verifica se é multi-select
  const isMultiple = props.multiple === true

  // Handler para seleção única
  const handleSingleSelect = (currentValue: string) => {
    if (!isMultiple && props.onValueChange) {
      props.onValueChange(currentValue === props.value ? "" : currentValue)
    }
    setOpen(false)
  }

  // Handler para seleção múltipla
  const handleMultipleSelect = (currentValue: string) => {
    if (isMultiple && props.onValueChange) {
      const currentValues = toArray(props.value)
      const newValues = currentValues.includes(currentValue)
        ? currentValues.filter((v) => v !== currentValue)
        : [...currentValues, currentValue]
      props.onValueChange(newValues)
    }
  }

  // Handler para criar um valor custom (creatable)
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

  // Remove um valor da seleção múltipla
  const handleRemoveValue = (valueToRemove: string, e: React.SyntheticEvent) => {
    e.stopPropagation()
    if (isMultiple && props.onValueChange) {
      const currentValues = toArray(props.value)
      props.onValueChange(currentValues.filter((v) => v !== valueToRemove))
    }
  }

  // Limpa todos os valores selecionados
  const handleClearAll = (e: React.SyntheticEvent) => {
    e.stopPropagation()
    if (isMultiple && props.onValueChange) {
      props.onValueChange([])
    } else if (!isMultiple && props.onValueChange) {
      props.onValueChange("")
    }
  }

  // Renderiza o conteúdo do trigger (badges agora ficam fora do botão).
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

    // Single select
    const selectedOption = options.find((o) => o.value === props.value)
    if (selectedOption) return selectedOption.label
    if (creatable && props.value) return props.value
    return <span className="text-muted-foreground">{placeholder}</span>
  }

  // Verifica se deve mostrar a opção de criar valor custom
  const trimmedSearch = search.trim()
  const showCreateOption =
    creatable &&
    trimmedSearch.length > 0 &&
    !options.some((o) => o.value.toLowerCase() === trimmedSearch.toLowerCase()) &&
    !options.some((o) => o.label.toLowerCase() === trimmedSearch.toLowerCase())

  // Verifica se há valor selecionado
  const hasValue = isMultiple ? toArray(props.value).length > 0 : Boolean(props.value)

  // Multi-select badge list (rendered ABOVE/BESIDE the button, not inside it).
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
          const label = option?.label || val
          return (
            <Badge
              key={val}
              variant="outline"
              className="rounded-md px-1.5 py-0.5 font-normal bg-muted text-foreground border-border inline-flex items-center"
              role="img"
              aria-label={label}
            >
              {Icon ? <Icon className="mr-1 size-3 shrink-0" /> : null}
              {label}
              <button
                type="button"
                aria-label={`Remover ${label}`}
                className="ml-1 rounded-full outline-none cursor-pointer hover:bg-background/50"
                onClick={(e) => handleRemoveValue(val, e)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    handleRemoveValue(val, e)
                  }
                }}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          )
        })}
        {remainingCount > 0 && (
          <Badge
            variant="outline"
            className="rounded-md px-1.5 py-0.5 font-normal bg-muted text-foreground border-border"
          >
            +{remainingCount}
          </Badge>
        )}
      </div>
    )
  })()

  return (
    <div className={cn("flex flex-col gap-2", className)} data-slot="combobox-wrapper">
      {multiBadges}
      <Popover
        open={open}
        onOpenChange={(isOpen) => {
          if (disabled) return
          setOpen(isOpen)
          if (!isOpen) setSearch("")
        }}
      >
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            // biome-ignore lint/a11y/useSemanticElements: combobox button pattern (WAI-ARIA listbox combobox)
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={listboxId}
            aria-autocomplete="list"
            disabled={disabled}
            className={cn(
              "w-full justify-between min-h-10 h-auto overflow-hidden",
              !hasValue && "text-muted-foreground",
            )}
          >
            <div className="flex-1 text-left truncate min-w-0">{renderTriggerContent()}</div>
            <div className="flex items-center gap-1 ml-2">
              {hasValue && (
                <span
                  // biome-ignore lint/a11y/useSemanticElements: keep as span to avoid nested-button inside trigger Button
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
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn("p-0", popoverWidth || "w-[--radix-popover-trigger-width]")}
          align="start"
        >
          <Command
            filter={
              creatable
                ? (value, searchText) => {
                    if (value === CREATE_ACTION_VALUE) return 1
                    return value.toLowerCase().includes(searchText.toLowerCase()) ? 1 : 0
                  }
                : undefined
            }
          >
            <CommandInput placeholder={searchPlaceholder} onValueChange={setSearch} />
            <CommandList id={listboxId}>
              {!showCreateOption && <CommandEmpty>{emptyMessage}</CommandEmpty>}
              <CommandGroup>
                {showCreateOption && (
                  <CommandItem
                    value={CREATE_ACTION_VALUE}
                    keywords={[trimmedSearch]}
                    onSelect={() => handleCreate(trimmedSearch)}
                  >
                    Usar: &ldquo;{trimmedSearch}&rdquo;
                  </CommandItem>
                )}
                {options.map((option) => {
                  const isSelected = isMultiple
                    ? toArray(props.value).includes(option.value)
                    : props.value === option.value

                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      onSelect={() => {
                        if (isMultiple) {
                          handleMultipleSelect(option.value)
                        } else {
                          handleSingleSelect(option.value)
                        }
                      }}
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
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

/**
 * Hook para facilitar o uso do Combobox com react-hook-form
 */
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
