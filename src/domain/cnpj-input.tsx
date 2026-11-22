"use client"

import { type MaskSpec, MaskedInput, type MaskedInputProps } from "./_internal/masked-input"

interface CNPJInputProps extends MaskedInputProps {
  /**
   * O CNPJ como **dígitos limpos** (sem máscara).
   * Pode conter de 0 a 14 dígitos enquanto o usuário digita.
   * Ex.: `"11222333000181"`.
   */
  value: string
}

/** Aplica a máscara `00.000.000/0000-00` sobre dígitos limpos. */
function maskCNPJ(digits: string): string {
  const d = digits.slice(0, 14)
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`
}

const cnpjSpec: MaskSpec = {
  maxLength: 14,
  filter: (text) => text.replace(/\D/g, ""),
  mask: maskCNPJ,
  // Um CNPJ inteiro, com ou sem pontuação, que não seja parte de um número maior.
  extract: (text) => /(?:^|\D)(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})(?!\d)/.exec(text)?.[1] ?? null,
}

function CNPJInput(props: CNPJInputProps) {
  return (
    <MaskedInput
      spec={cnpjSpec}
      slot="cnpj-input"
      inputMode="numeric"
      autoComplete="off"
      {...props}
    />
  )
}

CNPJInput.displayName = "CNPJInput"

export { CNPJInput, type CNPJInputProps }
