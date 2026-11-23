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

  describe("required", () => {
    const asterisk = () => document.querySelector('[data-slot="label-required"]')

    // The default serves a control that cannot announce "required" itself,
    // such as the button that opens a date picker: the label says it.
    it("draws the asterisk and, by default, says it in hidden words", () => {
      render(
        <FieldShell controlId="c" labelId="l" descriptionId="d" errorId="e" label="Data" required>
          <button id="c" type="button">
            Escolher
          </button>
        </FieldShell>,
      )
      expect(asterisk()).toHaveAttribute("aria-hidden", "true")
      expect(screen.getByRole("button")).toHaveAccessibleName("Data obrigatório")
    })

    it("takes the hidden words from requiredLabel", () => {
      render(
        <FieldShell
          controlId="c"
          labelId="l"
          descriptionId="d"
          errorId="e"
          label="Date"
          required
          requiredLabel="required"
        >
          <button id="c" type="button">
            Pick
          </button>
        </FieldShell>,
      )
      expect(screen.getByRole("button")).toHaveAccessibleName("Date required")
    })

    it("keeps the name clean when the control announces it natively", () => {
      render(
        <FieldShell
          controlId="c"
          labelId="l"
          descriptionId="d"
          errorId="e"
          label="Nome"
          required
          nativeRequired
        >
          <input id="c" required />
        </FieldShell>,
      )
      expect(asterisk()).toHaveTextContent("*")
      expect(screen.getByRole("textbox")).toHaveAccessibleName("Nome")
      expect(screen.getByRole("textbox")).toBeRequired()
    })

    it("draws nothing when the field is not required", () => {
      render(
        <FieldShell controlId="c" labelId="l" descriptionId="d" errorId="e" label="Nome">
          <input id="c" />
        </FieldShell>,
      )
      expect(asterisk()).toBeNull()
      expect(screen.getByRole("textbox")).toHaveAccessibleName("Nome")
    })
  })
})
