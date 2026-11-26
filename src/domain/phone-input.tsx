"use client"

import { dropCountryAndTrunkPrefix, maskPhone } from "@/lib/_internal/masks"
import { type MaskSpec, MaskedInput, type MaskedInputProps } from "./_internal/masked-input"

interface PhoneInputProps extends MaskedInputProps {
  /**
   * O telefone como **dígitos limpos** (sem máscara).
   * Pode conter de 0 a 11 dígitos enquanto o usuário digita.
   * Ex.: `"11987654321"` (celular) ou `"1133334444"` (fixo). `null` é campo
   * vazio; sem `value`, o campo guarda o próprio valor a partir de
   * `defaultValue`.
   */
  value?: string | null
  /** Telefone inicial (dígitos limpos) de um campo não controlado. */
  defaultValue?: string
}

const phoneSpec: MaskSpec = {
  maxLength: 11,
  filter: (text) => text.replace(/\D/g, ""),
  mask: maskPhone,
  normalize: dropCountryAndTrunkPrefix,
  // Um telefone inteiro (10 ou 11 dígitos depois de tirar país e operadora).
  extract: (text) => {
    const { value } = dropCountryAndTrunkPrefix(text.replace(/\D/g, ""))
    return value.length === 10 || value.length === 11 ? value : null
  },
}

function PhoneInput(props: PhoneInputProps) {
  return (
    <MaskedInput
      spec={phoneSpec}
      slot="phone-input"
      inputMode="tel"
      autoComplete="tel"
      {...props}
    />
  )
}

PhoneInput.displayName = "PhoneInput"

export { PhoneInput, type PhoneInputProps }
