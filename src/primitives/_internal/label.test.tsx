import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Label } from "./label"

describe("Label (internal)", () => {
  it("renders text content with the correct `for` attribute", () => {
    render(<Label htmlFor="x">Nome</Label>)
    const label = screen.getByText("Nome")
    expect(label.tagName).toBe("LABEL")
    expect(label.getAttribute("for")).toBe("x")
  })

  it("renders an asterisk when required", () => {
    render(
      <Label htmlFor="x" required>
        Nome
      </Label>,
    )
    expect(screen.getByLabelText("obrigatório")).toBeInTheDocument()
  })

  it("forwards ref to the underlying label element", () => {
    let captured: HTMLLabelElement | null = null
    render(
      <Label
        htmlFor="x"
        ref={(el) => {
          captured = el
        }}
      >
        Nome
      </Label>,
    )
    expect(captured).toBeInstanceOf(HTMLLabelElement)
  })
})
