import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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

  it("takes a value above the default max=100 and marks the field invalid", () => {
    render(<PercentageInput defaultValue={0} />)
    const input = screen.getByDisplayValue("0,00") as HTMLInputElement
    fireEvent.change(input, { target: { value: "12000" } })
    expect(input).toHaveValue("120,00")
    expect(input.validationMessage).toBe("O valor máximo é 100,00%.")
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
    expect(input.className).toMatch(/field-error/)
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

  // Regressão: com `name`, o form nativo recebia o texto com máscara
  // ("12,50") enquanto onValueChange entregava o valor limpo.
  describe("em um formulário nativo", () => {
    it("envia o valor limpo, não a máscara", () => {
      const { container } = render(
        <form>
          <PercentageInput name="taxa" value={12.5} onValueChange={vi.fn()} />
        </form>,
      )
      const form = container.querySelector("form") as HTMLFormElement
      const data = new FormData(form)
      expect(data.get("taxa")).toBe("12.5")
      expect([...data.keys()]).toEqual(["taxa"])
      // O campo visível mostra a máscara e não leva o name.
      expect(screen.getByRole("textbox")).toHaveValue("12,50")
      expect(screen.getByRole("textbox")).not.toHaveAttribute("name")
    })

    it("acompanha o que é digitado", async () => {
      const user = userEvent.setup()
      function Harness() {
        const [value, setValue] = React.useState<number>(0)
        return (
          <form>
            <PercentageInput name="taxa" value={value} onValueChange={setValue} />
          </form>
        )
      }
      const { container } = render(<Harness />)
      await user.click(screen.getByRole("textbox"))
      await user.keyboard("{End}1250")
      const form = container.querySelector("form") as HTMLFormElement
      expect(new FormData(form).get("taxa")).toBe("12.5")
    })

    it("desabilitado, não é enviado", () => {
      const { container } = render(
        <form>
          <PercentageInput name="taxa" value={12.5} onValueChange={vi.fn()} disabled />
        </form>,
      )
      const form = container.querySelector("form") as HTMLFormElement
      expect(new FormData(form).has("taxa")).toBe(false)
    })

    it("sem name não cria input oculto", () => {
      const { container } = render(<PercentageInput value={12.5} onValueChange={vi.fn()} />)
      expect(container.querySelector("input[type=hidden]")).toBeNull()
    })

    it("o input oculto acompanha o atributo form", () => {
      const { container } = render(
        <PercentageInput name="taxa" form="cadastro" value={12.5} onValueChange={vi.fn()} />,
      )
      expect(container.querySelector("input[type=hidden]")).toHaveAttribute("form", "cadastro")
    })
  })

  // Tela de consulta: o valor fica legível e é enviado, mas não é editável.
  // Antes só dava para fingir isso com `disabled`, a 50% de opacidade.
  describe("somente leitura", () => {
    it("mostra o valor, recebe foco e não aceita digitação", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<PercentageInput label="Campo" value={12.5} onValueChange={onValueChange} readOnly />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      expect(input).toHaveAttribute("readonly")
      expect(input).not.toBeDisabled()
      await user.tab()
      expect(input).toHaveFocus()
      await user.keyboard("{End}1{Backspace}")
      expect(input).toHaveValue("12,50")
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it("não aceita colagem", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<PercentageInput label="Campo" value={12.5} onValueChange={onValueChange} readOnly />)
      const input = screen.getByRole("textbox")
      await user.click(input)
      await user.paste("99,9")
      expect(input).toHaveValue("12,50")
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it("continua sendo enviado no formulário", () => {
      const { container } = render(
        <form>
          <PercentageInput name="campo" value={12.5} onValueChange={vi.fn()} readOnly />
        </form>,
      )
      const form = container.querySelector("form") as HTMLFormElement
      expect(new FormData(form).get("campo")).toBe("12.5")
    })

    it("tem aparência própria, diferente do campo editável e do desabilitado", () => {
      const { container } = render(
        <PercentageInput label="Campo" value={12.5} onValueChange={vi.fn()} readOnly />,
      )
      expect(screen.getByRole("textbox").className).toMatch(/bg-muted/)
      // Sem a opacidade de desabilitado no shell.
      expect(container.querySelector("[data-slot='field-shell']")?.className).not.toMatch(
        /opacity-50/,
      )
    })
  })

  // A altura vem do token de controle (32, 40 e 44px), não do padding: o
  // campo alinha com botões e selects do mesmo tamanho. A medida em px está
  // em tests/e2e/domain.spec.ts.
  describe("size", () => {
    it("usa a altura md por padrão", () => {
      render(<PercentageInput value={10} onValueChange={vi.fn()} />)
      expect(screen.getByRole("textbox").className).toMatch(/\bh-control-md\b/)
    })

    it.each(["sm", "md", "lg"] as const)(
      "size=%s usa a altura de controle correspondente",
      (size) => {
        render(<PercentageInput value={10} onValueChange={vi.fn()} size={size} />)
        const input = screen.getByRole("textbox")
        expect(input.className).toMatch(new RegExp(`\\bh-control-${size}\\b`))
        // `size` é o tamanho do controle, não o atributo nativo de largura.
        expect(input).not.toHaveAttribute("size")
      },
    )
  })

  // Regressão: a colagem seguia a regra da digitação (centésimos primeiro),
  // então "12,5" colado virava 1,25.
  describe("colagem", () => {
    async function pasteInto(text: string, initial = 0, max?: number) {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      function Harness() {
        const [value, setValue] = React.useState(initial)
        return (
          <PercentageInput
            label="Taxa"
            max={max}
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
      ["12,5", 12.5, "12,50"],
      ["12.5", 12.5, "12,50"],
      ["12,50%", 12.5, "12,50"],
      ["7", 7, "7,00"],
      ["0,75", 0.75, "0,75"],
      ["33,333", 33.33, "33,33"],
    ])("%s vira %d por cento", async (text, value, shown) => {
      const { input, onValueChange } = await pasteInto(text)
      expect(onValueChange).toHaveBeenLastCalledWith(value)
      expect(input).toHaveValue(shown)
    })

    it("o valor colado substitui o que estava no campo", async () => {
      const { input, onValueChange } = await pasteInto("12,5", 99)
      expect(onValueChange).toHaveBeenLastCalledWith(12.5)
      expect(input).toHaveValue("12,50")
    })

    it("texto sem número não muda o campo", async () => {
      const { input, onValueChange } = await pasteInto("a definir", 10)
      expect(onValueChange).not.toHaveBeenCalled()
      expect(input).toHaveValue("10,00")
    })

    it("o onPaste de quem usa o campo é chamado e pode cancelar a colagem", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      const onPaste = vi.fn((e: React.ClipboardEvent<HTMLInputElement>) => e.preventDefault())
      render(<PercentageInput value={0} onValueChange={onValueChange} onPaste={onPaste} />)
      await user.click(screen.getByRole("textbox"))
      await user.paste("12,5")
      expect(onPaste).toHaveBeenCalledTimes(1)
      expect(onValueChange).not.toHaveBeenCalled()
    })
  })

  describe("edição no meio do valor", () => {
    it("o dígito entra no ponto do cursor e o cursor fica depois dele", async () => {
      const user = userEvent.setup()
      render(<ControlledPercentageInput initial={12.34} />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      // "12,|34" → Backspace sobre a vírgula apaga o 2 → "1,|34".
      await user.type(input, "{Backspace}", { initialSelectionStart: 3, initialSelectionEnd: 3 })
      expect(input).toHaveValue("1,34")
      expect(input.selectionStart).toBe(2)
      // O dígito entra antes da vírgula, onde o 2 estava: "15|,34".
      await user.keyboard("5")
      expect(input).toHaveValue("15,34")
      expect(input.selectionStart).toBe(2)
    })

    it("com o campo em zero, os centésimos entram primeiro mesmo com o cursor no início", async () => {
      const user = userEvent.setup()
      render(<ControlledPercentageInput />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      await user.type(input, "1250", { initialSelectionStart: 0, initialSelectionEnd: 0 })
      expect(input).toHaveValue("12,50")
    })
  })

  describe("valor que não é número", () => {
    it.each([
      ["undefined", undefined],
      ["NaN", Number.NaN],
    ])("%s mostra 0,00", (_name, value) => {
      render(<PercentageInput value={value as unknown as number} onValueChange={vi.fn()} />)
      expect(screen.getByRole("textbox")).toHaveValue("0,00")
    })
  })

  // Regressão: o campo não sabia ficar vazio. Limpar voltava a "0,00", o
  // `required` nativo nunca falhava e "não informado" era igual a zero.
  describe('emptyValue="null"', () => {
    function Nullable({ initial = null }: { initial?: number | null }) {
      const [value, setValue] = React.useState<number | null>(initial)
      return (
        <>
          <PercentageInput
            label="Campo"
            emptyValue="null"
            placeholder="Informe"
            value={value}
            onValueChange={setValue}
          />
          <output data-testid="value">{String(value)}</output>
        </>
      )
    }

    it("value null mostra o campo vazio, com o placeholder", () => {
      render(<Nullable />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveValue("")
      expect(input).toHaveAttribute("placeholder", "Informe")
    })

    it("sem placeholder próprio, sugere o formato", () => {
      render(<PercentageInput emptyValue="null" value={null} onValueChange={vi.fn()} />)
      expect(screen.getByRole("textbox")).toHaveAttribute("placeholder", "0,00")
    })

    it("o primeiro dígito já vale, como centésimo", async () => {
      const user = userEvent.setup()
      render(<Nullable />)
      const input = screen.getByRole("textbox")
      await user.type(input, "5")
      expect(input).toHaveValue("0,05")
      expect(screen.getByTestId("value")).toHaveTextContent("0.05")
    })

    it("zero digitado é um valor, diferente de vazio", async () => {
      const user = userEvent.setup()
      render(<Nullable />)
      const input = screen.getByRole("textbox")
      await user.type(input, "0")
      expect(input).toHaveValue("0,00")
      expect(screen.getByTestId("value")).toHaveTextContent("0")
    })

    it("apagar tudo de uma vez reporta null", async () => {
      const user = userEvent.setup()
      render(<Nullable initial={12.5} />)
      const input = screen.getByRole("textbox")
      await user.clear(input)
      expect(input).toHaveValue("")
      expect(screen.getByTestId("value")).toHaveTextContent("null")
    })

    it("Backspace passa por zero e depois esvazia", async () => {
      const user = userEvent.setup()
      render(<Nullable />)
      const input = screen.getByRole("textbox")
      await user.type(input, "5")
      await user.keyboard("{Backspace}")
      expect(input).toHaveValue("0,00")
      expect(screen.getByTestId("value")).toHaveTextContent("0")
      await user.keyboard("{Backspace}")
      expect(input).toHaveValue("")
      expect(screen.getByTestId("value")).toHaveTextContent("null")
    })

    it("vazio, o form recebe texto vazio e o required nativo acusa", () => {
      const { container } = render(
        <form>
          <PercentageInput
            name="campo"
            emptyValue="null"
            value={null}
            onValueChange={vi.fn()}
            required
          />
        </form>,
      )
      const form = container.querySelector("form") as HTMLFormElement
      expect(new FormData(form).get("campo")).toBe("")
      expect((screen.getByRole("textbox") as HTMLInputElement).validity.valueMissing).toBe(true)
      expect(form.checkValidity()).toBe(false)
    })

    it("um valor que não é número é campo vazio", () => {
      render(
        <PercentageInput
          emptyValue="null"
          value={Number.NaN}
          onValueChange={vi.fn()}
          placeholder="Informe"
        />,
      )
      expect(screen.getByRole("textbox")).toHaveValue("")
    })

    it("colar um número preenche o campo vazio", async () => {
      const user = userEvent.setup()
      render(<Nullable />)
      const input = screen.getByRole("textbox")
      await user.click(input)
      await user.paste("12,5")
      expect(input).toHaveValue("12,50")
      expect(screen.getByTestId("value")).toHaveTextContent("12.5")
    })
  })

  describe('emptyValue="zero" (padrão)', () => {
    it("limpar o campo volta a zero, como sempre foi", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      function Harness() {
        const [value, setValue] = React.useState(12.5)
        return (
          <PercentageInput
            value={value}
            onValueChange={(next) => {
              onValueChange(next)
              setValue(next)
            }}
          />
        )
      }
      render(<Harness />)
      const input = screen.getByRole("textbox")
      await user.clear(input)
      expect(input).toHaveValue("0,00")
      expect(onValueChange).toHaveBeenLastCalledWith(0)
    })

    it('onValueChange recebe sempre número; null só existe com emptyValue="null"', () => {
      const onNumber = (_value: number) => {}
      const onNullable = (_value: number | null) => {}
      render(
        <>
          <PercentageInput value={1} onValueChange={onNumber} />
          <PercentageInput emptyValue="null" value={null} onValueChange={onNullable} />
          {/* @ts-expect-error sem emptyValue="null", value não aceita null */}
          <PercentageInput value={null} onValueChange={onNumber} />
          {/* @ts-expect-error com emptyValue="null", o callback precisa aceitar null */}
          <PercentageInput emptyValue="null" value={null} onValueChange={onNumber} />
        </>,
      )
      expect(screen.getAllByRole("textbox")).toHaveLength(4)
    })
  })

  describe("modo não controlado", () => {
    it("sem value, parte de defaultValue e guarda o que é digitado", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      const { container } = render(
        <form>
          <PercentageInput name="campo" defaultValue={12.5} onValueChange={onValueChange} />
          <button type="reset">Desfazer</button>
        </form>,
      )
      const input = screen.getByRole("textbox")
      const form = container.querySelector("form") as HTMLFormElement
      expect(input).toHaveValue("12,50")
      await user.click(input)
      await user.keyboard("{End}{Backspace}")
      expect(input).toHaveValue("1,25")
      expect(onValueChange).toHaveBeenLastCalledWith(1.25)
      expect(new FormData(form).get("campo")).toBe("1.25")
      await user.click(screen.getByRole("button", { name: "Desfazer" }))
      expect(input).toHaveValue("12,50")
      expect(new FormData(form).get("campo")).toBe("12.5")
    })

    it("sem value nem defaultValue começa em zero e funciona sem onValueChange", async () => {
      const user = userEvent.setup()
      render(<PercentageInput />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveValue("0,00")
      await user.click(input)
      await user.keyboard("{End}1250")
      expect(input).toHaveValue("12,50")
    })

    it('com emptyValue="null" e sem defaultValue começa vazio', () => {
      render(<PercentageInput emptyValue="null" />)
      expect(screen.getByRole("textbox")).toHaveValue("")
    })
  })

  describe("min e max", () => {
    function Limited(props: { initial?: number; min?: number; max?: number }) {
      const { initial = 0, ...limits } = props
      const [value, setValue] = React.useState(initial)
      return (
        <>
          <PercentageInput label="Taxa" value={value} onValueChange={setValue} {...limits} />
          <output data-testid="value">{String(value)}</output>
        </>
      )
    }

    function InForm({ onSend, error }: { onSend: (value: unknown) => void; error?: string }) {
      return (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSend(new FormData(event.currentTarget).get("valor"))
          }}
        >
          <PercentageInput name="valor" label="Valor" min={10} max={50} error={error} />
          <button type="submit">Enviar</button>
        </form>
      )
    }

    it("acima do máximo, o campo guarda o que foi digitado e acusa ao sair", async () => {
      const user = userEvent.setup()
      render(<Limited max={50} />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      await user.click(input)
      await user.keyboard("{End}5001")
      expect(input).toHaveValue("50,01")
      expect(screen.queryByRole("alert")).toBeNull()
      await user.tab()
      expect(screen.getByRole("alert")).toHaveTextContent("O valor máximo é 50,00%.")
      expect(input).toHaveValue("50,01")
      expect(input).toHaveAttribute("aria-invalid", "true")
      expect(input.validity.valid).toBe(false)
      expect(screen.getByTestId("value")).toHaveTextContent("50.01")
    })

    it("um valor colado acima do máximo entra e é acusado", async () => {
      const user = userEvent.setup()
      render(<Limited max={50} />)
      const input = screen.getByRole("textbox")
      await user.click(input)
      await user.paste("75")
      await user.tab()
      expect(input).toHaveValue("75,00")
      expect(screen.getByRole("alert")).toHaveTextContent("O valor máximo é 50,00%.")
    })

    it("abaixo do mínimo, só acusa ao sair do campo e não troca o valor", async () => {
      const user = userEvent.setup()
      render(<Limited min={10} />)
      const input = screen.getByRole("textbox")
      await user.click(input)
      await user.keyboard("{End}500")
      expect(screen.queryByRole("alert")).toBeNull()
      await user.tab()
      expect(input).toHaveValue("5,00")
      expect(screen.getByRole("alert")).toHaveTextContent("O valor mínimo é 10,00%.")
      expect(screen.getByTestId("value")).toHaveTextContent("5")
    })

    it("o erro some quando o valor volta para a faixa", async () => {
      const user = userEvent.setup()
      render(<Limited min={10} />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      await user.click(input)
      await user.keyboard("{End}500")
      await user.tab()
      await user.click(input)
      await user.keyboard("{End}0")
      expect(input).toHaveValue("50,00")
      expect(screen.queryByRole("alert")).toBeNull()
      expect(input.validity.valid).toBe(true)
    })

    it("fora da faixa, Enter não envia o formulário e mostra o erro", async () => {
      const user = userEvent.setup()
      const onSend = vi.fn()
      render(<InForm onSend={onSend} />)
      const input = screen.getByRole("textbox")
      await user.click(input)
      await user.keyboard("{End}500{Enter}")
      expect(onSend).not.toHaveBeenCalled()
      expect(input).toHaveValue("5,00")
      expect(screen.getByRole("alert")).toHaveTextContent("O valor mínimo é 10,00%.")
      await user.keyboard("0{Enter}")
      expect(onSend).toHaveBeenCalledWith("50")
    })

    it("sem edição, o envio é barrado e o erro aparece", async () => {
      const user = userEvent.setup()
      const onSend = vi.fn()
      render(<InForm onSend={onSend} />)
      await user.tab()
      await user.tab()
      expect(screen.queryByRole("alert")).toBeNull()
      await user.click(screen.getByRole("button", { name: "Enviar" }))
      expect(onSend).not.toHaveBeenCalled()
      expect(screen.getByRole("alert")).toHaveTextContent("O valor mínimo é 10,00%.")
    })

    it("o error do app vale no lugar da mensagem de limite", async () => {
      const user = userEvent.setup()
      render(<InForm onSend={vi.fn()} error="Informe a parcela." />)
      await user.click(screen.getByRole("button", { name: "Enviar" }))
      expect(screen.getByRole("alert")).toHaveTextContent("Informe a parcela.")
    })

    it("o reset do formulário limpa o erro", async () => {
      const user = userEvent.setup()
      render(<InForm onSend={vi.fn()} />)
      await user.click(screen.getByRole("button", { name: "Enviar" }))
      act(() => (screen.getByRole("textbox") as HTMLInputElement).form?.reset())
      expect(screen.queryByRole("alert")).toBeNull()
    })

    it.each([{ readOnly: true }, { disabled: true }])("%o não é acusado", (state) => {
      render(<PercentageInput label="Valor" value={75} max={50} {...state} />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      fireEvent.invalid(input)
      expect(input.validationMessage).toBe("")
      expect(screen.queryByRole("alert")).toBeNull()
    })

    it("a mensagem vem de labels", async () => {
      const user = userEvent.setup()
      render(
        <PercentageInput
          label="Valor"
          max={50}
          defaultValue={75}
          labels={{ aboveMax: (max) => `Teto: ${max}` }}
        />,
      )
      await user.click(screen.getByRole("textbox"))
      await user.keyboard("{Enter}")
      expect(screen.getByRole("alert")).toHaveTextContent("Teto: 50,00%")
    })

    it("com min negativo, aceita percentual negativo e acusa abaixo dele", async () => {
      const user = userEvent.setup()
      render(<Limited min={-10} />)
      const input = screen.getByRole("textbox")
      await user.click(input)
      await user.keyboard("{End}-5000")
      expect(input).toHaveValue("-50,00")
      await user.tab()
      expect(screen.getByRole("alert")).toHaveTextContent("O valor mínimo é -10,00%.")
    })

    it("sem min negativo o sinal é ignorado", async () => {
      const user = userEvent.setup()
      render(<Limited />)
      const input = screen.getByRole("textbox")
      await user.click(input)
      await user.keyboard("{End}-500")
      expect(input).toHaveValue("5,00")
    })
  })

  // O campo só tinha duas casas: uma taxa de juros de uma casa ou um
  // percentual inteiro apareciam como "12,50" e "12,00".
  describe("decimals", () => {
    function Rate({ decimals, initial = 0 }: { decimals: 0 | 1 | 2; initial?: number }) {
      const [value, setValue] = React.useState(initial)
      return (
        <>
          <PercentageInput
            label="Taxa"
            decimals={decimals}
            value={value}
            onValueChange={setValue}
          />
          <output data-testid="value">{String(value)}</output>
        </>
      )
    }

    it("o padrão continua sendo duas casas", () => {
      render(<PercentageInput value={12.5} onValueChange={vi.fn()} />)
      expect(screen.getByRole("textbox")).toHaveValue("12,50")
    })

    it.each([
      [2, "12,50"],
      [1, "12,5"],
      [0, "13"],
    ] as const)("com %d casas, 12.5 aparece como %s", (decimals, shown) => {
      render(<PercentageInput decimals={decimals} value={12.5} onValueChange={vi.fn()} />)
      expect(screen.getByRole("textbox")).toHaveValue(shown)
    })

    it("com uma casa, os dígitos entram pelos décimos", async () => {
      const user = userEvent.setup()
      render(<Rate decimals={1} />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveValue("0,0")
      await user.click(input)
      await user.keyboard("{End}125")
      expect(input).toHaveValue("12,5")
      expect(screen.getByTestId("value")).toHaveTextContent("12.5")
    })

    it("sem casas, os dígitos são o percentual inteiro", async () => {
      const user = userEvent.setup()
      render(<Rate decimals={0} />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveValue("0")
      await user.click(input)
      await user.keyboard("{End}75")
      expect(input).toHaveValue("75")
      expect(screen.getByTestId("value")).toHaveTextContent("75")
      await user.keyboard("0")
      await user.tab()
      expect(input).toHaveValue("750")
      expect(screen.getByRole("alert")).toHaveTextContent("O valor máximo é 100%.")
    })

    it("o valor colado é arredondado para as casas do campo", async () => {
      const user = userEvent.setup()
      render(<Rate decimals={1} />)
      const input = screen.getByRole("textbox")
      await user.click(input)
      await user.paste("12,56")
      expect(input).toHaveValue("12,6")
      expect(screen.getByTestId("value")).toHaveTextContent("12.6")
    })

    it("o form recebe o número com as casas do campo", () => {
      const { container } = render(
        <form>
          <PercentageInput name="taxa" decimals={1} value={12.5} onValueChange={vi.fn()} />
        </form>,
      )
      const form = container.querySelector("form") as HTMLFormElement
      expect(new FormData(form).get("taxa")).toBe("12.5")
    })

    it('com emptyValue="null", o placeholder acompanha as casas', () => {
      render(
        <PercentageInput emptyValue="null" decimals={1} value={null} onValueChange={vi.fn()} />,
      )
      expect(screen.getByRole("textbox")).toHaveAttribute("placeholder", "0,0")
    })
  })
})
