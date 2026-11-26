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

  it("strips punctuation and symbols from a value set at once", () => {
    const onValueChange = vi.fn()
    render(<CNPJInput value="" onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "#11.222.333/0001-81!" } })
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

  describe("colagem", () => {
    it("aceita o CNPJ com rótulo e espaço na frente", async () => {
      const user = userEvent.setup()
      render(<ControlledCNPJInput />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      await user.click(input)
      await user.paste(" CNPJ: 11.222.333/0001-81")
      expect(input).toHaveValue("11.222.333/0001-81")
    })

    it("um CNPJ completo colado substitui o que estava no campo", async () => {
      const user = userEvent.setup()
      render(<ControlledCNPJInput initial="45997418000153" />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      await user.click(input)
      await user.paste("11.222.333/0001-81")
      expect(input).toHaveValue("11.222.333/0001-81")
    })

    it("não tem maxLength e ignora o 15º dígito digitado", async () => {
      const user = userEvent.setup()
      render(<ControlledCNPJInput />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      expect(input).not.toHaveAttribute("maxLength")
      await user.type(input, "112223330001819")
      expect(input).toHaveValue("11.222.333/0001-81")
    })
  })

  // CNPJ alfanumérico (IN RFB 2.229/2024): o campo descartava as letras e o
  // exemplo oficial "12.ABC.345/01DE-35" virava "12.345.013/5".
  describe("CNPJ alfanumérico", () => {
    it("aceita letras nas doze primeiras posições", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      function Harness() {
        const [value, setValue] = React.useState("")
        return (
          <CNPJInput
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
      await user.type(input, "12ABC34501DE35")
      expect(input).toHaveValue("12.ABC.345/01DE-35")
      expect(onValueChange).toHaveBeenLastCalledWith("12ABC34501DE35")
    })

    it("passa para maiúsculas o que é digitado", async () => {
      const user = userEvent.setup()
      render(<ControlledCNPJInput />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      await user.type(input, "12abc34501de35")
      expect(input).toHaveValue("12.ABC.345/01DE-35")
    })

    it("ignora letra nos dois dígitos verificadores", async () => {
      const user = userEvent.setup()
      render(<ControlledCNPJInput />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      await user.type(input, "12ABC34501DEXY35")
      expect(input).toHaveValue("12.ABC.345/01DE-35")
    })

    it("ignora letra com acento e símbolo", async () => {
      const user = userEvent.setup()
      render(<ControlledCNPJInput />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      await user.type(input, "1ç2é_A")
      expect(input).toHaveValue("12.A")
    })

    it("mostra com máscara um valor alfanumérico que vem de fora", () => {
      render(<CNPJInput value="12ABC34501DE35" onValueChange={vi.fn()} />)
      expect(screen.getByRole("textbox")).toHaveValue("12.ABC.345/01DE-35")
    })

    it("aceita o CNPJ alfanumérico colado com rótulo, em minúsculas", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      function Harness() {
        const [value, setValue] = React.useState("")
        return (
          <CNPJInput
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
      await user.paste("CNPJ: 12.abc.345/01de-35")
      expect(input).toHaveValue("12.ABC.345/01DE-35")
      expect(onValueChange).toHaveBeenLastCalledWith("12ABC34501DE35")
    })

    it("o cursor fica no lugar ao trocar uma letra no meio", async () => {
      const user = userEvent.setup()
      render(<ControlledCNPJInput initial="12ABC34501DE35" />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      // "12.A|BC.345/01DE-35"
      await user.type(input, "{Backspace}", { initialSelectionStart: 4, initialSelectionEnd: 4 })
      expect(input).toHaveValue("12.BC3.450/1DE3-5")
      expect(input.selectionStart).toBe(3)
      await user.keyboard("z")
      expect(input).toHaveValue("12.ZBC.345/01DE-35")
      expect(input.selectionStart).toBe(4)
    })

    it("digitar no início não empurra uma letra para os dígitos verificadores", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      // Treze caracteres, com a letra E na 12ª posição.
      render(<CNPJInput value="12ABC34501DE3" onValueChange={onValueChange} />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      expect(input).toHaveValue("12.ABC.345/01DE-3")
      await user.type(input, "9", { initialSelectionStart: 0, initialSelectionEnd: 0 })
      expect(input).toHaveValue("12.ABC.345/01DE-3")
      expect(input.selectionStart).toBe(0)
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it("abre o teclado de texto e pede maiúsculas", () => {
      render(<CNPJInput value="" onValueChange={vi.fn()} />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveAttribute("inputmode", "text")
      expect(input).toHaveAttribute("autocapitalize", "characters")
    })
  })

  // Regressão: com `name`, o form nativo recebia o texto com máscara
  // ("12.ABC.345/01DE-35") enquanto onValueChange entregava o valor limpo.
  describe("em um formulário nativo", () => {
    it("envia o valor limpo, não a máscara", () => {
      const { container } = render(
        <form>
          <CNPJInput name="cnpj" value="12ABC34501DE35" onValueChange={vi.fn()} />
        </form>,
      )
      const form = container.querySelector("form") as HTMLFormElement
      const data = new FormData(form)
      expect(data.get("cnpj")).toBe("12ABC34501DE35")
      expect([...data.keys()]).toEqual(["cnpj"])
      // O campo visível mostra a máscara e não leva o name.
      expect(screen.getByRole("textbox")).toHaveValue("12.ABC.345/01DE-35")
      expect(screen.getByRole("textbox")).not.toHaveAttribute("name")
    })

    it("acompanha o que é digitado", async () => {
      const user = userEvent.setup()
      function Harness() {
        const [value, setValue] = React.useState<string>("")
        return (
          <form>
            <CNPJInput name="cnpj" value={value} onValueChange={setValue} />
          </form>
        )
      }
      const { container } = render(<Harness />)
      await user.click(screen.getByRole("textbox"))
      await user.keyboard("{End}12abc34501de35")
      const form = container.querySelector("form") as HTMLFormElement
      expect(new FormData(form).get("cnpj")).toBe("12ABC34501DE35")
    })

    it("desabilitado, não é enviado", () => {
      const { container } = render(
        <form>
          <CNPJInput name="cnpj" value="12ABC34501DE35" onValueChange={vi.fn()} disabled />
        </form>,
      )
      const form = container.querySelector("form") as HTMLFormElement
      expect(new FormData(form).has("cnpj")).toBe(false)
    })

    it("sem name não cria input oculto", () => {
      const { container } = render(<CNPJInput value="12ABC34501DE35" onValueChange={vi.fn()} />)
      expect(container.querySelector("input[type=hidden]")).toBeNull()
    })

    it("o input oculto acompanha o atributo form", () => {
      const { container } = render(
        <CNPJInput name="cnpj" form="cadastro" value="12ABC34501DE35" onValueChange={vi.fn()} />,
      )
      expect(container.querySelector("input[type=hidden]")).toHaveAttribute("form", "cadastro")
    })
  })

  // Regressão: `value` nulo quebrava em `value.replace`, e sem `value` o
  // campo não guardava nada: só existia o modo controlado.
  describe("valor ausente e modo não controlado", () => {
    it("value null mostra o campo vazio, sem quebrar", () => {
      render(<CNPJInput value={null} onValueChange={vi.fn()} />)
      expect(screen.getByRole("textbox")).toHaveValue("")
    })

    it("value undefined mostra o campo vazio, sem quebrar", () => {
      render(<CNPJInput value={undefined} onValueChange={vi.fn()} />)
      expect(screen.getByRole("textbox")).toHaveValue("")
    })

    it("um valor que não é texto é lido como texto", () => {
      render(<CNPJInput value={11222333000181 as unknown as string} onValueChange={vi.fn()} />)
      expect(screen.getByRole("textbox")).toHaveValue("11.222.333/0001-81")
    })

    it("sem value, parte de defaultValue e guarda o que é digitado", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      const { container } = render(
        <form>
          <CNPJInput name="campo" defaultValue="12ABC3" onValueChange={onValueChange} />
        </form>,
      )
      const input = screen.getByRole("textbox") as HTMLInputElement
      expect(input).toHaveValue("12.ABC.3")
      await user.click(input)
      await user.keyboard("{End}4501de35")
      expect(input).toHaveValue("12.ABC.345/01DE-35")
      expect(onValueChange).toHaveBeenLastCalledWith("12ABC34501DE35")
      const form = container.querySelector("form") as HTMLFormElement
      expect(new FormData(form).get("campo")).toBe("12ABC34501DE35")
    })

    it("sem value nem defaultValue começa vazio e funciona sem onValueChange", async () => {
      const user = userEvent.setup()
      render(<CNPJInput />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      expect(input).toHaveValue("")
      await user.type(input, "12abc34501de35")
      expect(input).toHaveValue("12.ABC.345/01DE-35")
    })

    it("o reset do formulário devolve o defaultValue", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      const { container } = render(
        <form>
          <CNPJInput name="campo" defaultValue="12ABC3" onValueChange={onValueChange} />
          <button type="reset">Limpar</button>
        </form>,
      )
      const input = screen.getByRole("textbox") as HTMLInputElement
      await user.click(input)
      await user.keyboard("{End}4501de35")
      expect(input).toHaveValue("12.ABC.345/01DE-35")
      await user.click(screen.getByRole("button", { name: "Limpar" }))
      expect(input).toHaveValue("12.ABC.3")
      expect(onValueChange).toHaveBeenLastCalledWith("12ABC3")
      const form = container.querySelector("form") as HTMLFormElement
      expect(new FormData(form).get("campo")).toBe("12ABC3")
    })

    it("controlado, quem manda é o value: sem atualização do pai nada muda", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(
        <CNPJInput value="12ABC3" defaultValue="12ABC34501DE35" onValueChange={onValueChange} />,
      )
      const input = screen.getByRole("textbox") as HTMLInputElement
      expect(input).toHaveValue("12.ABC.3")
      await user.click(input)
      await user.keyboard("{End}4501de35")
      expect(onValueChange).toHaveBeenCalled()
      expect(input).toHaveValue("12.ABC.3")
    })
  })

  // Tela de consulta: o valor fica legível e é enviado, mas não é editável.
  // Antes só dava para fingir isso com `disabled`, a 50% de opacidade.
  describe("somente leitura", () => {
    it("mostra o valor, recebe foco e não aceita digitação", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(
        <CNPJInput label="Campo" value="12ABC34501DE35" onValueChange={onValueChange} readOnly />,
      )
      const input = screen.getByRole("textbox") as HTMLInputElement
      expect(input).toHaveAttribute("readonly")
      expect(input).not.toBeDisabled()
      await user.tab()
      expect(input).toHaveFocus()
      await user.keyboard("{End}1{Backspace}")
      expect(input).toHaveValue("12.ABC.345/01DE-35")
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it("não aceita colagem", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(
        <CNPJInput label="Campo" value="12ABC34501DE35" onValueChange={onValueChange} readOnly />,
      )
      const input = screen.getByRole("textbox")
      await user.click(input)
      await user.paste("11.222.333/0001-81")
      expect(input).toHaveValue("12.ABC.345/01DE-35")
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it("continua sendo enviado no formulário", () => {
      const { container } = render(
        <form>
          <CNPJInput name="campo" value="12ABC34501DE35" onValueChange={vi.fn()} readOnly />
        </form>,
      )
      const form = container.querySelector("form") as HTMLFormElement
      expect(new FormData(form).get("campo")).toBe("12ABC34501DE35")
    })

    it("tem aparência própria, diferente do campo editável e do desabilitado", () => {
      const { container } = render(
        <CNPJInput label="Campo" value="12ABC34501DE35" onValueChange={vi.fn()} readOnly />,
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
      render(<CNPJInput value="11222333000181" onValueChange={vi.fn()} />)
      expect(screen.getByRole("textbox").className).toMatch(/\bh-control-md\b/)
    })

    it.each(["sm", "md", "lg"] as const)(
      "size=%s usa a altura de controle correspondente",
      (size) => {
        render(<CNPJInput value="11222333000181" onValueChange={vi.fn()} size={size} />)
        const input = screen.getByRole("textbox")
        expect(input.className).toMatch(new RegExp(`\\bh-control-${size}\\b`))
        // `size` é o tamanho do controle, não o atributo nativo de largura.
        expect(input).not.toHaveAttribute("size")
      },
    )
  })
})
