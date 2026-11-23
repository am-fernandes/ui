/**
 * Utilitários de cálculo financeiro baseados em centavos (inteiros).
 *
 * Regra: toda aritmética financeira acontece em centavos.
 * Conversões float ↔ centavos somente nas bordas (input/output).
 */

/** Float → centavos inteiros. Ex: 1234.56 → 123456 */
export function toCents(value: number): number {
  return Math.round(value * 100)
}

/** Centavos inteiros → float. Ex: 123456 → 1234.56 */
export function fromCents(cents: number): number {
  return cents / 100
}

/**
 * Calcula o valor a partir de um percentual sobre um total.
 * Tudo em centavos para evitar explosão de float.
 *
 * Ex: percentOfTotal(70, 185000) → 129500
 *     percentOfTotal(33.33, 185000) → 61660.5 (arredondado para 61660.50)
 */
export function percentOfTotal(percent: number, total: number): number {
  const totalCents = toCents(total)
  const resultCents = Math.round((totalCents * percent) / 100)
  return fromCents(resultCents)
}

/**
 * Calcula o percentual que um valor representa de um total.
 * Usa centavos para divisão precisa, arredondado a 2 casas.
 *
 * Ex: percentFromValue(129500, 185000) → 70
 */
export function percentFromValue(value: number, total: number): number {
  if (total === 0) return 0
  const valueCents = toCents(value)
  const totalCents = toCents(total)
  return Math.round((valueCents / totalCents) * 10000) / 100
}

/**
 * Formata centavos inteiros para exibição BRL: 123456 → "1.234,56"
 */
export function centsToDisplay(cents: number): string {
  const sign = cents < 0 ? "-" : ""
  const abs = Math.abs(cents)
  const reais = Math.floor(abs / 100)
  const centavos = abs % 100
  return `${sign}${reais.toLocaleString("pt-BR")},${String(centavos).padStart(2, "0")}`
}

/**
 * Formata float para exibição BRL: 1234.56 → "R$ 1.234,56"
 */
export function formatBRL(value: number): string {
  return `R$ ${centsToDisplay(toCents(value))}`
}

/**
 * Formata número para exibição BRL sem prefixo: 1234.5 → "1.234,50"
 * Útil para tabelas e campos onde o símbolo R$ já está no label.
 */
export function toBRLMoney(value?: string | number | null): string {
  if (value === null || value === undefined || value === "") return ""
  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2 }).format(
    Number.parseFloat(String(value)),
  )
}

/**
 * Reverte máscara BRL para número: "1.234,56" → 1234.56
 * Usar ao submeter formulários com campos monetários mascarados.
 */
export function parseMaskedValue(value: string): number {
  return Number(value.replaceAll(".", "").replaceAll(",", "."))
}

/**
 * Lê um número escrito por um brasileiro (colado de uma planilha, de um
 * e-mail, de um PDF) e devolve o valor, ou `null` quando o texto não tem
 * número. `R$`, `%`, espaços e qualquer outro texto são ignorados.
 *
 * - Com vírgula, ela é o separador decimal e os pontos são de milhar:
 *   `"1.234,5"` → 1234.5.
 * - Sem vírgula, um único ponto seguido de um ou dois dígitos é decimal:
 *   `"2350.9"` → 2350.9, `"1500.00"` → 1500.
 * - Sem vírgula, pontos de milhar bem formados são milhar: `"1.500"` → 1500,
 *   `"350.000"` → 350000.
 * - Sem vírgula, um ponto que não pode ser de milhar é decimal (número em
 *   formato de máquina): `"1234.567"` → 1234.567, `"0.125"` → 0.125.
 * - Sem separador, é um inteiro: `"1500"` → 1500.
 *
 * Um sinal de menos antes do primeiro dígito torna o número negativo.
 */
export function parseBRNumber(text: string): number | null {
  // Dígitos, separadores e o sinal (hífen ou o "−" tipográfico).
  const kept = text.replace(/[^\d.,\-\u2212]/g, "")
  const firstDigit = kept.search(/\d/)
  if (firstDigit === -1) return null
  const negative = /[-\u2212]/.test(kept.slice(0, firstDigit))
  // Sem o sinal e sem separador sobrando no fim ("R$ 1.500,00.").
  const body = kept.replace(/[-\u2212]/g, "").replace(/[.,]+$/, "")

  let integerPart: string
  let fractionPart = ""
  const lastComma = body.lastIndexOf(",")
  if (lastComma !== -1) {
    integerPart = body.slice(0, lastComma)
    fractionPart = body.slice(lastComma + 1)
  } else {
    const dots = body.split(".").length - 1
    const lastDot = body.lastIndexOf(".")
    const digitsAfterDot = body.length - lastDot - 1
    const isThousands = /^[1-9]\d{0,2}(\.\d{3})+$/.test(body)
    if (dots === 1 && (digitsAfterDot <= 2 || !isThousands)) {
      integerPart = body.slice(0, lastDot)
      fractionPart = body.slice(lastDot + 1)
    } else {
      integerPart = body
    }
  }

  const digits = (part: string) => part.replace(/\D/g, "")
  const value = Number(`${digits(integerPart) || "0"}.${digits(fractionPart) || "0"}`)
  if (!Number.isFinite(value)) return null
  return negative && value !== 0 ? -value : value
}
