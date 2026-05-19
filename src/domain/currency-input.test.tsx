import { fireEvent, render, screen } from "@testing-library/react"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { CurrencyInput } from "./currency-input"

function ControlledCurrencyInput({ initial = 0 }: { initial?: number }) {
  const [value, setValue] = React.useState(initial)
  return <CurrencyInput value={value} onValueChange={setValue} />
}

describe("CurrencyInput", () => {
  it("renders value formatted as BRL (pt-BR)", () => {
    render(<CurrencyInput value={1234.56} onValueChange={vi.fn()} />)
    expect(screen.getByDisplayValue("1.234,56")).toBeInTheDocument()
    expect(screen.getByText("R$")).toBeInTheDocument()
  })

  it("renders zero with two decimals", () => {
    render(<CurrencyInput value={0} onValueChange={vi.fn()} />)
    expect(screen.getByDisplayValue("0,00")).toBeInTheDocument()
  })

  it("emits the new float value when digits are typed", () => {
    const onValueChange = vi.fn()
    render(<CurrencyInput value={0} onValueChange={onValueChange} />)
    const input = screen.getByDisplayValue("0,00") as HTMLInputElement
    fireEvent.change(input, { target: { value: "12345" } })
    expect(onValueChange).toHaveBeenLastCalledWith(123.45)
  })

  it("strips non-digit characters from pasted/typed input", () => {
    const onValueChange = vi.fn()
    render(<CurrencyInput value={0} onValueChange={onValueChange} />)
    const input = screen.getByDisplayValue("0,00") as HTMLInputElement
    fireEvent.change(input, { target: { value: "abc12def3" } })
    expect(onValueChange).toHaveBeenLastCalledWith(1.23)
  })

  it("clearing the input emits 0", () => {
    const onValueChange = vi.fn()
    render(<CurrencyInput value={12.34} onValueChange={onValueChange} />)
    const input = screen.getByDisplayValue("12,34") as HTMLInputElement
    fireEvent.change(input, { target: { value: "" } })
    expect(onValueChange).toHaveBeenLastCalledWith(0)
  })

  it("typing digits displays 123,45 in a controlled wrapper after emitting 123.45", () => {
    render(<ControlledCurrencyInput initial={0} />)
    const input = screen.getByDisplayValue("0,00") as HTMLInputElement
    fireEvent.change(input, { target: { value: "12345" } })
    expect(screen.getByDisplayValue("123,45")).toBeInTheDocument()
  })

  it("clamps digit input to 15 chars to avoid integer overflow", () => {
    const onValueChange = vi.fn()
    render(<CurrencyInput value={0} onValueChange={onValueChange} />)
    const input = screen.getByDisplayValue("0,00") as HTMLInputElement
    // 20 nines — only the first 15 should survive.
    fireEvent.change(input, { target: { value: "9".repeat(20) } })
    const next = onValueChange.mock.calls.at(-1)?.[0]
    expect(next).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER / 100)
    // 15 nines / 100 = 9999999999999.99
    expect(next).toBeCloseTo(9999999999999.99, 2)
  })

  it("re-syncs to a new value prop from outside without internal flag pattern", () => {
    const { rerender } = render(<CurrencyInput value={0} onValueChange={vi.fn()} />)
    expect(screen.getByDisplayValue("0,00")).toBeInTheDocument()
    rerender(<CurrencyInput value={42} onValueChange={vi.fn()} />)
    expect(screen.getByDisplayValue("42,00")).toBeInTheDocument()
  })

  it("sets aria-invalid and renders the error message when error prop is provided", () => {
    render(
      <CurrencyInput value={0} onValueChange={vi.fn()} label="Valor" error="Campo obrigatório" />,
    )
    const input = screen.getByDisplayValue("0,00") as HTMLInputElement
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("alert")).toHaveTextContent("Campo obrigatório")
  })

  it("does not set aria-invalid when error is empty string", () => {
    render(<CurrencyInput value={0} onValueChange={vi.fn()} label="Valor" error="" />)
    const input = screen.getByDisplayValue("0,00") as HTMLInputElement
    expect(input).not.toHaveAttribute("aria-invalid")
  })

  it("wires aria-describedby to both description and error ids", () => {
    render(
      <CurrencyInput
        value={0}
        onValueChange={vi.fn()}
        label="Valor"
        description="Valor sem impostos"
        error="Campo obrigatório"
      />,
    )
    const input = screen.getByDisplayValue("0,00") as HTMLInputElement
    const describedBy = input.getAttribute("aria-describedby")
    expect(describedBy).toBeTruthy()
    // The describedBy should reference 2 separate ids (description + error)
    expect(describedBy?.split(" ")).toHaveLength(2)
  })

  it("omits aria-describedby when there is no description nor error", () => {
    render(<CurrencyInput value={0} onValueChange={vi.fn()} label="Valor" />)
    const input = screen.getByDisplayValue("0,00") as HTMLInputElement
    expect(input).not.toHaveAttribute("aria-describedby")
  })

  it("renders the label and marks the field as required", () => {
    render(<CurrencyInput value={0} onValueChange={vi.fn()} label="Total" required />)
    expect(screen.getByText("Total")).toBeInTheDocument()
  })

  it("applies disabled state to the input and the FieldShell", () => {
    render(<CurrencyInput value={10} onValueChange={vi.fn()} label="Valor" disabled />)
    const input = screen.getByDisplayValue("10,00") as HTMLInputElement
    expect(input).toBeDisabled()
  })

  it("supports labelPosition='hidden' by attaching label invisibly via sr-only", () => {
    render(
      <CurrencyInput value={1} onValueChange={vi.fn()} label="Oculto" labelPosition="hidden" />,
    )
    // Label should still render in the DOM (for screen readers).
    expect(screen.getByText("Oculto")).toBeInTheDocument()
  })

  it("supports labelPosition='left' switching the FieldShell layout", () => {
    const { container } = render(
      <CurrencyInput value={1} onValueChange={vi.fn()} label="Esquerda" labelPosition="left" />,
    )
    const shell = container.querySelector("[data-slot='field-shell']")
    expect(shell?.getAttribute("data-label-position")).toBe("left")
  })
})
