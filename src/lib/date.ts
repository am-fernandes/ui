/**
 * Datas para exibir e comparar, num modelo só:
 *
 * - **Data pura** (`"2024-01-15"`): um dia do calendário, sem hora e sem
 *   fuso. Vencimento, nascimento, competência. Nunca muda de dia, em nenhum
 *   fuso.
 * - **Instante** (um `Date`, ou um texto com hora e deslocamento, como
 *   `"2024-01-15T23:30:00-03:00"` ou `"...Z"`): um momento exato. O dia e a
 *   hora dele dependem de onde se olha, e aqui se olha de
 *   `America/Sao_Paulo`, salvo se outro `timeZone` for passado.
 * - **Data e hora sem deslocamento** (`"2024-01-15T14:30"`): o relógio da
 *   parede no fuso em uso. É lida igual no servidor e no navegador.
 *
 * Nada aqui depende do fuso da máquina. As funções que devolvem `Date`
 * devolvem instantes: para uma data pura, o da meia-noite daquele dia no
 * fuso, de modo que `formatDate(addDays("2024-01-15", 1))` dá `16/01/2024`.
 *
 * Quem guarda datas puras como instante em UTC (`"2024-01-15T00:00:00.000Z"`)
 * deve passar `timeZone: "UTC"` ou cortar o texto para `YYYY-MM-DD`; lidas em
 * São Paulo, elas caem às 21h do dia anterior.
 */

export type DateFormat = "brl" | "brl-full" | "us" | "time" | "iso"

/** Fuso usado quando nenhum é passado. */
export const DEFAULT_TIME_ZONE = "America/Sao_Paulo"

type DateInput = Date | string | null | undefined

/** O que o calendário e o relógio marcam num lugar. `month` vai de 1 a 12. */
interface WallTime {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  millisecond: number
}

const MS_PER_DAY = 86400000
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/
const LOCAL_DATE_TIME =
  /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3})\d*)?)?$/
const INVALID = () => new Date(Number.NaN)

const formatters = new Map<string, Intl.DateTimeFormat>()

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    formatters.set(timeZone, formatter)
  }
  return formatter
}

/** O calendário e o relógio de um instante, vistos do fuso. */
function wallTimeOf(instant: Date, timeZone: string): WallTime {
  const wall: WallTime = {
    year: 0,
    month: 0,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: instant.getUTCMilliseconds(),
  }
  for (const part of formatterFor(timeZone).formatToParts(instant)) {
    if (part.type in wall) wall[part.type as keyof WallTime] = Number(part.value)
  }
  return wall
}

/** Os campos como se fossem UTC: serve de régua para medir deslocamentos. */
function asUTC(wall: WallTime): number {
  return Date.UTC(
    wall.year,
    wall.month - 1,
    wall.day,
    wall.hour,
    wall.minute,
    wall.second,
    wall.millisecond,
  )
}

/** Quanto o relógio do fuso está adiantado em relação ao UTC naquele instante. */
function offsetAt(ms: number, timeZone: string): number {
  return asUTC(wallTimeOf(new Date(ms), timeZone)) - ms
}

/**
 * O instante em que o relógio do fuso marca `wall`. Campos fora da faixa
 * (dia 32, mês 13) transbordam como em `Date.UTC`.
 */
function instantOf(wall: WallTime, timeZone: string): Date {
  const target = asUTC(wall)
  if (Number.isNaN(target)) return INVALID()
  // O deslocamento depende do instante, que é o que se procura: chuta com o
  // deslocamento de "target" e confere no instante achado. Só muda perto de
  // uma virada de horário de verão.
  const first = target - offsetAt(target, timeZone)
  const offset = offsetAt(first, timeZone)
  const second = target - offset
  if (second === first || offsetAt(second, timeZone) === offset) return new Date(second)
  // Hora que não existe (o relógio pulou): fica com a de depois do pulo.
  return new Date(Math.max(first, second))
}

function numbers(match: RegExpExecArray): number[] {
  return match.slice(1).map((group) => (group === undefined ? 0 : Number(group)))
}

/** `"2024-01-15"` em campos, ou `null` se não for uma data pura que existe. */
function parseDateOnly(value: DateInput): WallTime | null {
  if (typeof value !== "string") return null
  const match = DATE_ONLY.exec(value)
  if (!match) return null
  const [year = 0, month = 0, day = 0] = numbers(match)
  const check = new Date(Date.UTC(year, month - 1, day))
  // 31/02 não existe: `Date.UTC` transbordaria para março.
  if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null
  return { year, month, day, hour: 0, minute: 0, second: 0, millisecond: 0 }
}

/** O instante que um valor representa; `Date` inválido se não der para ler. */
function toInstant(value: DateInput, timeZone: string): Date {
  if (!value) return INVALID()
  if (value instanceof Date) return value
  if (DATE_ONLY.test(value)) {
    const wall = parseDateOnly(value)
    return wall ? instantOf(wall, timeZone) : INVALID()
  }
  const local = LOCAL_DATE_TIME.exec(value)
  if (local) {
    const [year = 0, month = 0, day = 0, hour = 0, minute = 0, second = 0, fraction = 0] =
      numbers(local)
    const digits = local[7]?.length ?? 3
    const millisecond = fraction * 10 ** (3 - digits)
    if (!parseDateOnly(value.slice(0, 10)) || hour > 23 || minute > 59 || second > 59) {
      return INVALID()
    }
    return instantOf({ year, month, day, hour, minute, second, millisecond }, timeZone)
  }
  return new Date(value)
}

/** O dia em que um valor cai no fuso; a data pura cai sempre nela mesma. */
function dayOf(value: DateInput, timeZone: string): WallTime | null {
  const pure = parseDateOnly(value)
  if (pure) return pure
  const instant = toInstant(value, timeZone)
  return Number.isNaN(instant.getTime()) ? null : wallTimeOf(instant, timeZone)
}

/** Número que ordena os dias: 20240115. */
const dayNumber = (wall: WallTime) => wall.year * 10000 + wall.month * 100 + wall.day

const pad = (value: number, length = 2) => String(value).padStart(length, "0")

/**
 * Formata uma data para exibição, no fuso de São Paulo (ou em `timeZone`).
 * Uma data pura sai no mesmo dia em qualquer fuso.
 * @example formatDate("2024-01-15") → "15/01/2024"
 * @example formatDate("2024-01-15", "us") → "2024-01-15"
 * @example formatDate("2024-01-15T23:30:00-03:00", "brl-full") → "15/01/2024 23:30"
 * @example formatDate("2024-01-15T14:30:00Z", "brl-full") → "15/01/2024 11:30"
 * @example formatDate("2024-01-15T14:30:00Z", "brl-full", "UTC") → "15/01/2024 14:30"
 */
export function formatDate(
  date: Date | string | null | undefined,
  format: DateFormat = "brl",
  timeZone: string = DEFAULT_TIME_ZONE,
): string {
  const instant = toInstant(date, timeZone)
  if (Number.isNaN(instant.getTime())) return ""
  if (format === "iso") return instant.toISOString()

  const wall = parseDateOnly(date) ?? wallTimeOf(instant, timeZone)
  const day = pad(wall.day)
  const month = pad(wall.month)
  const year = pad(wall.year, 4)
  const time = `${pad(wall.hour)}:${pad(wall.minute)}`

  switch (format) {
    case "brl":
      return `${day}/${month}/${year}`
    case "brl-full":
      return `${day}/${month}/${year} ${time}`
    case "us":
      return `${year}-${month}-${day}`
    case "time":
      return time
  }
}

/**
 * O instante de uma data (e, se houver, de uma hora) no relógio de São Paulo
 * ou de `timeZone`. Sem hora, é a meia-noite daquele dia.
 * @example parseDate("2024-01-15") → 2024-01-15T03:00:00.000Z (00:00 em São Paulo)
 * @example parseDate("2024-01-15", "14:30") → 2024-01-15T17:30:00.000Z (14:30 em São Paulo)
 * @example parseDate("2024-01-15", "14:30", "UTC") → 2024-01-15T14:30:00.000Z
 */
export function parseDate(date: string, time?: string, timeZone: string = DEFAULT_TIME_ZONE): Date {
  return toInstant(time ? `${date}T${time}` : date, timeZone)
}

/** Retorna true se o valor é uma data válida (não null, não NaN). */
export function isValidDate(date: Date | string | null | undefined): boolean {
  if (!date) return false
  return !Number.isNaN(toInstant(date, DEFAULT_TIME_ZONE).getTime())
}

/**
 * Adiciona dias a uma data, no calendário do fuso: o resultado cai no mesmo
 * horário de N dias depois, mesmo atravessando uma virada de horário de verão.
 */
export function addDays(
  date: Date | string | null | undefined,
  days: number,
  timeZone: string = DEFAULT_TIME_ZONE,
): Date {
  const instant = toInstant(date, timeZone)
  if (Number.isNaN(instant.getTime())) return instant
  const whole = Math.trunc(days)
  const wall = wallTimeOf(instant, timeZone)
  const shifted = instantOf({ ...wall, day: wall.day + whole }, timeZone)
  // A fração de dia (0,5 = doze horas) entra como tempo corrido.
  return days === whole ? shifted : new Date(shifted.getTime() + (days - whole) * MS_PER_DAY)
}

/** Subtrai dias de uma data. */
export function subDays(
  date: Date | string | null | undefined,
  days: number,
  timeZone: string = DEFAULT_TIME_ZONE,
): Date {
  return addDays(date, -days, timeZone)
}

/**
 * Adiciona meses a uma data. Quando o mês de destino não tem o dia de origem,
 * para no último dia dele: 31/01 + 1 mês = 29/02 (ou 28/02), nunca 02/03.
 *
 * Para gerar parcelas, some sempre a partir da data base
 * (`addMonths(base, i)`), não da parcela anterior: assim o vencimento volta ao
 * dia 31 nos meses que têm 31.
 * @example addMonths("2024-01-31", 1) → 29/02/2024
 */
export function addMonths(
  date: Date | string | null | undefined,
  months: number,
  timeZone: string = DEFAULT_TIME_ZONE,
): Date {
  const instant = toInstant(date, timeZone)
  if (Number.isNaN(instant.getTime())) return instant
  const wall = wallTimeOf(instant, timeZone)
  // O dia 1 do mês de destino, para ler ano e mês já normalizados.
  const first = new Date(Date.UTC(wall.year, wall.month - 1 + Math.trunc(months), 1))
  const year = first.getUTCFullYear()
  const month = first.getUTCMonth() + 1
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return instantOf({ ...wall, year, month, day: Math.min(wall.day, lastDay) }, timeZone)
}

/**
 * Compara duas datas. Retorna negativo se a < b, positivo se a > b, 0 se iguais.
 * Útil como comparator para Array.sort().
 */
export function compareDates(
  a: Date | string | null | undefined,
  b: Date | string | null | undefined,
  timeZone: string = DEFAULT_TIME_ZONE,
): number {
  return toInstant(a, timeZone).getTime() - toInstant(b, timeZone).getTime()
}

/** Diferença em dias entre duas datas (a - b). */
export function diffInDays(
  a: Date | string | null | undefined,
  b: Date | string | null | undefined,
  timeZone: string = DEFAULT_TIME_ZONE,
): number {
  return Math.round(compareDates(a, b, timeZone) / MS_PER_DAY)
}

/**
 * Verdadeiro se as duas datas caem no mesmo dia do calendário de São Paulo
 * (ou de `timeZone`). Às 21h30 de 22/11 em São Paulo ainda é dia 22, embora
 * em UTC já seja dia 23.
 */
export function isSameDay(
  a: Date | string | null | undefined,
  b: Date | string | null | undefined,
  timeZone: string = DEFAULT_TIME_ZONE,
): boolean {
  const dayA = dayOf(a, timeZone)
  const dayB = dayOf(b, timeZone)
  return dayA !== null && dayB !== null && dayNumber(dayA) === dayNumber(dayB)
}

/** Início do dia (00:00:00.000) no fuso. */
export function startOfDay(
  date: Date | string | null | undefined,
  timeZone: string = DEFAULT_TIME_ZONE,
): Date {
  const day = dayOf(date, timeZone)
  if (!day) return INVALID()
  return instantOf({ ...day, hour: 0, minute: 0, second: 0, millisecond: 0 }, timeZone)
}

/** Fim do dia (23:59:59.999) no fuso. */
export function endOfDay(
  date: Date | string | null | undefined,
  timeZone: string = DEFAULT_TIME_ZONE,
): Date {
  const day = dayOf(date, timeZone)
  if (!day) return INVALID()
  return instantOf({ ...day, hour: 23, minute: 59, second: 59, millisecond: 999 }, timeZone)
}

/** Primeiro dia do mês (00:00:00.000) no fuso. */
export function startOfMonth(
  date: Date | string | null | undefined,
  timeZone: string = DEFAULT_TIME_ZONE,
): Date {
  const day = dayOf(date, timeZone)
  if (!day) return INVALID()
  return instantOf({ ...day, day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 }, timeZone)
}

/** Último dia do mês (23:59:59.999) no fuso. */
export function endOfMonth(
  date: Date | string | null | undefined,
  timeZone: string = DEFAULT_TIME_ZONE,
): Date {
  const day = dayOf(date, timeZone)
  if (!day) return INVALID()
  const lastDay = new Date(Date.UTC(day.year, day.month, 0)).getUTCDate()
  return instantOf(
    { ...day, day: lastDay, hour: 23, minute: 59, second: 59, millisecond: 999 },
    timeZone,
  )
}

/**
 * Verdadeiro se a data está no passado. Um instante é passado se já
 * aconteceu; uma data pura, só a partir do dia seguinte a ela no fuso (hoje
 * não é passado).
 */
export function isPast(
  date: Date | string | null | undefined,
  timeZone: string = DEFAULT_TIME_ZONE,
): boolean {
  const pure = parseDateOnly(date)
  if (pure) return dayNumber(pure) < dayNumber(wallTimeOf(new Date(Date.now()), timeZone))
  return toInstant(date, timeZone).getTime() < Date.now()
}

/**
 * Verdadeiro se a data está no futuro. Um instante é futuro se ainda não
 * aconteceu; uma data pura, só se for depois de hoje no fuso (hoje não é
 * futuro).
 */
export function isFuture(
  date: Date | string | null | undefined,
  timeZone: string = DEFAULT_TIME_ZONE,
): boolean {
  const pure = parseDateOnly(date)
  if (pure) return dayNumber(pure) > dayNumber(wallTimeOf(new Date(Date.now()), timeZone))
  return toInstant(date, timeZone).getTime() > Date.now()
}
