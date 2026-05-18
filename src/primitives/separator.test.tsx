import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Separator } from "./separator"

describe("Separator", () => {
  it("renders with data-orientation by default (decorative)", () => {
    const { container } = render(<Separator />)
    const sep = container.querySelector("[data-orientation]")
    expect(sep).toBeInTheDocument()
    expect(sep).toHaveAttribute("data-orientation", "horizontal")
    expect(sep).toHaveAttribute("data-slot", "separator")
  })

  it("decorative=true does not expose role=separator to AT", () => {
    render(<Separator />)
    // When decorative, Radix renders role="none" (no separator semantics).
    expect(screen.queryByRole("separator")).not.toBeInTheDocument()
  })

  it("renders with role=separator when not decorative", () => {
    render(<Separator decorative={false} />)
    expect(screen.getByRole("separator")).toBeInTheDocument()
  })

  it("vertical orientation applies w-[1px] h-full", () => {
    const { container } = render(<Separator orientation="vertical" />)
    const sep = container.querySelector('[data-slot="separator"]')
    expect(sep).toHaveAttribute("data-orientation", "vertical")
    expect(sep).toHaveClass("w-[1px]")
    expect(sep).toHaveClass("h-full")
  })
})
