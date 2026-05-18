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
  onValueChange?: (_value: string) => void
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
  onValueChange?: (_value: string[]) => void
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
  } = props

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
      const rawValue = props.value
      const currentValues = Array.isArray(rawValue) ? rawValue : rawValue ? [rawValue] : []
      const newValues = currentValues.includes(currentValue)
        ? currentValues.filter((v) => v !== currentValue)
        : [...currentValues, currentValue]
      props.onValueChange(newValues)
    }
  }

  // Remove um valor da seleção múltipla
  const handleRemoveValue = (valueToRemove: string, e: React.SyntheticEvent) => {
    e.stopPropagation()
    if (isMultiple && props.onValueChange) {
      const rawValue = props.value
      const currentValues = Array.isArray(rawValue) ? rawValue : rawValue ? [rawValue] : []
      props.onValueChange(currentValues.filter((v) => v !== valueToRemove))
    }
  }

  // Limpa todos os valores selecionados
  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isMultiple && props.onValueChange) {
      props.onValueChange([])
    } else if (!isMultiple && props.onValueChange) {
      props.onValueChange("")
    }
  }

  // Renderiza o conteúdo do trigger
  const renderTriggerContent = () => {
    if (isMultiple) {
      // Garantir que values seja sempre um array
      const rawValue = props.value
      const values = Array.isArray(rawValue) ? rawValue : rawValue ? [rawValue] : []
      const maxBadges = props.maxBadges ?? 2

      if (values.length === 0) {
        return <span style={{ color: "hsl(var(--placeholder))" }}>{placeholder}</span>
      }

      const visibleValues = values.slice(0, maxBadges)
      const remainingCount = values.length - maxBadges

      return (
        <div className="flex flex-wrap gap-1 items-center">
          {visibleValues.map((val) => {
            const option = options.find((o) => o.value === val)
            const Icon = option?.icon
            return (
              <Badge
                key={val}
                variant="outline"
                className="rounded-md px-1.5 py-0.5 font-normal bg-muted text-foreground border-border"
              >
                {Icon ? <Icon className="mr-1 size-3 shrink-0" /> : null}
                {option?.label || val}
                <span
                  // biome-ignore lint/a11y/useSemanticElements: span inside Button to avoid nested button elements
                  role="button"
                  tabIndex={0}
                  className="ml-1 rounded-full outline-none cursor-pointer"
                  onClick={(e) => handleRemoveValue(val, e)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handleRemoveValue(val, e)
                    }
                  }}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </span>
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
    }

    // Single select
    const selectedOption = options.find((o) => o.value === props.value)
    if (selectedOption) return selectedOption.label
    if (creatable && props.value) return props.value
    return <span style={{ color: "hsl(var(--placeholder))" }}>{placeholder}</span>
  }

  // Verifica se deve mostrar a opção de criar valor custom
  const showCreateOption =
    creatable &&
    search.trim().length > 0 &&
    !options.some((o) => o.value.toLowerCase() === search.trim().toLowerCase())

  // Verifica se há valor selecionado
  const hasValue = isMultiple ? (props.value || []).length > 0 : Boolean(props.value)

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) setSearch("")
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          // biome-ignore lint/a11y/useSemanticElements: combobox button pattern (WAI-ARIA listbox combobox)
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between min-h-10 h-auto overflow-hidden",
            !hasValue && "text-muted-foreground",
            className,
          )}
        >
          <div className="flex-1 text-left truncate min-w-0">{renderTriggerContent()}</div>
          <div className="flex items-center gap-1 ml-2">
            {hasValue && (
              <X
                className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100 cursor-pointer"
                onClick={handleClearAll}
              />
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
              ? (value, search) => {
                  if (value.startsWith("__create__")) return 1
                  return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
                }
              : undefined
          }
        >
          <CommandInput placeholder={searchPlaceholder} onValueChange={setSearch} />
          <CommandList>
            {!showCreateOption && <CommandEmpty>{emptyMessage}</CommandEmpty>}
            <CommandGroup>
              {showCreateOption && (
                <CommandItem
                  value={`__create__${search.trim()}`}
                  onSelect={() => {
                    if (!isMultiple && props.onValueChange) {
                      props.onValueChange(search.trim())
                    }
                    setOpen(false)
                    setSearch("")
                  }}
                >
                  Usar: &ldquo;{search.trim()}&rdquo;
                </CommandItem>
              )}
              {options.map((option) => {
                const rawValue = props.value
                const valueArray = isMultiple
                  ? Array.isArray(rawValue)
                    ? rawValue
                    : rawValue
                      ? [rawValue]
                      : []
                  : null
                const isSelected = isMultiple
                  ? (valueArray || []).includes(option.value)
                  : rawValue === option.value

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
      label: String(item[labelKey] || item.nome || item.id),
    }))
  }, [data, labelKey])
}
