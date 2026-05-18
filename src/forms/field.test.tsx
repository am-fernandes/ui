import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Field, FieldGroup } from "./field"

describe("Field", () => {
  it("renders label + description + error around the child control", () => {
    render(
      <Field label="Nome" description="ajuda" error="erro">
        <input id="x" data-testid="ctrl" />
      </Field>,
    )
    expect(screen.getByText("Nome")).toBeInTheDocument()
    expect(screen.getByText("ajuda")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toHaveTextContent("erro")
  })

  it("supports orientation=horizontal", () => {
    const { container } = render(
      <Field label="X" orientation="horizontal">
        <input />
      </Field>,
    )
    expect(container.querySelector('[data-slot="field"]')).toHaveAttribute(
      "data-orientation",
      "horizontal",
    )
  })

  it("renders the required asterisk", () => {
    render(
      <Field label="X" required>
        <input />
      </Field>,
    )
    expect(screen.getByLabelText("obrigatório")).toBeInTheDocument()
  })

  it("dims opacity when disabled", () => {
    const { container } = render(
      <Field label="X" disabled>
        <input />
      </Field>,
    )
    expect(container.querySelector('[data-slot="field"]')).toHaveAttribute("data-disabled", "true")
  })
})

describe("FieldGroup", () => {
  it("renders legend and children as a fieldset", () => {
    render(
      <FieldGroup legend="Dados pessoais" description="Preencha">
        <Field label="Nome">
          <input />
        </Field>
      </FieldGroup>,
    )
    expect(screen.getByText("Dados pessoais").tagName).toBe("LEGEND")
    expect(screen.getByText("Preencha")).toBeInTheDocument()
  })
})
