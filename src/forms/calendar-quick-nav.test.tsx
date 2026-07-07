import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { Calendar } from "./calendar"

const JUNE_2025 = new Date(2025, 5, 15)

describe("Calendar quick nav", () => {
  it("renders the caption as a button that opens the years view", async () => {
    const user = userEvent.setup()
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
    const user = userEvent.setup()
    render(<Calendar mode="single" defaultMonth={JUNE_2025} />)

    await user.click(screen.getByRole("button", { name: /junho 2025/i }))
    await user.click(screen.getByRole("button", { name: "2028" }))

    expect(screen.getByRole("group", { name: /escolher mês/i })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /^mar/i }))

    expect(screen.getByRole("grid")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /março 2028/i })).toBeInTheDocument()
  })

  it("notifies onMonthChange with the picked month", async () => {
    const user = userEvent.setup()
    const onMonthChange = vi.fn()
    render(<Calendar mode="single" defaultMonth={JUNE_2025} onMonthChange={onMonthChange} />)

    await user.click(screen.getByRole("button", { name: /junho 2025/i }))
    await user.click(screen.getByRole("button", { name: "2028" }))
    await user.click(screen.getByRole("button", { name: /^mar/i }))

    expect(onMonthChange).toHaveBeenCalledWith(new Date(2028, 2, 1))
  })

  it("goes back from months to years via the header button", async () => {
    const user = userEvent.setup()
    render(<Calendar mode="single" defaultMonth={JUNE_2025} />)

    await user.click(screen.getByRole("button", { name: /junho 2025/i }))
    await user.click(screen.getByRole("button", { name: "2028" }))
    await user.click(screen.getByRole("button", { name: /2028.*voltar/i }))

    expect(screen.getByRole("group", { name: /escolher ano/i })).toBeInTheDocument()
  })

  it("Escape returns to the day view without changing the month", async () => {
    const user = userEvent.setup()
    render(<Calendar mode="single" defaultMonth={JUNE_2025} />)

    await user.click(screen.getByRole("button", { name: /junho 2025/i }))
    await user.keyboard("{Escape}")

    expect(screen.getByRole("grid")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /junho 2025/i })).toBeInTheDocument()
  })

  it("lists only years within startMonth/endMonth and disables out-of-range months", async () => {
    const user = userEvent.setup()
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
