import { fireEvent, render, screen } from "@testing-library/react"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { PercentageInput } from "./percentage-input"

function ControlledPercentageInput({
  initial = 0,
  max,
}: {
  initial?: number
  max?: number
}) {
  const [value, setValue] = React.useState(initial)
  return <PercentageInput value={value} onValueChange={setValue} max={max} />
}

describe("PercentageInput", () => {
  it("renders value formatted with two decimals", () => {
    render(<PercentageInput value={33.33} onValueChange={vi.fn()} />)
    expect(screen.getByDisplayValue("33,33")).toBeInTheDocument()
    expect(screen.getByText("%")).toBeInTheDocument()
  })

  it("renders zero as 0,00", () => {
    render(<PercentageInput value={0} onValueChange={vi.fn()} />)
    expect(screen.getByDisplayValue("0,00")).toBeInTheDocument()
  })

  it("clamps to default max=100 when more than 100 is typed", () => {
    const onValueChange = vi.fn()
    render(<PercentageInput value={0} onValueChange={onValueChange} />)
    const input = screen.getByDisplayValue("0,00") as HTMLInputElement
    // "12000" -> 120.00 -> clamped to 100
    fireEvent.change(input, { target: { value: "12000" } })
    expect(onValueChange).toHaveBeenLastCalledWith(100)
  })

  it("respects a custom max (e.g. 200)", () => {
    const onValueChange = vi.fn()
    render(<PercentageInput value={0} onValueChange={onValueChange} max={200} />)
    const input = screen.getByDisplayValue("0,00") as HTMLInputElement
    fireEvent.change(input, { target: { value: "15050" } })
    expect(onValueChange).toHaveBeenLastCalledWith(150.5)
    fireEvent.change(input, { target: { value: "30000" } })
    expect(onValueChange).toHaveBeenLastCalledWith(200)
  })

  it("strips letters from typed input", () => {
    const onValueChange = vi.fn()
    render(<PercentageInput value={0} onValueChange={onValueChange} />)
    const input = screen.getByDisplayValue("0,00") as HTMLInputElement
    fireEvent.change(input, { target: { value: "a3b3" } })
    expect(onValueChange).toHaveBeenLastCalledWith(0.33)
  })

  it("typing 3350 cycles through display correctly when controlled", () => {
    render(<ControlledPercentageInput />)
    const input = screen.getByDisplayValue("0,00") as HTMLInputElement
    fireEvent.change(input, { target: { value: "3" } })
    expect(screen.getByDisplayValue("0,03")).toBeInTheDocument()
    fireEvent.change(input, { target: { value: "33" } })
    expect(screen.getByDisplayValue("0,33")).toBeInTheDocument()
    fireEvent.change(input, { target: { value: "335" } })
    expect(screen.getByDisplayValue("3,35")).toBeInTheDocument()
    fireEvent.change(input, { target: { value: "3350" } })
    expect(screen.getByDisplayValue("33,50")).toBeInTheDocument()
  })

  it("clamps digit input to 15 chars to avoid integer overflow", () => {
    const onValueChange = vi.fn()
    render(
      <PercentageInput value={0} onValueChange={onValueChange} max={Number.POSITIVE_INFINITY} />,
    )
    const input = screen.getByDisplayValue("0,00") as HTMLInputElement
    fireEvent.change(input, { target: { value: "9".repeat(20) } })
    const next = onValueChange.mock.calls.at(-1)?.[0]
    expect(next).toBeCloseTo(9999999999999.99, 2)
  })

  it("clearing the input emits 0", () => {
    const onValueChange = vi.fn()
    render(<PercentageInput value={50} onValueChange={onValueChange} />)
    const input = screen.getByDisplayValue("50,00") as HTMLInputElement
    fireEvent.change(input, { target: { value: "" } })
    expect(onValueChange).toHaveBeenLastCalledWith(0)
  })

  // -- Additional coverage tests below --------------------------------------

  it("sets aria-invalid and renders the error message when error is provided", () => {
    render(<PercentageInput value={0} onValueChange={vi.fn()} error="Inválido" />)
    const input = screen.getByDisplayValue("0,00") as HTMLInputElement
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("alert")).toHaveTextContent("Inválido")
    expect(input.className).toMatch(/border-destructive/)
  })

  it("does not set aria-invalid when error is empty string", () => {
    render(<PercentageInput value={0} onValueChange={vi.fn()} error="" />)
    const input = screen.getByDisplayValue("0,00") as HTMLInputElement
    expect(input).not.toHaveAttribute("aria-invalid")
  })

  it("renders the description text below the field", () => {
    render(
      <PercentageInput
        value={0}
        onValueChange={vi.fn()}
        description="Informe a porcentagem desejada"
      />,
    )
    expect(screen.getByText("Informe a porcentagem desejada")).toBeInTheDocument()
  })

  it("renders the label and links it to the input", () => {
    render(<PercentageInput value={0} onValueChange={vi.fn()} label="Taxa" />)
    const label = screen.getByText("Taxa")
    expect(label).toBeInTheDocument()
    const input = screen.getByDisplayValue("0,00") as HTMLInputElement
    expect(input.id).toBeTruthy()
  })

  it("supports labelPosition='left' on the field shell", () => {
    const { container } = render(
      <PercentageInput value={0} onValueChange={vi.fn()} label="Taxa" labelPosition="left" />,
    )
    const shell = container.querySelector("[data-slot='field-shell']")
    expect(shell).toHaveAttribute("data-label-position", "left")
  })

  it("supports labelPosition='hidden' (label is sr-only)", () => {
    render(
      <PercentageInput value={0} onValueChange={vi.fn()} label="Taxa" labelPosition="hidden" />,
    )
    const label = screen.getByText("Taxa")
    expect(label.className).toMatch(/sr-only/)
  })

  it("required is forwarded to the field label/required indicator", () => {
    render(<PercentageInput value={0} onValueChange={vi.fn()} label="Taxa" required />)
    // FieldShell uses Label which renders a required marker (asterisk) when required is set
    expect(screen.getByText("Taxa")).toBeInTheDocument()
  })

  it("disabled flag disables the input element", () => {
    render(<PercentageInput value={0} onValueChange={vi.fn()} disabled />)
    const input = screen.getByDisplayValue("0,00") as HTMLInputElement
    expect(input).toBeDisabled()
  })
})
