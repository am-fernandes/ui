import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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

  // Regressão: a colagem passava pelo mesmo caminho da digitação ("centavos
  // primeiro"), então "350.000" da planilha virava R$ 3.500,00 na proposta.
  describe("colagem", () => {
    async function pasteInto(text: string, initial = 0) {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      function Harness() {
        const [value, setValue] = React.useState(initial)
        return (
          <CurrencyInput
            label="Valor"
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

    it.each([
      ["1500", 1500, "1.500,00"],
      ["1.500", 1500, "1.500,00"],
      ["350.000", 350000, "350.000,00"],
      ["350000", 350000, "350.000,00"],
      ["1500,5", 1500.5, "1.500,50"],
      ["1.234,5", 1234.5, "1.234,50"],
      ["2350.9", 2350.9, "2.350,90"],
      ["1.500,00", 1500, "1.500,00"],
      ["1500.00", 1500, "1.500,00"],
      ["R$ 2.350,90", 2350.9, "2.350,90"],
      ["0,05", 0.05, "0,05"],
    ])("%s vira %d reais", async (text, value, shown) => {
      const { input, onValueChange } = await pasteInto(text)
      expect(onValueChange).toHaveBeenLastCalledWith(value)
      expect(input).toHaveValue(shown)
    })

    it("o valor colado substitui o que estava no campo", async () => {
      const { input, onValueChange } = await pasteInto("1.500,00", 99.9)
      expect(onValueChange).toHaveBeenLastCalledWith(1500)
      expect(input).toHaveValue("1.500,00")
    })

    it("arredonda para centavos o que vem com mais casas", async () => {
      const { onValueChange } = await pasteInto("10,999")
      expect(onValueChange).toHaveBeenLastCalledWith(11)
    })

    it("texto sem número não muda o campo", async () => {
      const { input, onValueChange } = await pasteInto("a combinar", 250)
      expect(onValueChange).not.toHaveBeenCalled()
      expect(input).toHaveValue("250,00")
    })

    it("um número grande demais para o campo não entra", async () => {
      const { input, onValueChange } = await pasteInto("99999999999999999999", 250)
      expect(onValueChange).not.toHaveBeenCalled()
      expect(input).toHaveValue("250,00")
    })

    it("o onPaste de quem usa o campo é chamado e pode cancelar a colagem", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      const onPaste = vi.fn((e: React.ClipboardEvent<HTMLInputElement>) => e.preventDefault())
      render(<CurrencyInput value={0} onValueChange={onValueChange} onPaste={onPaste} />)
      await user.click(screen.getByRole("textbox"))
      await user.paste("1500")
      expect(onPaste).toHaveBeenCalledTimes(1)
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it("a digitação continua sendo de centavos primeiro", async () => {
      const user = userEvent.setup()
      render(<ControlledCurrencyInput />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      await user.click(input)
      await user.keyboard("{End}1500")
      expect(input).toHaveValue("15,00")
    })
  })

  // Regressão: com `name`, o form nativo recebia o texto com máscara
  // ("1.234,56") enquanto onValueChange entregava o valor limpo.
  describe("em um formulário nativo", () => {
    it("envia o valor limpo, não a máscara", () => {
      const { container } = render(
        <form>
          <CurrencyInput name="valor" value={1234.56} onValueChange={vi.fn()} />
        </form>,
      )
      const form = container.querySelector("form") as HTMLFormElement
      const data = new FormData(form)
      expect(data.get("valor")).toBe("1234.56")
      expect([...data.keys()]).toEqual(["valor"])
      // O campo visível mostra a máscara e não leva o name.
      expect(screen.getByRole("textbox")).toHaveValue("1.234,56")
      expect(screen.getByRole("textbox")).not.toHaveAttribute("name")
    })

    it("acompanha o que é digitado", async () => {
      const user = userEvent.setup()
      function Harness() {
        const [value, setValue] = React.useState<number>(0)
        return (
          <form>
            <CurrencyInput name="valor" value={value} onValueChange={setValue} />
          </form>
        )
      }
      const { container } = render(<Harness />)
      await user.click(screen.getByRole("textbox"))
      await user.keyboard("{End}123456")
      const form = container.querySelector("form") as HTMLFormElement
      expect(new FormData(form).get("valor")).toBe("1234.56")
    })

    it("desabilitado, não é enviado", () => {
      const { container } = render(
        <form>
          <CurrencyInput name="valor" value={1234.56} onValueChange={vi.fn()} disabled />
        </form>,
      )
      const form = container.querySelector("form") as HTMLFormElement
      expect(new FormData(form).has("valor")).toBe(false)
    })

    it("sem name não cria input oculto", () => {
      const { container } = render(<CurrencyInput value={1234.56} onValueChange={vi.fn()} />)
      expect(container.querySelector("input[type=hidden]")).toBeNull()
    })

    it("o input oculto acompanha o atributo form", () => {
      const { container } = render(
        <CurrencyInput name="valor" form="cadastro" value={1234.56} onValueChange={vi.fn()} />,
      )
      expect(container.querySelector("input[type=hidden]")).toHaveAttribute("form", "cadastro")
    })
  })
})
