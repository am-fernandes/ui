import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { DateInput } from "./date-input"

describe("DateInput", () => {
  it("renders placeholder when value is empty", () => {
    render(<DateInput value="" placeholder="Escolha a data" />)
    expect(screen.getByText("Escolha a data")).toBeInTheDocument()
  })

  it("formats ISO value as dd/MM/yyyy", () => {
    render(<DateInput value="2025-03-14" />)
    expect(screen.getByText("14/03/2025")).toBeInTheDocument()
  })

  it("renders disabled as an Input when disabled", () => {
    render(<DateInput value="2025-03-14" disabled />)
    const input = screen.getByDisplayValue("14/03/2025") as HTMLInputElement
    expect(input).toBeDisabled()
  })
})
