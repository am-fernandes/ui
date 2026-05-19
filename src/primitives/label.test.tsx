import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Checkbox } from "./checkbox"
import { Label } from "./label"

describe("Label", () => {
  it("renders text and htmlFor attribute", () => {
    render(<Label htmlFor="email">Email</Label>)
    const label = screen.getByText("Email")
    expect(label).toBeInTheDocument()
    expect(label).toHaveAttribute("for", "email")
  })

  it("emits data-slot=label", () => {
    render(<Label>Email</Label>)
    expect(screen.getByText("Email")).toHaveAttribute("data-slot", "label")
  })

  it("includes peer-disabled chain class for disabled peer inputs", () => {
    render(
      <div>
        <Checkbox id="terms" disabled />
        <Label htmlFor="terms">Aceito</Label>
      </div>,
    )
    const label = screen.getByText("Aceito")
    expect(label).toHaveClass("peer-disabled:opacity-50")
    expect(label).toHaveClass("peer-disabled:cursor-not-allowed")
  })

  it("merges consumer className", () => {
    render(<Label className="text-red-500">Red</Label>)
    expect(screen.getByText("Red")).toHaveClass("text-red-500")
  })

  it("renders as child element when asChild is true", () => {
    render(
      <Label asChild>
        <span>Custom</span>
      </Label>,
    )
    const node = screen.getByText("Custom")
    expect(node.tagName).toBe("SPAN")
    expect(node).toHaveAttribute("data-slot", "label")
    expect(node).toHaveClass("text-sm")
    expect(node).toHaveClass("font-medium")
  })
})
