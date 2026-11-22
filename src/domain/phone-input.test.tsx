import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { PhoneInput } from "./phone-input"

function ControlledPhoneInput({ initial = "" }: { initial?: string }) {
  const [value, setValue] = React.useState(initial)
  return <PhoneInput value={value} onValueChange={setValue} />
}

describe("PhoneInput", () => {
  it("renders an 11-digit value as a mobile mask", () => {
    render(<PhoneInput value="11987654321" onValueChange={vi.fn()} />)
    expect(screen.getByDisplayValue("(11) 98765-4321")).toBeInTheDocument()
  })

  it("renders a 10-digit value as a landline mask", () => {
    render(<PhoneInput value="1133334444" onValueChange={vi.fn()} />)
    expect(screen.getByDisplayValue("(11) 3333-4444")).toBeInTheDocument()
  })

  it("renders empty value as empty string", () => {
    render(<PhoneInput value="" onValueChange={vi.fn()} />)
    expect(screen.getByRole("textbox")).toHaveValue("")
  })

  it("emits only cleaned digits when user types a fully masked mobile value", () => {
    const onValueChange = vi.fn()
    render(<PhoneInput value="" onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "(11) 98765-4321" } })
    expect(onValueChange).toHaveBeenLastCalledWith("11987654321")
  })

  it("emits cleaned digits when user types raw digits", () => {
    const onValueChange = vi.fn()
    render(<PhoneInput value="" onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "11987654321" } })
    expect(onValueChange).toHaveBeenLastCalledWith("11987654321")
  })

  it("strips non-digit characters and the country code from a value set at once", () => {
    const onValueChange = vi.fn()
    render(<PhoneInput value="" onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    // What an autofill does: the whole text arrives in one change.
    fireEvent.change(input, { target: { value: "+55 (11) 98765-4321" } })
    expect(onValueChange).toHaveBeenLastCalledWith("11987654321")
  })

  it("reformats a pasted masked landline string in a controlled wrapper", () => {
    render(<ControlledPhoneInput />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "(11) 3333-4444" } })
    expect(screen.getByDisplayValue("(11) 3333-4444")).toBeInTheDocument()
  })

  it("reformats a pasted masked mobile string in a controlled wrapper", () => {
    render(<ControlledPhoneInput />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "(11) 98765-4321" } })
    expect(screen.getByDisplayValue("(11) 98765-4321")).toBeInTheDocument()
  })

  it("caps cleaned digits at 11", () => {
    const onValueChange = vi.fn()
    render(<PhoneInput value="" onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "1198765432199" } })
    expect(onValueChange).toHaveBeenLastCalledWith("11987654321")
  })

  it("formats partial input progressively", () => {
    render(<PhoneInput value="119" onValueChange={vi.fn()} />)
    expect(screen.getByDisplayValue("(11) 9")).toBeInTheDocument()
  })

  it("sets aria-invalid and renders error message when error prop is provided", () => {
    render(
      <PhoneInput value="" onValueChange={vi.fn()} label="Telefone" error="Telefone inválido" />,
    )
    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("alert")).toHaveTextContent("Telefone inválido")
  })

  it("does not set aria-invalid when error is empty string", () => {
    render(<PhoneInput value="" onValueChange={vi.fn()} label="Telefone" error="" />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input).not.toHaveAttribute("aria-invalid")
  })

  it("wires aria-describedby to both description and error ids", () => {
    render(
      <PhoneInput
        value=""
        onValueChange={vi.fn()}
        label="Telefone"
        description="Inclua DDD"
        error="Telefone inválido"
      />,
    )
    const input = screen.getByRole("textbox") as HTMLInputElement
    const describedBy = input.getAttribute("aria-describedby")
    expect(describedBy?.split(" ")).toHaveLength(2)
  })

  it("forwards required and aria-required to the input", () => {
    render(<PhoneInput value="" onValueChange={vi.fn()} label="Telefone" required />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input).toBeRequired()
    expect(input).toHaveAttribute("aria-required", "true")
  })

  it("applies disabled state to the input", () => {
    render(<PhoneInput value="11987654321" onValueChange={vi.fn()} disabled />)
    const input = screen.getByDisplayValue("(11) 98765-4321") as HTMLInputElement
    expect(input).toBeDisabled()
  })

  it("uses inputMode tel", () => {
    render(<PhoneInput value="" onValueChange={vi.fn()} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input).toHaveAttribute("inputMode", "tel")
  })

  describe("edição no meio do valor", () => {
    it("Backspace no meio apaga aquele dígito e o próximo entra no mesmo ponto", async () => {
      const user = userEvent.setup()
      render(<ControlledPhoneInput initial="11987654321" />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      // "(11) 98|765-4321"
      await user.type(input, "{Backspace}", { initialSelectionStart: 7, initialSelectionEnd: 7 })
      expect(input).toHaveValue("(11) 9765-4321")
      expect(input.selectionStart).toBe(6)
      await user.keyboard("8")
      expect(input).toHaveValue("(11) 98765-4321")
      expect(input.selectionStart).toBe(7)
    })

    it("Backspace depois do espaço do DDD apaga o segundo dígito do DDD", async () => {
      const user = userEvent.setup()
      render(<ControlledPhoneInput initial="11987654321" />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      // "(11) |98765-4321": antes do cursor estão ")" e " ".
      await user.type(input, "{Backspace}", { initialSelectionStart: 5, initialSelectionEnd: 5 })
      expect(input).toHaveValue("(19) 8765-4321")
      expect(input.selectionStart).toBe(2)
    })

    it("digitar o primeiro dígito deixa o cursor depois dele, não antes do parêntese", async () => {
      const user = userEvent.setup()
      render(<ControlledPhoneInput />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      await user.type(input, "119")
      expect(input).toHaveValue("(11) 9")
      expect(input.selectionStart).toBe(6)
    })
  })

  // Regressão: "+55 11 98765-4321" virava "(55) 11987-6543" e passava em
  // isValidPhone; "011 98765-4321" virava "(01) 19876-5432".
  describe("código do país e zero de operadora", () => {
    async function pasteInto(text: string) {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      function Harness() {
        const [value, setValue] = React.useState("")
        return (
          <PhoneInput
            value={value}
            onValueChange={(next) => {
              onValueChange(next)
              setValue(next)
            }}
          />
        )
      }
      render(<Harness />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      await user.click(input)
      await user.paste(text)
      return { input, onValueChange }
    }

    it("tira o +55 de um celular colado", async () => {
      const { input, onValueChange } = await pasteInto("+55 11 98765-4321")
      expect(input).toHaveValue("(11) 98765-4321")
      expect(onValueChange).toHaveBeenLastCalledWith("11987654321")
    })

    it("tira o +55 de um fixo colado", async () => {
      const { input, onValueChange } = await pasteInto("+55 (11) 3333-4444")
      expect(input).toHaveValue("(11) 3333-4444")
      expect(onValueChange).toHaveBeenLastCalledWith("1133334444")
    })

    it("tira o zero de operadora", async () => {
      const { input, onValueChange } = await pasteInto("011 98765-4321")
      expect(input).toHaveValue("(11) 98765-4321")
      expect(onValueChange).toHaveBeenLastCalledWith("11987654321")
    })

    it("tira o +55 e o zero juntos", async () => {
      const { input } = await pasteInto("+55 (011) 98765-4321")
      expect(input).toHaveValue("(11) 98765-4321")
    })

    it("não mexe num celular do DDD 55", async () => {
      const { input, onValueChange } = await pasteInto("(55) 99876-5432")
      expect(input).toHaveValue("(55) 99876-5432")
      expect(onValueChange).toHaveBeenLastCalledWith("55998765432")
    })

    it("não mexe num fixo do DDD 55", async () => {
      const { input } = await pasteInto("55 3222-1100")
      expect(input).toHaveValue("(55) 3222-1100")
    })

    it("aceita o número com rótulo na frente", async () => {
      const { input } = await pasteInto("Tel.: (11) 98765-4321")
      expect(input).toHaveValue("(11) 98765-4321")
    })

    it("quem digita o 55 na frente também chega no número certo", async () => {
      const user = userEvent.setup()
      render(<ControlledPhoneInput />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      await user.type(input, "5511987654321")
      expect(input).toHaveValue("(11) 98765-4321")
      expect(input.selectionStart).toBe(15)
    })

    it("quem digita o zero na frente também chega no número certo", async () => {
      const user = userEvent.setup()
      render(<ControlledPhoneInput />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      await user.type(input, "011987654321")
      expect(input).toHaveValue("(11) 98765-4321")
    })

    it("mostra sem o código do país um valor que já chega com ele", () => {
      render(<PhoneInput value="+5511987654321" onValueChange={vi.fn()} />)
      expect(screen.getByRole("textbox")).toHaveValue("(11) 98765-4321")
    })

    it("não tem maxLength e ignora o 12º dígito digitado", async () => {
      const user = userEvent.setup()
      render(<ControlledPhoneInput />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      expect(input).not.toHaveAttribute("maxLength")
      await user.type(input, "119876543219")
      expect(input).toHaveValue("(11) 98765-4321")
    })
  })
})
