"use client"

import { type MaskSpec, MaskedInput, type MaskedInputProps } from "./_internal/masked-input"

interface CEPInputProps extends MaskedInputProps {
  /**
   * O CEP como **dígitos limpos** (sem máscara).
   * Pode conter de 0 a 8 dígitos enquanto o usuário digita.
   * Ex.: `"01310100"`.
   */
  value: string
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
}

function CEPInput(props: CEPInputProps) {
  return (
    <MaskedInput
      spec={cepSpec}
      slot="cep-input"
      inputMode="numeric"
      autoComplete="postal-code"
      maxLength={9}
      {...props}
    />
  )
}

CEPInput.displayName = "CEPInput"

export { CEPInput, type CEPInputProps }
