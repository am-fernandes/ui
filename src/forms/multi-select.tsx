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
 * Opção do MultiSelect
 */
export interface MultiSelectOption {
  value: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  disabled?: boolean
}

/**
 * Props do MultiSelect
 */
export interface MultiSelectProps {
  /** Lista de opções disponíveis */
  options: MultiSelectOption[]
  /** Valores selecionados */
  value?: string[]
  /** Callback quando os valores mudam */
  onValueChange?: (_value: string[]) => void
  /** Placeholder quando nenhuma opção está selecionada */
  placeholder?: string
  /** Placeholder do campo de busca */
  searchPlaceholder?: string
  /** Mensagem quando nenhuma opção é encontrada */
  emptyMessage?: string
  /** Desabilita o componente */
  disabled?: boolean
  /** Classes CSS adicionais */
  className?: string
  /** Máximo de badges visíveis */
  maxCount?: number
  /** Variante visual dos badges */
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  /** Mostra opção "Selecionar Todos" */
  showSelectAll?: boolean
  /** Texto da opção "Selecionar Todos" */
  selectAllText?: string
  /** Texto da opção "Limpar Todos" */
  clearAllText?: string
  /** ID do formulário (para react-hook-form) */
  id?: string
  /** Nome do campo (para react-hook-form) */
  name?: string
  /** Callback onBlur (para react-hook-form) */
  onBlur?: () => void
}

/**
 * MultiSelect - Componente de seleção múltipla com busca
 *
 * @example
 * <MultiSelect
 *   options={[
 *     { value: "1", label: "Opção 1" },
 *     { value: "2", label: "Opção 2" },
 *   ]}
 *   value={selected}
 *   onValueChange={setSelected}
 *   placeholder="Selecione as opções..."
 *   showSelectAll
 * />
 */
export function MultiSelect({
  options,
  value = [],
  onValueChange,
  placeholder = "Selecione...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "Nenhuma opção encontrada.",
  disabled = false,
  className,
  maxCount = 3,
  badgeVariant = "secondary",
  showSelectAll = false,
  selectAllText = "Selecionar todos",
  clearAllText = "Limpar todos",
  id,
  onBlur,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  // Filtra opções baseado na busca
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [options, searchQuery])

  // Toggle de uma opção
  const handleToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue]
    onValueChange?.(newValue)
  }

  // Remove uma opção
  const handleRemove = (optionValue: string, e: React.SyntheticEvent) => {
    e.stopPropagation()
    onValueChange?.(value.filter((v) => v !== optionValue))
  }

  // Seleciona todas as opções
  const handleSelectAll = () => {
    const allValues = options.filter((o) => !o.disabled).map((o) => o.value)
    onValueChange?.(allValues)
  }

  // Limpa todas as opções
  const handleClearAll = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    onValueChange?.([])
  }

  // Verifica se todas as opções estão selecionadas
  const isAllSelected = options.every((o) => o.disabled || value.includes(o.value))

  // Obtém as opções selecionadas
  const selectedOptions = options.filter((o) => value.includes(o.value))

  // Handler quando o popover fecha
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setSearchQuery("")
      onBlur?.()
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          // biome-ignore lint/a11y/useSemanticElements: combobox button pattern (WAI-ARIA listbox combobox)
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between min-h-10 h-auto", className)}
        >
          {value.length === 0 ? (
            <span style={{ color: "hsl(var(--placeholder))" }}>{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1 items-center">
              {selectedOptions.slice(0, maxCount).map((option) => {
                const Icon = option.icon
                return (
                  <Badge
                    key={option.value}
                    variant={badgeVariant}
                    className="rounded-md px-1 font-normal"
                  >
                    {Icon && <Icon className="mr-1 h-3 w-3" />}
                    {option.label}
                    <span
                      // biome-ignore lint/a11y/useSemanticElements: span inside Button to avoid nested button elements
                      role="button"
                      tabIndex={0}
                      className="ml-1 rounded-full outline-none cursor-pointer"
                      onClick={(e) => handleRemove(option.value, e)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          handleRemove(option.value, e)
                        }
                      }}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </span>
                  </Badge>
                )
              })}
              {selectedOptions.length > maxCount && (
                <Badge variant={badgeVariant} className="rounded-md px-1 font-normal">
                  +{selectedOptions.length - maxCount}
                </Badge>
              )}
            </div>
          )}
          <div className="flex items-center gap-1 ml-2 shrink-0">
            {value.length > 0 && (
              <X
                className="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer"
                onClick={handleClearAll}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {showSelectAll && filteredOptions.length > 0 && (
                <>
                  <CommandItem
                    onSelect={() => (isAllSelected ? handleClearAll() : handleSelectAll())}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-md border border-primary",
                        isAllSelected ? "bg-primary text-primary-foreground" : "opacity-50",
                      )}
                    >
                      {isAllSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span className="font-medium">
                      {isAllSelected ? clearAllText : selectAllText}
                    </span>
                  </CommandItem>
                  <div className="h-px bg-border my-1" />
                </>
              )}
              {filteredOptions.map((option) => {
                const isSelected = value.includes(option.value)
                const Icon = option.icon

                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    onSelect={() => handleToggle(option.value)}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-md border border-primary",
                        isSelected ? "bg-primary text-primary-foreground" : "opacity-50",
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
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
 * Hook para converter dados em opções de MultiSelect
 */
export function useMultiSelectOptions<
  T extends {
    id: number | string
    nome?: string
    label?: string
    name?: string
  },
>(data: T[] | undefined, labelKey?: keyof T): MultiSelectOption[] {
  return React.useMemo(() => {
    if (!data) return []
    return data.map((item) => ({
      value: String(item.id),
      label: String(labelKey ? item[labelKey] : item.nome || item.label || item.name || item.id),
    }))
  }, [data, labelKey])
}
