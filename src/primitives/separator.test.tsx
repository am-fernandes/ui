import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Separator } from "./separator"

describe("Separator", () => {
  it("renders with role=none by default (decorative)", () => {
    const { container } = render(<Separator />)
    // Radix sets role="none" when decorative=true (default)
    const sep = container.querySelector("[data-orientation]")
    expect(sep).toBeInTheDocument()
    expect(sep).toHaveAttribute("data-orientation", "horizontal")
  })

  it("renders with role=separator when not decorative", () => {
    render(<Separator decorative={false} />)
    expect(screen.getByRole("separator")).toBeInTheDocument()
  })
})
