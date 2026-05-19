import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { enUS } from "date-fns/locale"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { Calendar } from "./calendar"

// Stable visible month used across tests. June 2025 contains:
//   - Sun 1, Sat 7 (weekend)
//   - Mon 2, Fri 6 (weekday)
//   - many days far enough from "today" to be past/future
const FIXED_MONTH = new Date(2025, 5, 15) // June 2025

/** Helper: pull a day-cell button by ISO `data-day` attribute. */
function dayButton(iso: string): HTMLButtonElement | null {
  return document.querySelector<HTMLButtonElement>(`button[data-day="${iso}"]`)
}

describe("Calendar", () => {
  it("renders with ptBR locale by default", () => {
    render(<Calendar mode="single" defaultMonth={new Date(2025, 0, 15)} />)
    // ptBR -> Portuguese month name (January = "janeiro")
    expect(screen.getByText(/janeiro/i)).toBeInTheDocument()
  })

  it("renders a grid", () => {
    render(<Calendar mode="single" defaultMonth={new Date(2025, 0, 15)} />)
    expect(screen.getByRole("grid")).toBeInTheDocument()
  })

  it("renders with custom locale (enUS) — month name in English", () => {
    render(<Calendar mode="single" defaultMonth={new Date(2025, 0, 15)} locale={enUS} />)
    expect(screen.getByText(/january/i)).toBeInTheDocument()
  })

  it("returns undefined disabledDays predicate when input is nullish", async () => {
    // disabledDays={undefined} should leave every day enabled.
    render(<Calendar mode="single" defaultMonth={FIXED_MONTH} />)
    const btn = dayButton("2025-06-10")
    expect(btn).not.toBeNull()
    expect(btn).not.toBeDisabled()
  })

  it("falls back to the bare `disabled` prop when disabledDays is undefined", () => {
    // `disabled` accepts the same matcher as react-day-picker; pass a single Date matcher
    const target = new Date(2025, 5, 9)
    render(<Calendar mode="single" defaultMonth={FIXED_MONTH} disabled={target} />)
    const btn = dayButton("2025-06-09")
    expect(btn).toBeDisabled()
  })

  it("disabledDays takes precedence over the bare `disabled` prop", () => {
    // disabled would block 09; disabledDays blocks 10 only.
    const blockedByDisabled = new Date(2025, 5, 9)
    const blockedByDisabledDays = new Date(2025, 5, 10)
    render(
      <Calendar
        mode="single"
        defaultMonth={FIXED_MONTH}
        disabled={blockedByDisabled}
        disabledDays={blockedByDisabledDays}
      />,
    )
    // 09 is no longer disabled because disabledDays replaces `disabled`.
    expect(dayButton("2025-06-09")).not.toBeDisabled()
    // 10 is disabled by the resolved matcher.
    expect(dayButton("2025-06-10")).toBeDisabled()
  })

  it("disabledDays accepts a single Date", () => {
    const target = new Date(2025, 5, 17)
    render(<Calendar mode="single" defaultMonth={FIXED_MONTH} disabledDays={target} />)
    expect(dayButton("2025-06-17")).toBeDisabled()
    expect(dayButton("2025-06-18")).not.toBeDisabled()
  })

  it("disabledDays accepts a custom predicate function", () => {
    render(
      <Calendar
        mode="single"
        defaultMonth={FIXED_MONTH}
        disabledDays={(d) => d.getDate() === 13}
      />,
    )
    expect(dayButton("2025-06-13")).toBeDisabled()
    expect(dayButton("2025-06-12")).not.toBeDisabled()
  })

  it("disabledDays preset 'past' disables days before today", () => {
    // Use a fake clock so 'today' is fixed inside June 2025.
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 5, 15, 12, 0, 0))
    try {
      render(<Calendar mode="single" defaultMonth={FIXED_MONTH} disabledDays="past" />)
      expect(dayButton("2025-06-14")).toBeDisabled() // yesterday -> past
      expect(dayButton("2025-06-15")).not.toBeDisabled() // today -> not past
      expect(dayButton("2025-06-16")).not.toBeDisabled() // tomorrow -> not past
    } finally {
      vi.useRealTimers()
    }
  })

  it("disabledDays preset 'future' disables days after today", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 5, 15, 12, 0, 0))
    try {
      render(<Calendar mode="single" defaultMonth={FIXED_MONTH} disabledDays="future" />)
      expect(dayButton("2025-06-16")).toBeDisabled() // future
      expect(dayButton("2025-06-15")).not.toBeDisabled() // today
      expect(dayButton("2025-06-14")).not.toBeDisabled() // past
    } finally {
      vi.useRealTimers()
    }
  })

  it("disabledDays preset 'today' disables only the current day", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 5, 15, 12, 0, 0))
    try {
      render(<Calendar mode="single" defaultMonth={FIXED_MONTH} disabledDays="today" />)
      expect(dayButton("2025-06-15")).toBeDisabled()
      expect(dayButton("2025-06-14")).not.toBeDisabled()
      expect(dayButton("2025-06-16")).not.toBeDisabled()
    } finally {
      vi.useRealTimers()
    }
  })

  it("disabledDays preset 'weekends' disables Saturdays and Sundays", () => {
    render(<Calendar mode="single" defaultMonth={FIXED_MONTH} disabledDays="weekends" />)
    // June 2025: Sun 1, Sat 7
    expect(dayButton("2025-06-01")).toBeDisabled()
    expect(dayButton("2025-06-07")).toBeDisabled()
    // Mid-week (Mon 2) stays enabled.
    expect(dayButton("2025-06-02")).not.toBeDisabled()
  })

  it("disabledDays preset 'weekdays' disables Monday through Friday", () => {
    render(<Calendar mode="single" defaultMonth={FIXED_MONTH} disabledDays="weekdays" />)
    // Mon 2 to Fri 6 should be disabled.
    expect(dayButton("2025-06-02")).toBeDisabled()
    expect(dayButton("2025-06-06")).toBeDisabled()
    // Weekend stays enabled.
    expect(dayButton("2025-06-01")).not.toBeDisabled()
    expect(dayButton("2025-06-07")).not.toBeDisabled()
  })

  it("disabledDays accepts a mixed array of Date and preset", () => {
    const blocked = new Date(2025, 5, 10)
    // Cast: implementation accepts mixed arrays but type is union of homogeneous arrays.
    const mixed = ["weekends", blocked] as unknown as Date[]
    render(<Calendar mode="single" defaultMonth={FIXED_MONTH} disabledDays={mixed} />)
    // Date entry
    expect(dayButton("2025-06-10")).toBeDisabled()
    // 'weekends' preset entry
    expect(dayButton("2025-06-01")).toBeDisabled()
    expect(dayButton("2025-06-07")).toBeDisabled()
    // Other weekday still enabled.
    expect(dayButton("2025-06-03")).not.toBeDisabled()
  })

  it("clicking an enabled day fires onSelect with that date", async () => {
    const onSelect = vi.fn()
    render(<Calendar mode="single" defaultMonth={FIXED_MONTH} onSelect={onSelect} />)
    const target = dayButton("2025-06-12")
    expect(target).not.toBeNull()
    if (target) await userEvent.click(target)
    expect(onSelect).toHaveBeenCalled()
    const arg = onSelect.mock.calls.at(-1)?.[0] as Date | undefined
    expect(arg).toBeInstanceOf(Date)
    expect(arg?.getDate()).toBe(12)
    expect(arg?.getMonth()).toBe(5)
  })

  it("memoized components are reused while locale stays the same", () => {
    // Render twice with the same locale; the inner DayPicker should accept
    // identical `components` references (smoke test for the memoization path).
    const { rerender } = render(<Calendar mode="single" defaultMonth={FIXED_MONTH} />)
    rerender(<Calendar mode="single" defaultMonth={FIXED_MONTH} />)
    expect(screen.getByRole("grid")).toBeInTheDocument()
  })

  it("re-memoizes components when locale changes (en-US then pt-BR)", () => {
    const { rerender } = render(
      <Calendar mode="single" defaultMonth={new Date(2025, 0, 15)} locale={enUS} />,
    )
    expect(screen.getByText(/january/i)).toBeInTheDocument()
    rerender(<Calendar mode="single" defaultMonth={new Date(2025, 0, 15)} />)
    // Default locale is ptBR — "janeiro" should now appear.
    expect(screen.getByText(/janeiro/i)).toBeInTheDocument()
  })

  it("forwards the ref to the root element via the Root component", () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<Calendar mode="single" defaultMonth={FIXED_MONTH} ref={ref} />)
    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName.toLowerCase()).toBe("div")
  })

  it("renders next/previous month navigation buttons (Chevron)", () => {
    render(<Calendar mode="single" defaultMonth={FIXED_MONTH} />)
    // react-day-picker labels navigation buttons via aria-label
    const nav = screen.getAllByRole("button", { name: /(previous|next|próx|anterior)/i })
    expect(nav.length).toBeGreaterThanOrEqual(2)
  })

  it("accepts the labels prop without forwarding it as an HTML attribute (reserved for future strings)", () => {
    // labels is currently reserved; the wrapper accepts it but does not consume it,
    // and react-day-picker handles all grid copy via `locale`.
    const { container } = render(
      <Calendar mode="single" defaultMonth={FIXED_MONTH} labels={{}} />,
    )
    const root = container.querySelector('[data-slot="calendar"]')
    expect(root).not.toBeNull()
    // The prop must not leak to the DOM.
    expect(root?.getAttribute("labels")).toBeNull()
  })

  it("uses dropdown captionLayout — shows month/year selects", () => {
    render(<Calendar mode="single" defaultMonth={FIXED_MONTH} captionLayout="dropdown" />)
    // The dropdown layout renders <select> elements for month and year.
    const selects = document.querySelectorAll("select")
    expect(selects.length).toBeGreaterThanOrEqual(1)
  })
})
