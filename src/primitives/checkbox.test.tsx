import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Checkbox } from "./checkbox"

describe("Checkbox", () => {
  it("renders with role=checkbox", () => {
    render(<Checkbox id="terms" />)
    expect(screen.getByRole("checkbox")).toBeInTheDocument()
  })

  it("toggles aria-checked when clicked", async () => {
    render(<Checkbox id="terms" />)
    const checkbox = screen.getByRole("checkbox")
    expect(checkbox).toHaveAttribute("aria-checked", "false")
    await userEvent.click(checkbox)
    expect(checkbox).toHaveAttribute("aria-checked", "true")
  })
})
