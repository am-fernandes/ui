export type DateFormat = "brl" | "brl-full" | "us" | "time" | "iso"

const MS_PER_DAY = 86400000

function toUTCDate(value: Date | string | null | undefined): Date {
  if (!value) return new Date(Number.NaN)
  if (value instanceof Date) return value
  return new Date(value)
}

/**
 * Formata uma data para exibição.
 * @example formatDate("2024-01-15") → "15/01/2024"
 * @example formatDate("2024-01-15", "us") → "2024-01-15"
 * @example formatDate("2024-01-15T14:30:00Z", "brl-full") → "15/01/2024 14:30"
 */
export function formatDate(
  date: Date | string | null | undefined,
  format: DateFormat = "brl",
): string {
  const d = toUTCDate(date)
  if (Number.isNaN(d.getTime())) return ""

  const day = String(d.getUTCDate()).padStart(2, "0")
  const month = String(d.getUTCMonth() + 1).padStart(2, "0")
  const year = d.getUTCFullYear()
  const hours = String(d.getUTCHours()).padStart(2, "0")
  const minutes = String(d.getUTCMinutes()).padStart(2, "0")

  switch (format) {
    case "brl":
      return `${day}/${month}/${year}`
    case "brl-full":
      return `${day}/${month}/${year} ${hours}:${minutes}`
    case "us":
      return `${year}-${month}-${day}`
    case "time":
      return `${hours}:${minutes}`
    case "iso":
      return d.toISOString()
  }
}

/**
 * Cria um Date UTC a partir de uma string de data e opcionalmente hora.
 * @example parseDate("2024-01-15") → Date UTC 2024-01-15T00:00:00.000Z
 * @example parseDate("2024-01-15", "14:30") → Date UTC 2024-01-15T14:30:00.000Z
 */
export function parseDate(date: string, time?: string): Date {
  if (!time) return new Date(`${date}T00:00:00.000Z`)
  return new Date(`${date}T${time}:00.000Z`)
}

/** Retorna true se o valor é uma data válida (não null, não NaN). */
export function isValidDate(date: Date | string | null | undefined): boolean {
  if (!date) return false
  return !Number.isNaN(toUTCDate(date).getTime())
}

/** Adiciona dias a uma data. */
export function addDays(date: Date | string | null | undefined, days: number): Date {
  return new Date(toUTCDate(date).getTime() + days * MS_PER_DAY)
}

/** Subtrai dias de uma data. */
export function subDays(date: Date | string | null | undefined, days: number): Date {
  return addDays(date, -days)
}

/** Adiciona meses a uma data. */
export function addMonths(date: Date | string | null | undefined, months: number): Date {
  const d = new Date(toUTCDate(date))
  d.setUTCMonth(d.getUTCMonth() + months)
  return d
}

/**
 * Compara duas datas. Retorna negativo se a < b, positivo se a > b, 0 se iguais.
 * Útil como comparator para Array.sort().
 */
export function compareDates(
  a: Date | string | null | undefined,
  b: Date | string | null | undefined,
): number {
  return toUTCDate(a).getTime() - toUTCDate(b).getTime()
}

/** Diferença em dias entre duas datas (a - b). */
export function diffInDays(
  a: Date | string | null | undefined,
  b: Date | string | null | undefined,
): number {
  return Math.round((toUTCDate(a).getTime() - toUTCDate(b).getTime()) / MS_PER_DAY)
}

/** Verdadeiro se as duas datas representam o mesmo dia UTC. */
export function isSameDay(
  a: Date | string | null | undefined,
  b: Date | string | null | undefined,
): boolean {
  const da = toUTCDate(a)
  const db = toUTCDate(b)
  return (
    da.getUTCFullYear() === db.getUTCFullYear() &&
    da.getUTCMonth() === db.getUTCMonth() &&
    da.getUTCDate() === db.getUTCDate()
  )
}

/** Início do dia (00:00:00.000 UTC). */
export function startOfDay(date: Date | string | null | undefined): Date {
  const d = toUTCDate(date)
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

/** Fim do dia (23:59:59.999 UTC). */
export function endOfDay(date: Date | string | null | undefined): Date {
  const d = toUTCDate(date)
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999))
}

/** Primeiro dia do mês (00:00:00.000 UTC). */
export function startOfMonth(date: Date | string | null | undefined): Date {
  const d = toUTCDate(date)
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
}

/** Último dia do mês (23:59:59.999 UTC). */
export function endOfMonth(date: Date | string | null | undefined): Date {
  const d = toUTCDate(date)
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59, 999))
}

/** Verdadeiro se a data está no passado (antes de agora). */
export function isPast(date: Date | string | null | undefined): boolean {
  return toUTCDate(date).getTime() < Date.now()
}

/** Verdadeiro se a data está no futuro (após agora). */
export function isFuture(date: Date | string | null | undefined): boolean {
  return toUTCDate(date).getTime() > Date.now()
}
