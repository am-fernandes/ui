/**
 * The `disabledDays` shorthand of the date fields: presets, dates and
 * predicates, turned into one predicate react-day-picker understands.
 */

/** Preset matchers that translate to a date-fns predicate at render time. */
export type DisabledDayPreset = "past" | "future" | "weekends" | "weekdays" | "today"
export type DisabledDays =
  | Date
  | Date[]
  | DisabledDayPreset
  | DisabledDayPreset[]
  | ((date: Date) => boolean)

export function resolveDisabledDays(
  input: DisabledDays | undefined,
): ((date: Date) => boolean) | undefined {
  if (input == null) return undefined
  if (typeof input === "function") return input

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  function matchesPreset(date: Date, preset: DisabledDayPreset): boolean {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    switch (preset) {
      case "past":
        return d.getTime() < startOfToday.getTime()
      case "future":
        return d.getTime() > startOfToday.getTime()
      case "today":
        return d.getTime() === startOfToday.getTime()
      case "weekends":
        return d.getDay() === 0 || d.getDay() === 6
      case "weekdays":
        return d.getDay() >= 1 && d.getDay() <= 5
      default:
        return false
    }
  }

  function isDateInstance(value: unknown): value is Date {
    return value instanceof Date && !Number.isNaN(value.getTime())
  }

  function matchesDate(date: Date, target: Date): boolean {
    return (
      date.getFullYear() === target.getFullYear() &&
      date.getMonth() === target.getMonth() &&
      date.getDate() === target.getDate()
    )
  }

  if (isDateInstance(input)) return (date) => matchesDate(date, input)
  if (typeof input === "string") return (date) => matchesPreset(date, input)
  // Array of presets or dates
  return (date) =>
    (input as Array<Date | DisabledDayPreset>).some((entry) =>
      isDateInstance(entry) ? matchesDate(date, entry) : matchesPreset(date, entry),
    )
}
