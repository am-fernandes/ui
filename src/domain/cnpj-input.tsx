"use client"

import { filterCNPJ, maskCNPJ } from "@/lib/_internal/masks"
import { type MaskSpec, MaskedInput, type MaskedInputProps } from "./_internal/masked-input"

interface CNPJInputProps extends MaskedInputProps {
  /**
   * O CNPJ **sem máscara**: até 14 caracteres, na ordem em que aparecem.
   * No CNPJ numérico são só dígitos (`"11222333000181"`); no alfanumérico
   * (IN RFB 2.229/2024) as doze primeiras posições podem ter letras
   * maiúsculas (`"12ABC34501DE35"`). Os dois últimos são sempre dígitos.
   * `null` é campo vazio; sem `value`, o campo guarda o próprio valor a partir
   * de `defaultValue`.
   */
  value?: string | null
  /** CNPJ inicial (sem máscara) de um campo não controlado. */
  defaultValue?: string
}

const cnpjSpec: MaskSpec = {
  maxLength: 14,
  filter: filterCNPJ,
  mask: maskCNPJ,
  // Um CNPJ inteiro, com ou sem pontuação, que não seja parte de um texto
  // maior: em "CNPJ: 12.ABC.345/01DE-35" as letras do rótulo ficam de fora.
  extract: (text) =>
    /(?:^|[^0-9A-Z])([0-9A-Z]{2}\.?[0-9A-Z]{3}\.?[0-9A-Z]{3}\/?[0-9A-Z]{4}-?\d{2})(?![0-9A-Z])/i.exec(
      text,
    )?.[1] ?? null,
}

function CNPJInput(props: CNPJInputProps) {
  return (
    <MaskedInput
      spec={cnpjSpec}
      slot="cnpj-input"
      // Teclado de texto: o CNPJ alfanumérico tem letras.
      inputMode="text"
      autoCapitalize="characters"
      autoCorrect="off"
      spellCheck={false}
      autoComplete="off"
      {...props}
    />
  )
}

CNPJInput.displayName = "CNPJInput"

export { CNPJInput, type CNPJInputProps }
