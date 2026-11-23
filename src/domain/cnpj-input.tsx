"use client"

import { type MaskSpec, MaskedInput, type MaskedInputProps } from "./_internal/masked-input"

interface CNPJInputProps extends MaskedInputProps {
  /**
   * O CNPJ **sem máscara**: até 14 caracteres, na ordem em que aparecem.
   * No CNPJ numérico são só dígitos (`"11222333000181"`); no alfanumérico
   * (IN RFB 2.229/2024) as doze primeiras posições podem ter letras
   * maiúsculas (`"12ABC34501DE35"`). Os dois últimos são sempre dígitos.
   */
  value: string
}

/** Aplica a máscara `XX.XXX.XXX/XXXX-DD` sobre o valor limpo. */
function maskCNPJ(raw: string): string {
  const d = raw.slice(0, 14)
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`
}

/**
 * Dígitos em qualquer posição; letras sem acento, passadas para maiúsculas,
 * só nas doze primeiras (os dois dígitos verificadores são numéricos).
 */
function filterCNPJ(text: string): string {
  let kept = ""
  for (const char of text) {
    if (char >= "0" && char <= "9") kept += char
    else if (kept.length < 12) {
      if (char >= "A" && char <= "Z") kept += char
      else if (char >= "a" && char <= "z") kept += char.toUpperCase()
    }
  }
  return kept
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
