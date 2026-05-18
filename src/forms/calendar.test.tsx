import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Calendar } from "./calendar"

describe("Calendar", () => {
  it("renders with ptBR locale by default", () => {
    const fixedDate = new Date(2025, 0, 15) // January
    render(<Calendar mode="single" defaultMonth={fixedDate} />)
    // ptBR -> Portuguese month name (January = "janeiro")
    expect(screen.getByText(/janeiro/i)).toBeInTheDocument()
  })

  it("renders a grid", () => {
    render(<Calendar mode="single" defaultMonth={new Date(2025, 0, 15)} />)
    expect(screen.getByRole("grid")).toBeInTheDocument()
  })
})
