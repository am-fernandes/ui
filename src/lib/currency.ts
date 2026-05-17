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
