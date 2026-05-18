import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Separator } from "./separator"

describe("Separator", () => {
  it("renders a horizontal separator by default", () => {
    const { container } = render(<Separator />)
    const sep = container.querySelector('[data-slot="separator"]')
    expect(sep).toBeInTheDocument()
    expect(sep).toHaveAttribute("data-orientation", "horizontal")
  })

  it("decorative=true does not expose role=separator", () => {
    render(<Separator />)
    expect(screen.queryByRole("separator")).not.toBeInTheDocument()
  })

  it("decorative=false exposes role=separator", () => {
    render(<Separator decorative={false} />)
    expect(screen.getByRole("separator")).toBeInTheDocument()
  })

  it("vertical orientation applies w-px h-full", () => {
    const { container } = render(<Separator orientation="vertical" />)
    const sep = container.querySelector('[data-slot="separator"]')
    expect(sep).toHaveAttribute("data-orientation", "vertical")
    expect(sep).toHaveClass("w-px")
    expect(sep).toHaveClass("h-full")
  })
})
