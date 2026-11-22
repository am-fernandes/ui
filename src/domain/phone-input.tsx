"use client"

import { type MaskSpec, MaskedInput, type MaskedInputProps } from "./_internal/masked-input"

interface PhoneInputProps extends MaskedInputProps {
  /**
   * O telefone como **dígitos limpos** (sem máscara).
   * Pode conter de 0 a 11 dígitos enquanto o usuário digita.
   * Ex.: `"11987654321"` (celular) ou `"1133334444"` (fixo).
   */
  value: string
}

/**
 * Aplica a máscara de telefone:
 *   - 10 dígitos → `(00) 0000-0000`
 *   - 11 dígitos → `(00) 00000-0000`
 */
function maskPhone(digits: string): string {
  const d = digits.slice(0, 11)
  if (d.length === 0) return ""
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`
}

const phoneSpec: MaskSpec = {
  maxLength: 11,
  filter: (text) => text.replace(/\D/g, ""),
  mask: maskPhone,
}

function PhoneInput(props: PhoneInputProps) {
  return (
    <MaskedInput
      spec={phoneSpec}
      slot="phone-input"
      inputMode="tel"
      autoComplete="tel"
      maxLength={16}
      {...props}
    />
  )
}

PhoneInput.displayName = "PhoneInput"

export { PhoneInput, type PhoneInputProps }
