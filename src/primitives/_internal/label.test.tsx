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

  // The asterisk had `aria-label="obrigatório"` on a <span>: it became part of
  // the name of the control ("E-mail obrigatório"), on top of the "required"
  // the control already announces.
  it("draws the required asterisk for the eye only", () => {
    render(
      <>
        <Label htmlFor="x" required>
          Nome
        </Label>
        <input id="x" required />
      </>,
    )
    const asterisk = document.querySelector('[data-slot="label-required"]')
    expect(asterisk).toHaveTextContent("*")
    expect(asterisk).toHaveAttribute("aria-hidden", "true")
    expect(asterisk).not.toHaveAttribute("aria-label")
    expect(screen.getByRole("textbox")).toHaveAccessibleName("Nome")
  })

  it("adds hidden words for a control that cannot say it is required itself", () => {
    render(
      <>
        <Label htmlFor="x" required requiredText="obrigatório">
          Data
        </Label>
        <button id="x" type="button">
          Escolher
        </button>
      </>,
    )
    expect(screen.getByRole("button")).toHaveAccessibleName("Data obrigatório")
    expect(screen.getByText("obrigatório")).toHaveClass("sr-only")
  })

  it("has no asterisk and no hidden words when not required", () => {
    render(
      <Label htmlFor="x" requiredText="obrigatório">
        Nome
      </Label>,
    )
    expect(document.querySelector('[data-slot="label-required"]')).toBeNull()
    expect(screen.queryByText("obrigatório")).not.toBeInTheDocument()
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
