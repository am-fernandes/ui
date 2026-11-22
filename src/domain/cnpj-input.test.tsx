import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { CNPJInput } from "./cnpj-input"

function ControlledCNPJInput({ initial = "" }: { initial?: string }) {
  const [value, setValue] = React.useState(initial)
  return <CNPJInput value={value} onValueChange={setValue} />
}

describe("CNPJInput", () => {
  it("renders cleaned value with mask applied", () => {
    render(<CNPJInput value="11222333000181" onValueChange={vi.fn()} />)
    expect(screen.getByDisplayValue("11.222.333/0001-81")).toBeInTheDocument()
  })

  it("renders empty value as empty string", () => {
    render(<CNPJInput value="" onValueChange={vi.fn()} />)
    expect(screen.getByRole("textbox")).toHaveValue("")
  })

  it("emits only cleaned digits when user types a fully masked value", () => {
    const onValueChange = vi.fn()
    render(<CNPJInput value="" onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "11.222.333/0001-81" } })
    expect(onValueChange).toHaveBeenLastCalledWith("11222333000181")
  })

  it("emits cleaned digits when user types raw digits", () => {
    const onValueChange = vi.fn()
    render(<CNPJInput value="" onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "11222333000181" } })
    expect(onValueChange).toHaveBeenLastCalledWith("11222333000181")
  })

  it("strips non-digit characters from pasted input", () => {
    const onValueChange = vi.fn()
    render(<CNPJInput value="" onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "ABC11.222.333/0001-81!" } })
    expect(onValueChange).toHaveBeenLastCalledWith("11222333000181")
  })

  it("reformats a pasted masked string in a controlled wrapper", () => {
    render(<ControlledCNPJInput />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "11.222.333/0001-81" } })
    expect(screen.getByDisplayValue("11.222.333/0001-81")).toBeInTheDocument()
  })

  it("caps cleaned digits at 14", () => {
    const onValueChange = vi.fn()
    render(<CNPJInput value="" onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "112223330001819999" } })
    expect(onValueChange).toHaveBeenLastCalledWith("11222333000181")
  })

  it("formats partial input progressively", () => {
    render(<CNPJInput value="112223330001" onValueChange={vi.fn()} />)
    expect(screen.getByDisplayValue("11.222.333/0001")).toBeInTheDocument()
  })

  it("sets aria-invalid and renders error message when error prop is provided", () => {
    render(<CNPJInput value="" onValueChange={vi.fn()} label="CNPJ" error="CNPJ inválido" />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("alert")).toHaveTextContent("CNPJ inválido")
  })

  it("does not set aria-invalid when error is empty string", () => {
    render(<CNPJInput value="" onValueChange={vi.fn()} label="CNPJ" error="" />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input).not.toHaveAttribute("aria-invalid")
  })

  it("wires aria-describedby to both description and error ids", () => {
    render(
      <CNPJInput
        value=""
        onValueChange={vi.fn()}
        label="CNPJ"
        description="Apenas dígitos"
        error="CNPJ inválido"
      />,
    )
    const input = screen.getByRole("textbox") as HTMLInputElement
    const describedBy = input.getAttribute("aria-describedby")
    expect(describedBy?.split(" ")).toHaveLength(2)
  })

  it("forwards required and aria-required to the input", () => {
    render(<CNPJInput value="" onValueChange={vi.fn()} label="CNPJ" required />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input).toBeRequired()
    expect(input).toHaveAttribute("aria-required", "true")
  })

  it("applies disabled state to the input", () => {
    render(<CNPJInput value="11222333000181" onValueChange={vi.fn()} disabled />)
    const input = screen.getByDisplayValue("11.222.333/0001-81") as HTMLInputElement
    expect(input).toBeDisabled()
  })

  it("limits the rendered input via maxLength of 18 (masked length)", () => {
    render(<CNPJInput value="" onValueChange={vi.fn()} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input).toHaveAttribute("maxLength", "18")
  })

  describe("edição no meio do valor", () => {
    it("Backspace no meio apaga aquele dígito e o próximo entra no mesmo ponto", async () => {
      const user = userEvent.setup()
      render(<ControlledCNPJInput initial="11222333000181" />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      // "11.2|22.333/0001-81"
      await user.type(input, "{Backspace}", { initialSelectionStart: 4, initialSelectionEnd: 4 })
      expect(input).toHaveValue("11.223.330/0018-1")
      // Depois do ponto: o texto à direita do cursor não mudou.
      expect(input.selectionStart).toBe(3)
      await user.keyboard("2")
      expect(input).toHaveValue("11.222.333/0001-81")
      expect(input.selectionStart).toBe(4)
    })

    it("Backspace logo depois da barra apaga o dígito anterior a ela", async () => {
      const user = userEvent.setup()
      render(<ControlledCNPJInput initial="11222333000181" />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      // "11.222.333/|0001-81"
      await user.type(input, "{Backspace}", { initialSelectionStart: 11, initialSelectionEnd: 11 })
      expect(input).toHaveValue("11.222.330/0018-1")
      expect(input.selectionStart).toBe(9)
    })
  })
})
