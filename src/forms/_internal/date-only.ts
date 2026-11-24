/**
 * Date-only values (`"yyyy-MM-dd"`) as the date fields keep them, and the
 * local `Date` the calendar works with. A day of the calendar has no time
 * and no time zone: the `Date` is the local midnight of that day, so it never
 * moves to the day before or after.
 */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})/

const pad = (n: number, length = 2) => String(n).padStart(length, "0")

/** The day exists: 31/02 and month 13 do not. Years have four digits. */
function exists(year: number, month: number, day: number): boolean {
  if (year < 1000 || year > 9999 || month < 1 || month > 12 || day < 1) return false
  return day <= new Date(Date.UTC(year, month, 0)).getUTCDate()
}

/**
 * The date part of a value: `"2025-03-14"` from `"2025-03-14"` and from
 * `"2025-03-14T00:00:00Z"`. `""` when there is no valid date at the start.
 */
export function toIsoDate(value: string | null | undefined): string {
  const match = ISO_DATE.exec(value ?? "")
  if (!match) return ""
  const [, y = "", m = "", d = ""] = match
  return exists(Number(y), Number(m), Number(d)) ? `${y}-${m}-${d}` : ""
}

/** The local midnight of a date-only value, for the calendar. */
export function isoToDate(value: string | null | undefined): Date | undefined {
  const iso = toIsoDate(value)
  if (iso === "") return undefined
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number]
  return new Date(y, m - 1, d)
}

/** The day a calendar `Date` stands for, as `"yyyy-MM-dd"`. */
export function dateToIso(date: Date | undefined): string {
  if (!date || Number.isNaN(date.getTime())) return ""
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** `"15031990"` from `"1990-03-15"`: the digits as they are typed. */
export function isoToDigits(value: string | null | undefined): string {
  const iso = toIsoDate(value)
  if (iso === "") return ""
  return `${iso.slice(8, 10)}${iso.slice(5, 7)}${iso.slice(0, 4)}`
}

/** `"1990-03-15"` from the eight typed digits, or `null` when they are not a real day. */
export function digitsToIso(digits: string): string | null {
  if (!/^\d{8}$/.test(digits)) return null
  const day = Number(digits.slice(0, 2))
  const month = Number(digits.slice(2, 4))
  const year = Number(digits.slice(4, 8))
  if (!exists(year, month, day)) return null
  return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`
}

/** `dd/mm/aaaa` over the typed digits, also while incomplete: `"1503"` → `"15/03"`. */
export function maskDateDigits(digits: string): string {
  const d = digits.slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`
}

/** `"15/03/1990"` from `"1990-03-15"`; `""` when there is no date. */
export function formatIsoDate(value: string | null | undefined): string {
  return maskDateDigits(isoToDigits(value))
}
