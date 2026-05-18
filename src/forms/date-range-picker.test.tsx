import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { DateRangePicker } from "./date-range-picker"

describe("DateRangePicker", () => {
  it("renders the placeholder when value is empty range", () => {
    render(
      <DateRangePicker
        label="Período"
        value={{ from: "", to: "" }}
        onChange={() => {}}
        placeholder="Selecione"
      />,
    )
    expect(screen.getByText("Selecione")).toBeInTheDocument()
  })

  it("renders the formatted range when both dates are set", () => {
    render(
      <DateRangePicker
        label="Período"
        value={{ from: "2025-01-01", to: "2025-01-31" }}
        onChange={() => {}}
      />,
    )
    expect(screen.getByText(/01\/01\/2025.*31\/01\/2025/)).toBeInTheDocument()
  })

  it("renders the error", () => {
    render(
      <DateRangePicker
        label="X"
        value={{ from: "", to: "" }}
        onChange={() => {}}
        error="obrigatório"
      />,
    )
    expect(screen.getByRole("alert")).toHaveTextContent("obrigatório")
  })

  it("respects disabled", () => {
    render(<DateRangePicker label="X" value={{ from: "", to: "" }} onChange={() => {}} disabled />)
    expect(screen.getByRole("button")).toBeDisabled()
  })
})
