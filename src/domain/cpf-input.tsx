"use client"

import { type MaskSpec, MaskedInput, type MaskedInputProps } from "./_internal/masked-input"

interface CPFInputProps extends MaskedInputProps {
  /**
   * O CPF como **dígitos limpos** (sem máscara).
   * Pode conter de 0 a 11 dígitos enquanto o usuário digita.
   * Ex.: `"12345678909"`.
   */
  value: string
}

/** Aplica a máscara `000.000.000-00` sobre dígitos limpos. */
function maskCPF(digits: string): string {
  const d = digits.slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`
}

const cpfSpec: MaskSpec = {
  maxLength: 11,
  filter: (text) => text.replace(/\D/g, ""),
  mask: maskCPF,
}

function CPFInput(props: CPFInputProps) {
  return (
    <MaskedInput
      spec={cpfSpec}
      slot="cpf-input"
      inputMode="numeric"
      autoComplete="off"
      maxLength={14}
      {...props}
    />
  )
}

CPFInput.displayName = "CPFInput"

export { CPFInput, type CPFInputProps }
