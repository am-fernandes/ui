import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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

  // Regressão: a cada edição a máscara era reaplicada e o cursor ia para o
  // fim, então corrigir um dígito no meio embaralhava o CPF.
  describe("edição no meio do valor", () => {
    it("Backspace no meio apaga aquele dígito e deixa o cursor onde estava", async () => {
      const user = userEvent.setup()
      render(<ControlledCPFInput initial="52998224725" />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      await user.type(input, "{Backspace}", { initialSelectionStart: 2, initialSelectionEnd: 2 })
      expect(input).toHaveValue("599.822.472-5")
      expect(input.selectionStart).toBe(1)
      expect(input.selectionEnd).toBe(1)
    })

    it("o dígito digitado em seguida entra no mesmo ponto, não no fim", async () => {
      const user = userEvent.setup()
      render(<ControlledCPFInput initial="52998224725" />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      await user.type(input, "{Backspace}2", { initialSelectionStart: 2, initialSelectionEnd: 2 })
      expect(input).toHaveValue("529.982.247-25")
      expect(input.selectionStart).toBe(2)
    })

    it("digitar antes de um separador mantém o cursor depois do dígito novo", async () => {
      const user = userEvent.setup()
      render(<ControlledCPFInput initial="1234567" />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      // "123|.456.7" → digita 9 → "123.9|45.67"
      await user.type(input, "9", { initialSelectionStart: 3, initialSelectionEnd: 3 })
      expect(input).toHaveValue("123.945.67")
      expect(input.selectionStart).toBe(5)
    })

    it("Backspace logo depois de um separador apaga o dígito anterior a ele", async () => {
      const user = userEvent.setup()
      render(<ControlledCPFInput initial="12345678909" />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      // "123.|456.789-09": o caractere antes do cursor é o ponto.
      await user.type(input, "{Backspace}", { initialSelectionStart: 4, initialSelectionEnd: 4 })
      expect(input).toHaveValue("124.567.890-9")
      expect(input.selectionStart).toBe(2)
    })

    it("Delete logo antes de um separador apaga o dígito seguinte a ele", async () => {
      const user = userEvent.setup()
      render(<ControlledCPFInput initial="12345678909" />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      // "123|.456.789-09": o caractere depois do cursor é o ponto.
      await user.type(input, "{Delete}", { initialSelectionStart: 3, initialSelectionEnd: 3 })
      expect(input).toHaveValue("123.567.890-9")
      expect(input.selectionStart).toBe(3)
    })

    it("uma letra digitada no meio não muda o valor nem move o cursor", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<CPFInput value="12345678909" onValueChange={onValueChange} />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      await user.type(input, "x", { initialSelectionStart: 5, initialSelectionEnd: 5 })
      expect(input).toHaveValue("123.456.789-09")
      expect(input.selectionStart).toBe(5)
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it("digitar no fim continua com o cursor no fim", async () => {
      const user = userEvent.setup()
      render(<ControlledCPFInput />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      await user.type(input, "52998224725")
      expect(input).toHaveValue("529.982.247-25")
      expect(input.selectionStart).toBe(14)
    })
  })
})
