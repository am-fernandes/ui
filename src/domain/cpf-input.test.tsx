import { fireEvent, render, screen } from "@testing-library/react"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { CPFInput } from "./cpf-input"

function ControlledCPFInput({ initial = "" }: { initial?: string }) {
  const [value, setValue] = React.useState(initial)
  return <CPFInput value={value} onValueChange={setValue} />
}

describe("CPFInput", () => {
  it("renders cleaned value with mask applied", () => {
    render(<CPFInput value="12345678909" onValueChange={vi.fn()} />)
    expect(screen.getByDisplayValue("123.456.789-09")).toBeInTheDocument()
  })

  it("renders empty value as empty string", () => {
    render(<CPFInput value="" onValueChange={vi.fn()} />)
    expect(screen.getByRole("textbox")).toHaveValue("")
  })

  it("emits only cleaned digits when user types a fully masked value", () => {
    const onValueChange = vi.fn()
    render(<CPFInput value="" onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "123.456.789-09" } })
    expect(onValueChange).toHaveBeenLastCalledWith("12345678909")
  })

  it("emits cleaned digits when user types raw digits", () => {
    const onValueChange = vi.fn()
    render(<CPFInput value="" onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "12345678909" } })
    expect(onValueChange).toHaveBeenLastCalledWith("12345678909")
  })

  it("strips non-digit characters from pasted input", () => {
    const onValueChange = vi.fn()
    render(<CPFInput value="" onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    // Simulate paste with mixed content
    fireEvent.change(input, { target: { value: "abc123.456def.789-09xx" } })
    expect(onValueChange).toHaveBeenLastCalledWith("12345678909")
  })

  it("reformats a pasted masked string in a controlled wrapper", () => {
    render(<ControlledCPFInput />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "123.456.789-09" } })
    expect(screen.getByDisplayValue("123.456.789-09")).toBeInTheDocument()
  })

  it("caps cleaned digits at 11", () => {
    const onValueChange = vi.fn()
    render(<CPFInput value="" onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "123456789091234" } })
    expect(onValueChange).toHaveBeenLastCalledWith("12345678909")
  })

  it("formats partial input progressively", () => {
    render(<CPFInput value="1234567" onValueChange={vi.fn()} />)
    expect(screen.getByDisplayValue("123.456.7")).toBeInTheDocument()
  })

  it("sets aria-invalid and renders error message when error prop is provided", () => {
    render(<CPFInput value="" onValueChange={vi.fn()} label="CPF" error="CPF inválido" />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("alert")).toHaveTextContent("CPF inválido")
  })

  it("does not set aria-invalid when error is empty string", () => {
    render(<CPFInput value="" onValueChange={vi.fn()} label="CPF" error="" />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input).not.toHaveAttribute("aria-invalid")
  })

  it("wires aria-describedby to both description and error ids", () => {
    render(
      <CPFInput
        value=""
        onValueChange={vi.fn()}
        label="CPF"
        description="Apenas dígitos"
        error="CPF inválido"
      />,
    )
    const input = screen.getByRole("textbox") as HTMLInputElement
    const describedBy = input.getAttribute("aria-describedby")
    expect(describedBy?.split(" ")).toHaveLength(2)
  })

  it("forwards required and aria-required to the input", () => {
    render(<CPFInput value="" onValueChange={vi.fn()} label="CPF" required />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input).toBeRequired()
    expect(input).toHaveAttribute("aria-required", "true")
  })

  it("applies disabled state to the input", () => {
    render(<CPFInput value="12345678909" onValueChange={vi.fn()} disabled />)
    const input = screen.getByDisplayValue("123.456.789-09") as HTMLInputElement
    expect(input).toBeDisabled()
  })

  it("limits the rendered input via maxLength of 14 (masked length)", () => {
    render(<CPFInput value="" onValueChange={vi.fn()} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input).toHaveAttribute("maxLength", "14")
  })
})
