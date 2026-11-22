import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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

  describe("edição no meio do valor", () => {
    it("Backspace no meio apaga aquele dígito e o próximo entra no mesmo ponto", async () => {
      const user = userEvent.setup()
      render(<ControlledCEPInput initial="01310100" />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      // "01|310-100"
      await user.type(input, "{Backspace}", { initialSelectionStart: 2, initialSelectionEnd: 2 })
      expect(input).toHaveValue("03101-00")
      expect(input.selectionStart).toBe(1)
      await user.keyboard("1")
      expect(input).toHaveValue("01310-100")
      expect(input.selectionStart).toBe(2)
    })

    it("Backspace logo depois do hífen apaga o dígito anterior a ele", async () => {
      const user = userEvent.setup()
      render(<ControlledCEPInput initial="01310100" />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      // "01310-|100"
      await user.type(input, "{Backspace}", { initialSelectionStart: 6, initialSelectionEnd: 6 })
      expect(input).toHaveValue("01311-00")
      expect(input.selectionStart).toBe(4)
    })
  })

  describe("colagem", () => {
    it("aceita o CEP com rótulo na frente", async () => {
      const user = userEvent.setup()
      render(<ControlledCEPInput />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      await user.click(input)
      await user.paste("CEP: 01310-100")
      expect(input).toHaveValue("01310-100")
    })

    it("acha o CEP no fim de um endereço com número", async () => {
      const user = userEvent.setup()
      render(<ControlledCEPInput />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      await user.click(input)
      await user.paste("Av. Paulista, 1578 - Bela Vista, São Paulo - SP, 01310-200")
      expect(input).toHaveValue("01310-200")
    })

    it("não tem maxLength e ignora o 9º dígito digitado", async () => {
      const user = userEvent.setup()
      render(<ControlledCEPInput />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      expect(input).not.toHaveAttribute("maxLength")
      await user.type(input, "013101009")
      expect(input).toHaveValue("01310-100")
    })
  })
})
