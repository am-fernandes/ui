"use client"

import { Loader2 } from "lucide-react"

import { type MaskSpec, MaskedInput, type MaskedInputProps } from "./_internal/masked-input"

export interface CEPInputLabels {
  /** Announced to screen readers while `loading`. */
  loading: string
}

export const defaultCEPInputLabels: CEPInputLabels = {
  loading: "Buscando endereço…",
}

interface CEPInputProps extends MaskedInputProps {
  /**
   * O CEP como **dígitos limpos** (sem máscara).
   * Pode conter de 0 a 8 dígitos enquanto o usuário digita.
   * Ex.: `"01310100"`. `null` é campo vazio; sem `value`, o campo guarda o
   * próprio valor a partir de `defaultValue`.
   */
  value?: string | null
  /** CEP inicial (dígitos limpos) de um campo não controlado. */
  defaultValue?: string
  /**
   * Chamado com os oito dígitos quando o CEP fica completo por uma edição do
   * usuário (o oitavo dígito digitado, ou um CEP inteiro colado). É o gancho
   * da consulta de endereço. Não dispara por um `value` que chega pronto.
   */
  onComplete?: (cep: string) => void
  /**
   * Mostra um indicador de carregamento dentro do campo, para o tempo da
   * consulta de endereço. O campo continua editável.
   */
  loading?: boolean
  /** Textos do componente. Padrão em pt-BR. */
  labels?: Partial<CEPInputLabels>
}

/** Aplica a máscara `00000-000` sobre dígitos limpos. */
function maskCEP(digits: string): string {
  const d = digits.slice(0, 8)
  if (d.length <= 5) return d
  return `${d.slice(0, 5)}-${d.slice(5, 8)}`
}

const cepSpec: MaskSpec = {
  maxLength: 8,
  filter: (text) => text.replace(/\D/g, ""),
  mask: maskCEP,
  // Um CEP inteiro que não seja parte de um número maior: num endereço
  // colado, o número da rua não entra no lugar dele.
  extract: (text) => /(?:^|\D)(\d{5}-?\d{3})(?!\d)/.exec(text)?.[1] ?? null,
}

function CEPInput({ onValueChange, onComplete, loading = false, labels, ...props }: CEPInputProps) {
  const l: CEPInputLabels = { ...defaultCEPInputLabels, ...labels }

  // `onValueChange` only runs when an edit changes the value, so this is the
  // moment the CEP becomes complete, never a re-render of a complete one.
  const handleValueChange = (cep: string) => {
    onValueChange?.(cep)
    if (cep.length === cepSpec.maxLength) onComplete?.(cep)
  }

  return (
    <MaskedInput
      spec={cepSpec}
      slot="cep-input"
      inputMode="numeric"
      autoComplete="postal-code"
      aria-busy={loading || undefined}
      {...props}
      onValueChange={handleValueChange}
      trailing={
        <>
          {/* Always in the DOM, so the text is announced when it appears. */}
          {/* biome-ignore lint/a11y/useSemanticElements: <output> is for the result of a calculation; this announces that a lookup is running. */}
          <span role="status" className="sr-only">
            {loading ? l.loading : ""}
          </span>
          {loading ? (
            <Loader2 data-slot="cep-input-spinner" className="size-4 animate-spin" aria-hidden />
          ) : null}
        </>
      }
    />
  )
}

CEPInput.displayName = "CEPInput"

export { CEPInput, type CEPInputProps }
