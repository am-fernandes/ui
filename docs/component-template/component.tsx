"use client"

/**
 * Template de componente "cidadão exemplar" para `@amfernandesinc/ui`.
 *
 * Como usar:
 *   1. Copie este arquivo para `src/<pasta>/<seu-nome>.tsx`.
 *   2. Renomeie `Component` → `MyField`, `ComponentProps` → `MyFieldProps`.
 *   3. Ajuste os imports relativos de `_internal/...` se a pasta-destino não
 *      for `src/primitives/` (ex.: domain importa via
 *      `../primitives/_internal/field-shell`).
 *   4. Adicione no barrel `src/index.ts` e em `package.json#exports`.
 *
 * Padrões demonstrados:
 *   - FieldShell + useFieldIds (ARIA wiring de label/description/error)
 *   - aria-invalid / aria-describedby / aria-required
 *   - visual de campo (`field-states`, `rounded-element`, altura por `controlHeight`)
 *   - estados de erro (`field-error`) e somente leitura (`fieldReadOnlyClass`)
 *   - textos trocáveis por `labels`, com padrão pt-BR
 *   - ref encaminhado para o <input>
 *   - displayName setado
 *
 * NÃO inclua este arquivo em `src/index.ts` nem em `tsup` — é apenas
 * material de referência (`docs/component-template/` fica fora do build).
 */

import type * as React from "react"

import { cn } from "@/lib/utils"
import { controlHeight, controlPaddingX } from "../primitives/_internal/control-size"
import {
  FieldShell,
  type LabelPosition,
  fieldReadOnlyClass,
} from "../primitives/_internal/field-shell"
import { useFieldIds } from "../primitives/_internal/use-field-ids"

export interface ComponentLabels {
  placeholder: string
}

export const defaultComponentLabels: ComponentLabels = {
  placeholder: "Digite aqui",
}

export interface ComponentProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Texto da label. Quando omitido, o `FieldShell` não renderiza nada. */
  label?: React.ReactNode
  /** Posição da label. `up` (default) | `left` | `hidden` (sr-only). */
  labelPosition?: LabelPosition
  /** Texto auxiliar abaixo do controle. */
  description?: React.ReactNode
  /** Mensagem de erro. Quando truthy, ativa estado de erro + `role="alert"`. */
  error?: string
  /** Marca o campo como obrigatório (renderiza asterisco + `aria-required`). */
  required?: boolean
  labels?: Partial<ComponentLabels>
  /** Forwarded para o `<input>` real. */
  ref?: React.Ref<HTMLInputElement>
}

function Component({
  id,
  label,
  labelPosition,
  description,
  error,
  required,
  disabled,
  readOnly,
  className,
  labels,
  placeholder,
  ref,
  ...props
}: ComponentProps) {
  const ids = useFieldIds(id)
  const texts = { ...defaultComponentLabels, ...labels }
  const isReadOnly = Boolean(readOnly) && !disabled
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""

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
      nativeRequired
      disabled={disabled}
    >
      <input
        ref={ref}
        id={ids.controlId}
        data-slot="component"
        aria-invalid={hasError ? true : undefined}
        aria-describedby={ids.describedBy({ description: hasDescription, error: hasError })}
        aria-required={required ? true : undefined}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        data-readonly={isReadOnly ? "" : undefined}
        className={cn(
          "w-full min-w-0 rounded-element border border-border-strong bg-card text-sm outline-none field-states",
          "placeholder:text-placeholder disabled:cursor-default",
          fieldReadOnlyClass,
          controlHeight.md,
          controlPaddingX.md,
          hasError && "border-destructive-text field-error",
          className,
        )}
        {...props}
        placeholder={isReadOnly ? undefined : (placeholder ?? texts.placeholder)}
      />
    </FieldShell>
  )
}

Component.displayName = "Component"

export { Component }
