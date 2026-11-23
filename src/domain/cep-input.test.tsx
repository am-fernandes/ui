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

  // Regressão: com `name`, o form nativo recebia o texto com máscara
  // ("01310-100") enquanto onValueChange entregava o valor limpo.
  describe("em um formulário nativo", () => {
    it("envia o valor limpo, não a máscara", () => {
      const { container } = render(
        <form>
          <CEPInput name="cep" value="01310100" onValueChange={vi.fn()} />
        </form>,
      )
      const form = container.querySelector("form") as HTMLFormElement
      const data = new FormData(form)
      expect(data.get("cep")).toBe("01310100")
      expect([...data.keys()]).toEqual(["cep"])
      // O campo visível mostra a máscara e não leva o name.
      expect(screen.getByRole("textbox")).toHaveValue("01310-100")
      expect(screen.getByRole("textbox")).not.toHaveAttribute("name")
    })

    it("acompanha o que é digitado", async () => {
      const user = userEvent.setup()
      function Harness() {
        const [value, setValue] = React.useState<string>("")
        return (
          <form>
            <CEPInput name="cep" value={value} onValueChange={setValue} />
          </form>
        )
      }
      const { container } = render(<Harness />)
      await user.click(screen.getByRole("textbox"))
      await user.keyboard("{End}01310100")
      const form = container.querySelector("form") as HTMLFormElement
      expect(new FormData(form).get("cep")).toBe("01310100")
    })

    it("desabilitado, não é enviado", () => {
      const { container } = render(
        <form>
          <CEPInput name="cep" value="01310100" onValueChange={vi.fn()} disabled />
        </form>,
      )
      const form = container.querySelector("form") as HTMLFormElement
      expect(new FormData(form).has("cep")).toBe(false)
    })

    it("sem name não cria input oculto", () => {
      const { container } = render(<CEPInput value="01310100" onValueChange={vi.fn()} />)
      expect(container.querySelector("input[type=hidden]")).toBeNull()
    })

    it("o input oculto acompanha o atributo form", () => {
      const { container } = render(
        <CEPInput name="cep" form="cadastro" value="01310100" onValueChange={vi.fn()} />,
      )
      expect(container.querySelector("input[type=hidden]")).toHaveAttribute("form", "cadastro")
    })
  })

  // Regressão: `value` nulo quebrava em `value.replace`, e sem `value` o
  // campo não guardava nada: só existia o modo controlado.
  describe("valor ausente e modo não controlado", () => {
    it("value null mostra o campo vazio, sem quebrar", () => {
      render(<CEPInput value={null} onValueChange={vi.fn()} />)
      expect(screen.getByRole("textbox")).toHaveValue("")
    })

    it("value undefined mostra o campo vazio, sem quebrar", () => {
      render(<CEPInput value={undefined} onValueChange={vi.fn()} />)
      expect(screen.getByRole("textbox")).toHaveValue("")
    })

    it("um valor que não é texto é lido como texto", () => {
      render(<CEPInput value={13101000 as unknown as string} onValueChange={vi.fn()} />)
      expect(screen.getByRole("textbox")).toHaveValue("13101-000")
    })

    it("sem value, parte de defaultValue e guarda o que é digitado", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      const { container } = render(
        <form>
          <CEPInput name="campo" defaultValue="0131" onValueChange={onValueChange} />
        </form>,
      )
      const input = screen.getByRole("textbox") as HTMLInputElement
      expect(input).toHaveValue("0131")
      await user.click(input)
      await user.keyboard("{End}0100")
      expect(input).toHaveValue("01310-100")
      expect(onValueChange).toHaveBeenLastCalledWith("01310100")
      const form = container.querySelector("form") as HTMLFormElement
      expect(new FormData(form).get("campo")).toBe("01310100")
    })

    it("sem value nem defaultValue começa vazio e funciona sem onValueChange", async () => {
      const user = userEvent.setup()
      render(<CEPInput />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      expect(input).toHaveValue("")
      await user.type(input, "01310100")
      expect(input).toHaveValue("01310-100")
    })

    it("o reset do formulário devolve o defaultValue", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      const { container } = render(
        <form>
          <CEPInput name="campo" defaultValue="0131" onValueChange={onValueChange} />
          <button type="reset">Limpar</button>
        </form>,
      )
      const input = screen.getByRole("textbox") as HTMLInputElement
      await user.click(input)
      await user.keyboard("{End}0100")
      expect(input).toHaveValue("01310-100")
      await user.click(screen.getByRole("button", { name: "Limpar" }))
      expect(input).toHaveValue("0131")
      expect(onValueChange).toHaveBeenLastCalledWith("0131")
      const form = container.querySelector("form") as HTMLFormElement
      expect(new FormData(form).get("campo")).toBe("0131")
    })

    it("controlado, quem manda é o value: sem atualização do pai nada muda", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<CEPInput value="0131" defaultValue="01310100" onValueChange={onValueChange} />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      expect(input).toHaveValue("0131")
      await user.click(input)
      await user.keyboard("{End}0100")
      expect(onValueChange).toHaveBeenCalled()
      expect(input).toHaveValue("0131")
    })
  })

  // Todo formulário de endereço consulta o CEP assim que ele fica completo.
  describe("onComplete", () => {
    function Lookup({
      onComplete,
      initial = "",
    }: { onComplete: (cep: string) => void; initial?: string }) {
      const [value, setValue] = React.useState(initial)
      return <CEPInput label="CEP" value={value} onValueChange={setValue} onComplete={onComplete} />
    }

    it("dispara uma vez, com os oito dígitos, quando o oitavo é digitado", async () => {
      const user = userEvent.setup()
      const onComplete = vi.fn()
      render(<Lookup onComplete={onComplete} />)
      const input = screen.getByRole("textbox")
      await user.type(input, "0131010")
      expect(onComplete).not.toHaveBeenCalled()
      await user.keyboard("0")
      expect(onComplete).toHaveBeenCalledTimes(1)
      expect(onComplete).toHaveBeenCalledWith("01310100")
    })

    it("dispara quando um CEP completo é colado", async () => {
      const user = userEvent.setup()
      const onComplete = vi.fn()
      render(<Lookup onComplete={onComplete} />)
      await user.click(screen.getByRole("textbox"))
      await user.paste("CEP 01310-100")
      expect(onComplete).toHaveBeenCalledTimes(1)
      expect(onComplete).toHaveBeenCalledWith("01310100")
    })

    it("dispara de novo quando o CEP é corrigido e volta a ter oito dígitos", async () => {
      const user = userEvent.setup()
      const onComplete = vi.fn()
      render(<Lookup onComplete={onComplete} initial="01310100" />)
      const input = screen.getByRole("textbox")
      await user.click(input)
      await user.keyboard("{End}{Backspace}")
      expect(onComplete).not.toHaveBeenCalled()
      await user.keyboard("9")
      expect(onComplete).toHaveBeenCalledTimes(1)
      expect(onComplete).toHaveBeenCalledWith("01310109")
    })

    it("não dispara por um value que chega pronto de fora", () => {
      const onComplete = vi.fn()
      const { rerender } = render(
        <CEPInput value="" onValueChange={vi.fn()} onComplete={onComplete} />,
      )
      rerender(<CEPInput value="01310100" onValueChange={vi.fn()} onComplete={onComplete} />)
      expect(onComplete).not.toHaveBeenCalled()
    })

    it("funciona no modo não controlado", async () => {
      const user = userEvent.setup()
      const onComplete = vi.fn()
      render(<CEPInput onComplete={onComplete} />)
      await user.type(screen.getByRole("textbox"), "01310100")
      expect(onComplete).toHaveBeenCalledWith("01310100")
    })
  })

  describe("loading", () => {
    it("mostra um indicador dentro do campo e avisa o leitor de tela", () => {
      const { container } = render(
        <CEPInput label="CEP" value="01310100" onValueChange={vi.fn()} loading />,
      )
      expect(container.querySelector('[data-slot="cep-input-spinner"]')).not.toBeNull()
      expect(screen.getByRole("textbox")).toHaveAttribute("aria-busy", "true")
      expect(screen.getByRole("status")).toHaveTextContent("Buscando endereço…")
    })

    it("sem loading não há indicador nem aviso", () => {
      const { container } = render(
        <CEPInput label="CEP" value="01310100" onValueChange={vi.fn()} />,
      )
      expect(container.querySelector('[data-slot="cep-input-spinner"]')).toBeNull()
      expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-busy")
      expect(screen.getByRole("status")).toBeEmptyDOMElement()
    })

    it("o campo continua editável enquanto carrega", async () => {
      const user = userEvent.setup()
      render(<ControlledCEPInput initial="0131010" />)
      const input = screen.getByRole("textbox")
      expect(input).not.toBeDisabled()
      await user.click(input)
      await user.keyboard("{End}0")
      expect(input).toHaveValue("01310-100")
    })

    it("o texto do aviso vem de labels", () => {
      render(
        <CEPInput value="" onValueChange={vi.fn()} loading labels={{ loading: "Looking up…" }} />,
      )
      expect(screen.getByRole("status")).toHaveTextContent("Looking up…")
    })
  })

  // Tela de consulta: o valor fica legível e é enviado, mas não é editável.
  // Antes só dava para fingir isso com `disabled`, a 50% de opacidade.
  describe("somente leitura", () => {
    it("mostra o valor, recebe foco e não aceita digitação", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<CEPInput label="Campo" value="01310100" onValueChange={onValueChange} readOnly />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      expect(input).toHaveAttribute("readonly")
      expect(input).not.toBeDisabled()
      await user.tab()
      expect(input).toHaveFocus()
      await user.keyboard("{End}1{Backspace}")
      expect(input).toHaveValue("01310-100")
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it("não aceita colagem", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<CEPInput label="Campo" value="01310100" onValueChange={onValueChange} readOnly />)
      const input = screen.getByRole("textbox")
      await user.click(input)
      await user.paste("04538-133")
      expect(input).toHaveValue("01310-100")
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it("continua sendo enviado no formulário", () => {
      const { container } = render(
        <form>
          <CEPInput name="campo" value="01310100" onValueChange={vi.fn()} readOnly />
        </form>,
      )
      const form = container.querySelector("form") as HTMLFormElement
      expect(new FormData(form).get("campo")).toBe("01310100")
    })

    it("tem aparência própria, diferente do campo editável e do desabilitado", () => {
      const { container } = render(
        <CEPInput label="Campo" value="01310100" onValueChange={vi.fn()} readOnly />,
      )
      expect(screen.getByRole("textbox").className).toMatch(/bg-muted/)
      // Sem a opacidade de desabilitado no shell.
      expect(container.querySelector("[data-slot='field-shell']")?.className).not.toMatch(
        /opacity-50/,
      )
    })
  })
})
