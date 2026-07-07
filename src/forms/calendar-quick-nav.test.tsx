import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { Calendar } from "./calendar"

const JUNE_2025 = new Date(2025, 5, 15)

// Each test mounts a full Calendar (react-day-picker renders ~40 day buttons)
// and drives a multi-step click flow. Under the parallel coverage run the V8
// instrumentation overshoots the default 5s per-test budget, so widen it for
// this file only (same approach as the heavier interaction suites).
vi.setConfig({ testTimeout: 20000 })

describe("Calendar quick nav", () => {
  it("renders the caption as a button that opens the years view", async () => {
    const user = userEvent.setup({ delay: null })
    render(<Calendar mode="single" defaultMonth={JUNE_2025} />)

    const caption = screen.getByRole("button", { name: /junho 2025/i })
    expect(caption).toHaveAttribute("aria-expanded", "false")

    await user.click(caption)

    expect(screen.getByRole("group", { name: /escolher ano/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "2025" })).toBeInTheDocument()
    // day grid is replaced while the panel is open
    expect(screen.queryByRole("grid")).not.toBeInTheDocument()
  })

  it("navigates year → month → day and jumps the displayed month", async () => {
    const user = userEvent.setup({ delay: null })
    render(<Calendar mode="single" defaultMonth={JUNE_2025} />)

    await user.click(screen.getByRole("button", { name: /junho 2025/i }))
    await user.click(screen.getByRole("button", { name: "2028" }))

    expect(screen.getByRole("group", { name: /escolher mês/i })).toBeInTheDocument()
    // Jumping to a year with no selected month focuses the first enabled month
    // so keyboard focus isn't dropped.
    expect(screen.getByRole("button", { name: /^jan/i })).toHaveFocus()

    await user.click(screen.getByRole("button", { name: /^mar/i }))

    expect(screen.getByRole("grid")).toBeInTheDocument()
    // Focus returns to the caption trigger after landing back on the day grid.
    const caption = screen.getByRole("button", { name: /março 2028/i })
    expect(caption).toBeInTheDocument()
    expect(caption).toHaveFocus()
  })

  it("focuses the selected month when reopening on its own year", async () => {
    const user = userEvent.setup({ delay: null })
    render(<Calendar mode="single" defaultMonth={JUNE_2025} />)

    await user.click(screen.getByRole("button", { name: /junho 2025/i }))
    await user.click(screen.getByRole("button", { name: "2025" }))

    // Same year as the displayed month → the selected month (junho) takes focus.
    expect(screen.getByRole("button", { name: /^jun/i })).toHaveFocus()
  })

  it("notifies onMonthChange with the picked month", async () => {
    const user = userEvent.setup({ delay: null })
    const onMonthChange = vi.fn()
    render(<Calendar mode="single" defaultMonth={JUNE_2025} onMonthChange={onMonthChange} />)

    await user.click(screen.getByRole("button", { name: /junho 2025/i }))
    await user.click(screen.getByRole("button", { name: "2028" }))
    await user.click(screen.getByRole("button", { name: /^mar/i }))

    expect(onMonthChange).toHaveBeenCalledWith(new Date(2028, 2, 1))
  })

  it("goes back from months to years via the header button", async () => {
    const user = userEvent.setup({ delay: null })
    render(<Calendar mode="single" defaultMonth={JUNE_2025} />)

    await user.click(screen.getByRole("button", { name: /junho 2025/i }))
    await user.click(screen.getByRole("button", { name: "2028" }))
    await user.click(screen.getByRole("button", { name: /2028.*voltar/i }))

    expect(screen.getByRole("group", { name: /escolher ano/i })).toBeInTheDocument()
  })

  it("Escape returns to the day view without changing the month and restores focus", async () => {
    const user = userEvent.setup({ delay: null })
    render(<Calendar mode="single" defaultMonth={JUNE_2025} />)

    await user.click(screen.getByRole("button", { name: /junho 2025/i }))
    await user.keyboard("{Escape}")

    expect(screen.getByRole("grid")).toBeInTheDocument()
    const caption = screen.getByRole("button", { name: /junho 2025/i })
    expect(caption).toBeInTheDocument()
    expect(caption).toHaveFocus()
  })

  it("does not submit a surrounding form when navigating (buttons are type=button)", async () => {
    const user = userEvent.setup({ delay: null })
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <Calendar mode="single" defaultMonth={JUNE_2025} />
      </form>,
    )

    await user.click(screen.getByRole("button", { name: /junho 2025/i }))
    await user.click(screen.getByRole("button", { name: "2028" }))
    await user.click(screen.getByRole("button", { name: /^mar/i }))

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("lists only years within startMonth/endMonth and disables out-of-range months", async () => {
    const user = userEvent.setup({ delay: null })
    render(
      <Calendar
        mode="single"
        defaultMonth={JUNE_2025}
        startMonth={new Date(2025, 0)}
        endMonth={new Date(2026, 5)}
      />,
    )

    await user.click(screen.getByRole("button", { name: /junho 2025/i }))

    expect(screen.getByRole("button", { name: "2025" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "2026" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "2024" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "2027" })).not.toBeInTheDocument()

    // in the boundary year 2026, months after June are disabled
    await user.click(screen.getByRole("button", { name: "2026" }))
    expect(screen.getByRole("button", { name: /^jun/i })).toBeEnabled()
    expect(screen.getByRole("button", { name: /^jul/i })).toBeDisabled()
  })

  it("does not activate when captionLayout is not 'label'", () => {
    render(<Calendar mode="single" defaultMonth={JUNE_2025} captionLayout="dropdown" />)
    expect(screen.queryByRole("button", { name: /junho 2025/i })).not.toBeInTheDocument()
  })
})
