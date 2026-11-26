import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Component } from "./component"

/**
 * Template de testes que acompanha `component.tsx`.
 *
 * Cobertura mínima esperada para qualquer field novo:
 *   1. Renderiza com label (label ↔ control associados).
 *   2. Renderiza com description (aria-describedby aponta para ela).
 *   3. Renderiza error e seta aria-invalid="true" + role="alert".
 *   4. Encaminha ref para o elemento DOM correto.
 *   5. Disabled bloqueia interação.
 *   6. Required mostra o asterisco, sem repetir "obrigatório" no nome.
 *   7. Keyboard / change handlers funcionam.
 *   8. Somente leitura recebe foco, não muda e vai no formulário.
 */
describe("Component", () => {
  it("renders with label associated to control", () => {
    render(<Component label="Nome" />)
    const control = screen.getByLabelText("Nome")
    expect(control).toBeInTheDocument()
    expect(control.tagName).toBe("INPUT")
  })

  it("renders description with aria-describedby wiring", () => {
    render(<Component label="E-mail" description="Texto auxiliar" />)
    const control = screen.getByLabelText("E-mail")
    const description = screen.getByText("Texto auxiliar")
    expect(control.getAttribute("aria-describedby")).toContain(description.id)
  })

  it("renders error with role=alert and aria-invalid", () => {
    render(<Component label="Campo" error="Inválido" />)
    expect(screen.getByRole("alert")).toHaveTextContent("Inválido")
    expect(screen.getByLabelText("Campo")).toHaveAttribute("aria-invalid", "true")
  })

  it("forwards ref to the input element", () => {
    let captured: HTMLInputElement | null = null
    render(
      <Component
        label="Campo"
        ref={(el) => {
          captured = el
        }}
      />,
    )
    expect(captured).toBeInstanceOf(HTMLInputElement)
  })

  it("disables interaction when disabled", async () => {
    const user = userEvent.setup()
    render(<Component label="Campo" disabled />)
    const control = screen.getByLabelText("Campo") as HTMLInputElement
    expect(control).toBeDisabled()
    await user.type(control, "abc")
    expect(control.value).toBe("")
  })

  it("keeps a read-only value focusable and unchanged", async () => {
    const user = userEvent.setup()
    render(<Component label="Campo" name="campo" defaultValue="fixo" readOnly />)
    const control = screen.getByLabelText("Campo") as HTMLInputElement
    await user.tab()
    await user.keyboard("abc")
    expect(control).toHaveFocus()
    expect(control.value).toBe("fixo")
    expect(control).not.toHaveAttribute("placeholder")
  })

  it("takes its texts from labels", () => {
    render(<Component label="Campo" labels={{ placeholder: "Nome completo" }} />)
    expect(screen.getByLabelText("Campo")).toHaveAttribute("placeholder", "Nome completo")
  })

  it("renders the required asterisk and aria-required", () => {
    render(<Component label="Campo" required />)
    const control = screen.getByRole("textbox")
    expect(control).toBeRequired()
    expect(control).toHaveAccessibleName("Campo")
    expect(document.querySelector('[data-slot="label-required"]')).toHaveTextContent("*")
  })
})
