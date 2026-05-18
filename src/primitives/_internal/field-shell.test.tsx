import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { FieldShell } from "./field-shell"

describe("FieldShell", () => {
  it("renders label, description, error, and children together", () => {
    render(
      <FieldShell
        controlId="c"
        labelId="l"
        descriptionId="d"
        errorId="e"
        label="Nome"
        description="Conforme RG"
        error="Campo obrigatório"
      >
        <input id="c" />
      </FieldShell>,
    )

    expect(screen.getByText("Nome").tagName).toBe("LABEL")
    expect(screen.getByText("Conforme RG")).toBeInTheDocument()
    expect(screen.getByText("Campo obrigatório")).toHaveAttribute("role", "alert")
  })

  it("omits description and error slots when not provided", () => {
    render(
      <FieldShell controlId="c" labelId="l" descriptionId="d" errorId="e" label="Nome">
        <input id="c" />
      </FieldShell>,
    )
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("supports labelPosition='hidden' (sr-only label, no visible text)", () => {
    render(
      <FieldShell
        controlId="c"
        labelId="l"
        descriptionId="d"
        errorId="e"
        label="Nome"
        labelPosition="hidden"
      >
        <input id="c" />
      </FieldShell>,
    )
    expect(screen.getByText("Nome")).toHaveClass("sr-only")
  })

  it("supports labelPosition='left' inline layout", () => {
    const { container } = render(
      <FieldShell
        controlId="c"
        labelId="l"
        descriptionId="d"
        errorId="e"
        label="Nome"
        labelPosition="left"
      >
        <input id="c" />
      </FieldShell>,
    )
    expect(container.querySelector('[data-slot="field-shell"]')).toHaveAttribute(
      "data-label-position",
      "left",
    )
  })

  it("renders required asterisk on label", () => {
    render(
      <FieldShell controlId="c" labelId="l" descriptionId="d" errorId="e" label="Nome" required>
        <input id="c" />
      </FieldShell>,
    )
    expect(screen.getByLabelText("obrigatório")).toBeInTheDocument()
  })
})
