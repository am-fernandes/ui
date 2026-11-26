"use client"

import { maskCPF } from "@/lib/_internal/masks"
import { type MaskSpec, MaskedInput, type MaskedInputProps } from "./_internal/masked-input"

interface CPFInputProps extends MaskedInputProps {
  /**
   * O CPF como **dígitos limpos** (sem máscara).
   * Pode conter de 0 a 11 dígitos enquanto o usuário digita.
   * Ex.: `"12345678909"`. `null` é campo vazio; sem `value`, o campo guarda o
   * próprio valor a partir de `defaultValue`.
   */
  value?: string | null
  /** CPF inicial (dígitos limpos) de um campo não controlado. */
  defaultValue?: string
}

const cpfSpec: MaskSpec = {
  maxLength: 11,
  filter: (text) => text.replace(/\D/g, ""),
  mask: maskCPF,
  // Um CPF inteiro, com ou sem pontuação, que não seja parte de um número maior.
  extract: (text) => /(?:^|\D)(\d{3}\.?\d{3}\.?\d{3}-?\d{2})(?!\d)/.exec(text)?.[1] ?? null,
}

function CPFInput(props: CPFInputProps) {
  return (
    <MaskedInput
      spec={cpfSpec}
      slot="cpf-input"
      inputMode="numeric"
      autoComplete="off"
      {...props}
    />
  )
}

CPFInput.displayName = "CPFInput"

export { CPFInput, type CPFInputProps }
