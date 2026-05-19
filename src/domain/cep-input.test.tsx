import { fireEvent, render, screen } from "@testing-library/react"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { CEPInput } from "./cep-input"

function ControlledCEPInput({ initial = "" }: { initial?: string }) {
  const [value, setValue] = React.useState(initial)
  return <CEPInput value={value} onValueChange={setValue} />
}

describe("CEPInput", () => {
  it("renders cleaned value with mask applied", () => {
    render(<CEPInput value="01310100" onValueChange={vi.fn()} />)
    expect(screen.getByDisplayValue("01310-100")).toBeInTheDocument()
  })

  it("renders empty value as empty string", () => {
    render(<CEPInput value="" onValueChange={vi.fn()} />)
    expect(screen.getByRole("textbox")).toHaveValue("")
  })

  it("emits only cleaned digits when user types a fully masked value", () => {
    const onValueChange = vi.fn()
    render(<CEPInput value="" onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "01310-100" } })
    expect(onValueChange).toHaveBeenLastCalledWith("01310100")
  })

  it("emits cleaned digits when user types raw digits", () => {
    const onValueChange = vi.fn()
    render(<CEPInput value="" onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "01310100" } })
    expect(onValueChange).toHaveBeenLastCalledWith("01310100")
  })

  it("strips non-digit characters from pasted input", () => {
    const onValueChange = vi.fn()
    render(<CEPInput value="" onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "abc01310-100def" } })
    expect(onValueChange).toHaveBeenLastCalledWith("01310100")
  })

  it("reformats a pasted masked string in a controlled wrapper", () => {
    render(<ControlledCEPInput />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "01310-100" } })
    expect(screen.getByDisplayValue("01310-100")).toBeInTheDocument()
  })

  it("caps cleaned digits at 8", () => {
    const onValueChange = vi.fn()
    render(<CEPInput value="" onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "013101001234" } })
    expect(onValueChange).toHaveBeenLastCalledWith("01310100")
  })

  it("formats partial input progressively (no dash before 6th digit)", () => {
    render(<CEPInput value="0131" onValueChange={vi.fn()} />)
    expect(screen.getByDisplayValue("0131")).toBeInTheDocument()
  })

  it("sets aria-invalid and renders error message when error prop is provided", () => {
    render(<CEPInput value="" onValueChange={vi.fn()} label="CEP" error="CEP inválido" />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("alert")).toHaveTextContent("CEP inválido")
  })

  it("does not set aria-invalid when error is empty string", () => {
    render(<CEPInput value="" onValueChange={vi.fn()} label="CEP" error="" />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input).not.toHaveAttribute("aria-invalid")
  })

  it("wires aria-describedby to both description and error ids", () => {
    render(
      <CEPInput
        value=""
        onValueChange={vi.fn()}
        label="CEP"
        description="Apenas dígitos"
        error="CEP inválido"
      />,
    )
    const input = screen.getByRole("textbox") as HTMLInputElement
    const describedBy = input.getAttribute("aria-describedby")
    expect(describedBy?.split(" ")).toHaveLength(2)
  })

  it("forwards required and aria-required to the input", () => {
    render(<CEPInput value="" onValueChange={vi.fn()} label="CEP" required />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input).toBeRequired()
    expect(input).toHaveAttribute("aria-required", "true")
  })

  it("applies disabled state to the input", () => {
    render(<CEPInput value="01310100" onValueChange={vi.fn()} disabled />)
    const input = screen.getByDisplayValue("01310-100") as HTMLInputElement
    expect(input).toBeDisabled()
  })

  it("limits the rendered input via maxLength of 9 (masked length)", () => {
    render(<CEPInput value="" onValueChange={vi.fn()} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input).toHaveAttribute("maxLength", "9")
  })
})
