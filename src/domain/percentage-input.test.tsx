import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { PercentageInput } from "./percentage-input"

describe("PercentageInput", () => {
  it("renders value formatted with two decimals", () => {
    render(<PercentageInput value={33.33} onValueChange={vi.fn()} />)
    expect(screen.getByDisplayValue("33,33")).toBeInTheDocument()
    expect(screen.getByText("%")).toBeInTheDocument()
  })

  it("renders zero as 0,00", () => {
    render(<PercentageInput value={0} onValueChange={vi.fn()} />)
    expect(screen.getByDisplayValue("0,00")).toBeInTheDocument()
  })
})
