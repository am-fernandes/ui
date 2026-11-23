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

  it("renders a span with no `for` when it names a group", () => {
    render(
      <Label as="span" id="grupo" htmlFor="x">
        Plano
      </Label>,
    )
    const label = screen.getByText("Plano")
    expect(label.tagName).toBe("SPAN")
    expect(label).not.toHaveAttribute("for")
    expect(label).toHaveAttribute("id", "grupo")
    expect(label).toHaveAttribute("data-slot", "label")
  })

  // The cursor and the 50% of the field are measured in a real browser by
  // tests/e2e/primitives.spec.ts ("Disabled look").
  it("invites the click only while its control is enabled", () => {
    const { rerender } = render(<Label htmlFor="x">Nome</Label>)
    expect(screen.getByText("Nome")).toHaveClass("cursor-pointer")
    rerender(
      <Label htmlFor="x" disabled>
        Nome
      </Label>,
    )
    expect(screen.getByText("Nome")).toHaveClass("cursor-default")
    expect(screen.getByText("Nome")).not.toHaveClass("cursor-pointer")
    // The dimming belongs to the field around it, once.
    expect(screen.getByText("Nome").className).not.toMatch(/opacity/)
  })

  it("does not look clickable when it only names a group", () => {
    render(<Label as="span">Plano</Label>)
    expect(screen.getByText("Plano").className).not.toMatch(/cursor-/)
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
