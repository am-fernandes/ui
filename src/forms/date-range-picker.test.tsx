import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { DateRangePicker } from "./date-range-picker"

describe("DateRangePicker", () => {
  it("renders placeholder when both empty", () => {
    render(
      <DateRangePicker
        from=""
        to=""
        onFromChange={vi.fn()}
        onToChange={vi.fn()}
        placeholder="Período"
      />,
    )
    expect(screen.getByText("Período")).toBeInTheDocument()
  })

  it("renders the formatted range when values are set", () => {
    render(
      <DateRangePicker
        from="2025-03-01"
        to="2025-03-10"
        onFromChange={vi.fn()}
        onToChange={vi.fn()}
      />,
    )
    expect(screen.getByText(/01\/03\/2025/)).toBeInTheDocument()
    expect(screen.getByText(/10\/03\/2025/)).toBeInTheDocument()
  })
})
