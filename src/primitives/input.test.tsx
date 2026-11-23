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

  it("is required once: the native attribute says it, the asterisk only shows it", () => {
    render(<Input label="Nome" required />)
    const input = screen.getByRole("textbox")
    expect(input).toBeRequired()
    // Not "Nome obrigatório": a screen reader would say "required" twice.
    expect(input).toHaveAccessibleName("Nome")
    expect(document.querySelector('[data-slot="label-required"]')).toHaveTextContent("*")
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

  // The measured heights (32, 40 and 44px, border included) are asserted in a
  // real browser by tests/e2e/control-size.spec.ts.
  describe("size", () => {
    const wrapper = () => document.querySelector('[data-slot="input-wrapper"]') as HTMLElement

    it("gives the bordered box the shared control height, md by default", () => {
      const { rerender } = render(<Input label="X" />)
      expect(wrapper()).toHaveClass("h-control-md")
      expect(screen.getByLabelText("X")).toHaveClass("px-3", "h-full")
      // The height comes from the box, never from padding on the <input>.
      expect(screen.getByLabelText("X").className).not.toMatch(/(^|\s)py-/)

      rerender(<Input label="X" size="sm" />)
      expect(wrapper()).toHaveClass("h-control-sm")
      expect(screen.getByLabelText("X")).toHaveClass("px-2.5")

      rerender(<Input label="X" size="lg" />)
      expect(wrapper()).toHaveClass("h-control-lg")
      expect(screen.getByLabelText("X")).toHaveClass("px-4")
    })

    it("is our prop, not the native `size` attribute", () => {
      render(<Input label="X" size="sm" />)
      expect(screen.getByLabelText("X")).not.toHaveAttribute("size")
    })
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
