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

  // Regressão: o campo tinha maxLength igual ao tamanho da máscara, então o
  // navegador cortava o texto colado antes da limpeza e o CPF perdia dígitos.
  describe("colagem", () => {
    async function pasteInto(text: string, initial = "") {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      function Harness() {
        const [value, setValue] = React.useState(initial)
        return (
          <CPFInput
            label="CPF"
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

    it("aceita o número com espaço na frente", async () => {
      const { input, onValueChange } = await pasteInto(" 529.982.247-25")
      expect(input).toHaveValue("529.982.247-25")
      expect(onValueChange).toHaveBeenLastCalledWith("52998224725")
    })

    it("aceita o número com rótulo na frente", async () => {
      const { input, onValueChange } = await pasteInto("CPF: 529.982.247-25")
      expect(input).toHaveValue("529.982.247-25")
      expect(onValueChange).toHaveBeenLastCalledWith("52998224725")
    })

    it("acha o CPF no meio de um texto com outros números", async () => {
      const { input } = await pasteInto(
        "Nascido em 01/02/1990, CPF 529.982.247-25, RG 12.345.678-9",
      )
      expect(input).toHaveValue("529.982.247-25")
    })

    it("aceita só os dígitos", async () => {
      const { input } = await pasteInto("52998224725")
      expect(input).toHaveValue("529.982.247-25")
    })

    it("um CPF completo colado substitui o que estava no campo", async () => {
      const { input, onValueChange } = await pasteInto("529.982.247-25", "12345678909")
      expect(input).toHaveValue("529.982.247-25")
      expect(onValueChange).toHaveBeenLastCalledWith("52998224725")
    })

    it("um pedaço colado entra no ponto do cursor", async () => {
      const user = userEvent.setup()
      render(<ControlledCPFInput initial="529247" />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      // "529|.247" → cola "982" → "529.982|.247"
      await user.type(input, "{Shift}", { initialSelectionStart: 3, initialSelectionEnd: 3 })
      await user.paste("982")
      expect(input).toHaveValue("529.982.247")
      expect(input.selectionStart).toBe(7)
    })

    it("texto sem número nenhum não muda o campo", async () => {
      const { input, onValueChange } = await pasteInto("sem número", "12345678909")
      expect(input).toHaveValue("123.456.789-09")
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it("o onPaste de quem usa o campo é chamado e pode cancelar a colagem", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      const onPaste = vi.fn((e: React.ClipboardEvent<HTMLInputElement>) => e.preventDefault())
      render(<CPFInput value="" onValueChange={onValueChange} onPaste={onPaste} />)
      await user.click(screen.getByRole("textbox"))
      await user.paste("529.982.247-25")
      expect(onPaste).toHaveBeenCalledTimes(1)
      expect(onValueChange).not.toHaveBeenCalled()
    })
  })

  describe("campo cheio", () => {
    it("não tem maxLength: quem limita é a contagem de dígitos", () => {
      render(<CPFInput value="" onValueChange={vi.fn()} />)
      expect(screen.getByRole("textbox")).not.toHaveAttribute("maxLength")
    })

    it("o 12º dígito digitado é ignorado", async () => {
      const user = userEvent.setup()
      render(<ControlledCPFInput />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      await user.type(input, "529982247259")
      expect(input).toHaveValue("529.982.247-25")
    })

    it("digitar no meio de um CPF completo não empurra o último dígito para fora", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<CPFInput value="52998224725" onValueChange={onValueChange} />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      await user.type(input, "7", { initialSelectionStart: 2, initialSelectionEnd: 2 })
      expect(input).toHaveValue("529.982.247-25")
      expect(input.selectionStart).toBe(2)
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it("com um trecho selecionado, o dígito digitado substitui a seleção", async () => {
      const user = userEvent.setup()
      render(<ControlledCPFInput initial="52998224725" />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      // seleciona o "2" de "5[2]9.982.247-25"
      await user.type(input, "3", { initialSelectionStart: 1, initialSelectionEnd: 2 })
      expect(input).toHaveValue("539.982.247-25")
      expect(input.selectionStart).toBe(2)
    })
  })

  // Regressão: com `name`, o form nativo recebia o texto com máscara
  // ("529.982.247-25") enquanto onValueChange entregava o valor limpo.
  describe("em um formulário nativo", () => {
    it("envia o valor limpo, não a máscara", () => {
      const { container } = render(
        <form>
          <CPFInput name="cpf" value="52998224725" onValueChange={vi.fn()} />
        </form>,
      )
      const form = container.querySelector("form") as HTMLFormElement
      const data = new FormData(form)
      expect(data.get("cpf")).toBe("52998224725")
      expect([...data.keys()]).toEqual(["cpf"])
      // O campo visível mostra a máscara e não leva o name.
      expect(screen.getByRole("textbox")).toHaveValue("529.982.247-25")
      expect(screen.getByRole("textbox")).not.toHaveAttribute("name")
    })

    it("acompanha o que é digitado", async () => {
      const user = userEvent.setup()
      function Harness() {
        const [value, setValue] = React.useState<string>("")
        return (
          <form>
            <CPFInput name="cpf" value={value} onValueChange={setValue} />
          </form>
        )
      }
      const { container } = render(<Harness />)
      await user.click(screen.getByRole("textbox"))
      await user.keyboard("{End}52998224725")
      const form = container.querySelector("form") as HTMLFormElement
      expect(new FormData(form).get("cpf")).toBe("52998224725")
    })

    it("desabilitado, não é enviado", () => {
      const { container } = render(
        <form>
          <CPFInput name="cpf" value="52998224725" onValueChange={vi.fn()} disabled />
        </form>,
      )
      const form = container.querySelector("form") as HTMLFormElement
      expect(new FormData(form).has("cpf")).toBe(false)
    })

    it("sem name não cria input oculto", () => {
      const { container } = render(<CPFInput value="52998224725" onValueChange={vi.fn()} />)
      expect(container.querySelector("input[type=hidden]")).toBeNull()
    })

    it("o input oculto acompanha o atributo form", () => {
      const { container } = render(
        <CPFInput name="cpf" form="cadastro" value="52998224725" onValueChange={vi.fn()} />,
      )
      expect(container.querySelector("input[type=hidden]")).toHaveAttribute("form", "cadastro")
    })
  })

  // Regressão: `value` nulo quebrava em `value.replace`, e sem `value` o
  // campo não guardava nada: só existia o modo controlado.
  describe("valor ausente e modo não controlado", () => {
    it("value null mostra o campo vazio, sem quebrar", () => {
      render(<CPFInput value={null} onValueChange={vi.fn()} />)
      expect(screen.getByRole("textbox")).toHaveValue("")
    })

    it("value undefined mostra o campo vazio, sem quebrar", () => {
      render(<CPFInput value={undefined} onValueChange={vi.fn()} />)
      expect(screen.getByRole("textbox")).toHaveValue("")
    })

    it("um valor que não é texto é lido como texto", () => {
      render(<CPFInput value={52998224725 as unknown as string} onValueChange={vi.fn()} />)
      expect(screen.getByRole("textbox")).toHaveValue("529.982.247-25")
    })

    it("sem value, parte de defaultValue e guarda o que é digitado", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      const { container } = render(
        <form>
          <CPFInput name="campo" defaultValue="529982" onValueChange={onValueChange} />
        </form>,
      )
      const input = screen.getByRole("textbox") as HTMLInputElement
      expect(input).toHaveValue("529.982")
      await user.click(input)
      await user.keyboard("{End}24725")
      expect(input).toHaveValue("529.982.247-25")
      expect(onValueChange).toHaveBeenLastCalledWith("52998224725")
      const form = container.querySelector("form") as HTMLFormElement
      expect(new FormData(form).get("campo")).toBe("52998224725")
    })

    it("sem value nem defaultValue começa vazio e funciona sem onValueChange", async () => {
      const user = userEvent.setup()
      render(<CPFInput />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      expect(input).toHaveValue("")
      await user.type(input, "52998224725")
      expect(input).toHaveValue("529.982.247-25")
    })

    it("o reset do formulário devolve o defaultValue", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      const { container } = render(
        <form>
          <CPFInput name="campo" defaultValue="529982" onValueChange={onValueChange} />
          <button type="reset">Limpar</button>
        </form>,
      )
      const input = screen.getByRole("textbox") as HTMLInputElement
      await user.click(input)
      await user.keyboard("{End}24725")
      expect(input).toHaveValue("529.982.247-25")
      await user.click(screen.getByRole("button", { name: "Limpar" }))
      expect(input).toHaveValue("529.982")
      expect(onValueChange).toHaveBeenLastCalledWith("529982")
      const form = container.querySelector("form") as HTMLFormElement
      expect(new FormData(form).get("campo")).toBe("529982")
    })

    it("controlado, quem manda é o value: sem atualização do pai nada muda", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<CPFInput value="529982" defaultValue="52998224725" onValueChange={onValueChange} />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      expect(input).toHaveValue("529.982")
      await user.click(input)
      await user.keyboard("{End}24725")
      expect(onValueChange).toHaveBeenCalled()
      expect(input).toHaveValue("529.982")
    })
  })

  // Tela de consulta: o valor fica legível e é enviado, mas não é editável.
  // Antes só dava para fingir isso com `disabled`, a 50% de opacidade.
  describe("somente leitura", () => {
    it("mostra o valor, recebe foco e não aceita digitação", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<CPFInput label="Campo" value="52998224725" onValueChange={onValueChange} readOnly />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      expect(input).toHaveAttribute("readonly")
      expect(input).not.toBeDisabled()
      await user.tab()
      expect(input).toHaveFocus()
      await user.keyboard("{End}1{Backspace}")
      expect(input).toHaveValue("529.982.247-25")
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it("não aceita colagem", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<CPFInput label="Campo" value="52998224725" onValueChange={onValueChange} readOnly />)
      const input = screen.getByRole("textbox")
      await user.click(input)
      await user.paste("123.456.789-09")
      expect(input).toHaveValue("529.982.247-25")
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it("continua sendo enviado no formulário", () => {
      const { container } = render(
        <form>
          <CPFInput name="campo" value="52998224725" onValueChange={vi.fn()} readOnly />
        </form>,
      )
      const form = container.querySelector("form") as HTMLFormElement
      expect(new FormData(form).get("campo")).toBe("52998224725")
    })

    it("tem aparência própria, diferente do campo editável e do desabilitado", () => {
      const { container } = render(
        <CPFInput label="Campo" value="52998224725" onValueChange={vi.fn()} readOnly />,
      )
      expect(screen.getByRole("textbox").className).toMatch(/bg-muted/)
      // Sem a opacidade de desabilitado no shell.
      expect(container.querySelector("[data-slot='field-shell']")?.className).not.toMatch(
        /opacity-50/,
      )
    })
  })
})
