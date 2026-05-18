import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Input } from "./input"

describe("Input", () => {
  it("renders label associated with input", () => {
    render(<Input label="Nome" />)
    const input = screen.getByLabelText("Nome")
    expect(input).toBeInTheDocument()
    expect(input.tagName).toBe("INPUT")
  })

  it("renders description with aria-describedby wiring", () => {
    render(<Input label="E-mail" description="Não compartilharemos" />)
    const input = screen.getByLabelText("E-mail")
    const description = screen.getByText("Não compartilharemos")
    expect(input.getAttribute("aria-describedby")).toContain(description.id)
  })

  it("renders error message with role=alert", () => {
    render(<Input label="E-mail" error="Inválido" />)
    expect(screen.getByRole("alert")).toHaveTextContent("Inválido")
    expect(screen.getByLabelText("E-mail")).toHaveAttribute("aria-invalid", "true")
  })

  it("hides label visually with labelPosition='hidden' but keeps it for AT", () => {
    render(<Input label="Busca" labelPosition="hidden" />)
    expect(screen.getByText("Busca")).toHaveClass("sr-only")
    expect(screen.getByLabelText("Busca")).toBeInTheDocument()
  })

  it("renders required asterisk", () => {
    render(<Input label="Nome" required />)
    expect(screen.getByLabelText("obrigatório")).toBeInTheDocument()
  })

  it("renders leadingIcon inside the input wrapper", () => {
    render(<Input label="Busca" leadingIcon={<span data-testid="lead">L</span>} />)
    expect(screen.getByTestId("lead")).toBeInTheDocument()
  })

  it("renders trailingIcon inside the input wrapper", () => {
    render(
      <Input
        label="Senha"
        trailingIcon={
          <button type="button" data-testid="trail">
            show
          </button>
        }
      />,
    )
    expect(screen.getByTestId("trail")).toBeInTheDocument()
  })

  it("forwards onChange and value (controlled)", () => {
    const onChange = vi.fn()
    render(<Input label="X" value="abc" onChange={onChange} />)
    const input = screen.getByLabelText("X") as HTMLInputElement
    expect(input.value).toBe("abc")
    fireEvent.change(input, { target: { value: "abcd" } })
    expect(onChange).toHaveBeenCalled()
  })

  it("respects disabled and readOnly", () => {
    const { rerender } = render(<Input label="X" disabled />)
    expect(screen.getByLabelText("X")).toBeDisabled()
    rerender(<Input label="X" readOnly />)
    expect(screen.getByLabelText("X")).toHaveAttribute("readonly")
  })

  it("forwards ref to the input element", () => {
    let captured: HTMLInputElement | null = null
    render(
      <Input
        label="X"
        ref={(el) => {
          captured = el
        }}
      />,
    )
    expect(captured).toBeInstanceOf(HTMLInputElement)
  })
})
