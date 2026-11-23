import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { MultiInput, defaultMultiInputLabels } from "./multi-input"

describe("MultiInput", () => {
  it("renders one badge per string value", () => {
    render(<MultiInput value={["urgente", "fiscal"]} onValueChange={vi.fn()} />)
    expect(screen.getByText("urgente")).toBeInTheDocument()
    expect(screen.getByText("fiscal")).toBeInTheDocument()
  })

  it("renders one badge per number value (sorted)", () => {
    render(<MultiInput type="number" value={[20, 10]} onValueChange={vi.fn()} />)
    const badges = screen.getAllByText(/^\d+$/)
    expect(badges.map((b) => b.textContent)).toEqual(["10", "20"])
  })

  it("renders placeholder when empty", () => {
    render(<MultiInput value={[]} onValueChange={vi.fn()} placeholder="Adicionar tag" />)
    expect(screen.getByPlaceholderText("Adicionar tag")).toBeInTheDocument()
  })

  it("number-mode placeholder defaults differ from string-mode", () => {
    render(<MultiInput type="number" value={[]} onValueChange={vi.fn()} />)
    expect(screen.getByPlaceholderText("Adicione um número")).toBeInTheDocument()
  })

  it("emits onValueChange when a string is committed via Enter", async () => {
    const onValueChange = vi.fn()
    render(<MultiInput value={[]} onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox")
    await userEvent.type(input, "nova-tag{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith(["nova-tag"])
  })

  it("emits onValueChange with parsed numbers when type=number", async () => {
    const onValueChange = vi.fn()
    render(<MultiInput type="number" value={[]} onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox")
    await userEvent.type(input, "30,60,90{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith([30, 60, 90])
  })

  it("commits pending input on blur", () => {
    const onValueChange = vi.fn()
    render(<MultiInput value={[]} onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "compras" } })
    fireEvent.blur(input)
    expect(onValueChange).toHaveBeenLastCalledWith(["compras"])
  })

  it("clicking the remove button on a Badge does NOT commit pending input", () => {
    const onValueChange = vi.fn()
    render(<MultiInput value={["alpha"]} onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "incompleto" } })
    const removeBtn = screen.getByRole("button", { name: /Remover alpha/ })
    // Simulate the blur that happens when focus moves to another element inside
    // the same wrapper. `relatedTarget` points at that other element.
    fireEvent.blur(input, { relatedTarget: removeBtn })
    // The pending half-typed text must NOT have been committed.
    expect(onValueChange).not.toHaveBeenCalledWith(["alpha", "incompleto"])
  })

  it("commits all tokens when pasting a multi-line / comma-separated string", () => {
    const onValueChange = vi.fn()
    render(<MultiInput value={[]} onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    // <input type="text"> strips newlines on direct typing; paste is the real path.
    fireEvent.paste(input, {
      clipboardData: {
        getData: () => "a,b,c\nd",
      },
    })
    expect(onValueChange).toHaveBeenLastCalledWith(["a", "b", "c", "d"])
  })

  it("dedupes string tokens against existing value", async () => {
    const onValueChange = vi.fn()
    render(<MultiInput value={["a"]} onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "a,b,b,c" } })
    fireEvent.keyDown(input, { key: "Enter" })
    expect(onValueChange).toHaveBeenLastCalledWith(["a", "b", "c"])
  })

  it("invalid token in number mode is dropped and onReject is called with 'invalid'", () => {
    const onValueChange = vi.fn()
    const onReject = vi.fn()
    render(
      <MultiInput type="number" value={[]} onValueChange={onValueChange} onReject={onReject} />,
    )
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "10 abc 20" } })
    fireEvent.keyDown(input, { key: "Enter" })
    expect(onValueChange).toHaveBeenLastCalledWith([10, 20])
    expect(onReject).toHaveBeenCalledWith("invalid")
  })

  it("maxItems caps the total number of tokens and fires onReject with 'max-items'", () => {
    const onValueChange = vi.fn()
    const onReject = vi.fn()
    render(
      <MultiInput value={["a"]} onValueChange={onValueChange} onReject={onReject} maxItems={2} />,
    )
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "b,c,d" } })
    fireEvent.keyDown(input, { key: "Enter" })
    expect(onValueChange).toHaveBeenLastCalledWith(["a", "b"])
    expect(onReject).toHaveBeenCalledWith("max-items")
  })

  it("Backspace on empty input removes the last token", () => {
    const onValueChange = vi.fn()
    render(<MultiInput value={["a", "b"]} onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.keyDown(input, { key: "Backspace" })
    expect(onValueChange).toHaveBeenLastCalledWith(["a"])
  })

  // -- Additional coverage tests below --------------------------------------

  it("maxItems=undefined allows unlimited tokens", () => {
    const onValueChange = vi.fn()
    const onReject = vi.fn()
    render(<MultiInput value={[]} onValueChange={onValueChange} onReject={onReject} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "a,b,c,d,e,f,g,h,i,j" } })
    fireEvent.keyDown(input, { key: "Enter" })
    expect(onValueChange).toHaveBeenLastCalledWith([
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
    ])
    expect(onReject).not.toHaveBeenCalled()
  })

  it("maxItems caps numeric tokens and fires 'max-items' rejection", () => {
    const onValueChange = vi.fn()
    const onReject = vi.fn()
    render(
      <MultiInput
        type="number"
        value={[]}
        onValueChange={onValueChange}
        onReject={onReject}
        maxItems={2}
      />,
    )
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "1,2,3,4" } })
    fireEvent.keyDown(input, { key: "Enter" })
    expect(onValueChange).toHaveBeenLastCalledWith([1, 2])
    expect(onReject).toHaveBeenCalledWith("max-items")
  })

  it("renders prefix and suffix around each token", () => {
    render(
      <MultiInput type="number" value={[5]} onValueChange={vi.fn()} prefix="R$ " suffix=" dias" />,
    )
    expect(screen.getByText("R$ 5 dias")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Remover R\$ 5 dias/ })).toBeInTheDocument()
  })

  it("error state applies the destructive border class", () => {
    const { container } = render(<MultiInput value={["a"]} onValueChange={vi.fn()} error="erro" />)
    const wrapper = container.querySelector("[data-slot='multi-input']")
    expect(wrapper?.className).toMatch(/field-error/)
    expect(screen.getByRole("alert")).toHaveTextContent("erro")
  })

  it("clicking the remove button removes that token and keeps the focus in the input", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<MultiInput value={["alpha", "beta"]} onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox")
    await user.click(input)
    await user.click(screen.getByRole("button", { name: /Remover beta/ }))
    expect(onValueChange).toHaveBeenLastCalledWith(["alpha"])
    expect(input).toHaveFocus()
  })

  it("paste without separators leaves the input untouched (default text insertion)", () => {
    const onValueChange = vi.fn()
    render(<MultiInput value={[]} onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.paste(input, {
      clipboardData: { getData: () => "uma palavra" },
    })
    // No commit triggered — preventDefault was NOT called, browser pastes natively
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it("Backspace on a non-empty input does NOT remove tokens", () => {
    const onValueChange = vi.fn()
    render(<MultiInput value={["a"]} onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "x" } })
    fireEvent.keyDown(input, { key: "Backspace" })
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it("disabled prevents the remove button from rendering", () => {
    render(<MultiInput value={["a"]} onValueChange={vi.fn()} disabled />)
    expect(screen.queryByRole("button", { name: /Remover a/ })).not.toBeInTheDocument()
  })

  it("number-mode dedupes tokens against existing value", () => {
    const onValueChange = vi.fn()
    render(<MultiInput type="number" value={[1, 2]} onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "2,3,3" } })
    fireEvent.keyDown(input, { key: "Enter" })
    expect(onValueChange).toHaveBeenLastCalledWith([1, 2, 3])
  })

  it("removing a token in number mode filters the numeric array", () => {
    const onValueChange = vi.fn()
    render(<MultiInput type="number" value={[1, 2, 3]} onValueChange={onValueChange} />)
    const removeBtn = screen.getByRole("button", { name: /Remover 2/ })
    fireEvent.click(removeBtn)
    expect(onValueChange).toHaveBeenLastCalledWith([1, 3])
  })

  it("empty-string parse on Enter is a no-op", () => {
    const onValueChange = vi.fn()
    render(<MultiInput value={["a"]} onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.keyDown(input, { key: "Enter" })
    expect(onValueChange).not.toHaveBeenCalled()
  })

  // Regressão: aria-label={placeholder} passava por cima do <label>, e o
  // grupo se chamava "Lista de itens": o rótulo visível não nomeava nada.
  describe("nome acessível", () => {
    it("o campo de texto recebe o nome do rótulo visível", () => {
      render(
        <MultiInput
          label="E-mails de contato"
          placeholder="Adicione um e-mail"
          value={[]}
          onValueChange={vi.fn()}
        />,
      )
      const input = screen.getByRole("textbox", { name: "E-mails de contato" })
      expect(input).not.toHaveAttribute("aria-label")
      // O clique no rótulo leva ao campo: é ele o alvo do `for`.
      expect(screen.getByText("E-mails de contato")).toHaveAttribute("for", input.id)
    })

    it("o grupo também é nomeado pelo rótulo visível", () => {
      render(<MultiInput label="E-mails de contato" value={["a@b.co"]} onValueChange={vi.fn()} />)
      expect(screen.getByRole("group", { name: "E-mails de contato" })).toBeInTheDocument()
    })

    it("o rótulo obrigatório entra no nome", () => {
      render(<MultiInput label="Responsáveis" required value={[]} onValueChange={vi.fn()} />)
      expect(screen.getByRole("textbox", { name: /Responsáveis/ })).toBeInTheDocument()
    })

    it("sem rótulo, aria-label nomeia o campo e o grupo", () => {
      render(<MultiInput aria-label="Tags" value={[]} onValueChange={vi.fn()} />)
      expect(screen.getByRole("textbox", { name: "Tags" })).toBeInTheDocument()
      expect(screen.getByRole("group", { name: "Tags" })).toBeInTheDocument()
    })

    it("sem rótulo nem aria-label, o placeholder continua nomeando o campo", () => {
      render(<MultiInput placeholder="Adicionar tag" value={[]} onValueChange={vi.fn()} />)
      expect(screen.getByRole("textbox", { name: "Adicionar tag" })).toBeInTheDocument()
      expect(screen.getByRole("group", { name: "Lista de itens" })).toBeInTheDocument()
    })
  })

  // Regressão: o botão de remover só reagia a mousedown. Recebia foco pelo
  // teclado e Enter ou Espaço não faziam nada.
  describe("remover pelo teclado", () => {
    function Controlled({ initial }: { initial: string[] }) {
      const [value, setValue] = React.useState(initial)
      return <MultiInput label="Tags" value={value} onValueChange={setValue} />
    }

    it.each([
      ["Enter", "{Enter}"],
      ["Espaço", " "],
      ["Delete", "{Delete}"],
      ["Backspace", "{Backspace}"],
    ])("%s no botão de remover tira o item", async (_name, key) => {
      const user = userEvent.setup()
      render(<Controlled initial={["a", "b", "c"]} />)
      screen.getByRole("button", { name: "Remover b" }).focus()
      await user.keyboard(key)
      expect(screen.queryByText("b")).not.toBeInTheDocument()
      expect(screen.getByText("a")).toBeInTheDocument()
      expect(screen.getByText("c")).toBeInTheDocument()
    })

    it("Tab chega a cada botão de remover e depois ao campo", async () => {
      const user = userEvent.setup()
      render(<Controlled initial={["a", "b"]} />)
      await user.tab()
      expect(screen.getByRole("button", { name: "Remover a" })).toHaveFocus()
      await user.tab()
      expect(screen.getByRole("button", { name: "Remover b" })).toHaveFocus()
      await user.tab()
      expect(screen.getByRole("textbox")).toHaveFocus()
    })

    it("depois de Enter o foco vai para o item seguinte", async () => {
      const user = userEvent.setup()
      render(<Controlled initial={["a", "b", "c"]} />)
      screen.getByRole("button", { name: "Remover b" }).focus()
      await user.keyboard("{Enter}")
      expect(screen.getByRole("button", { name: "Remover c" })).toHaveFocus()
    })

    it("ao remover o último item o foco vai para o anterior", async () => {
      const user = userEvent.setup()
      render(<Controlled initial={["a", "b", "c"]} />)
      screen.getByRole("button", { name: "Remover c" }).focus()
      await user.keyboard("{Enter}")
      expect(screen.getByRole("button", { name: "Remover b" })).toHaveFocus()
    })

    it("depois de Backspace o foco vai para o item anterior", async () => {
      const user = userEvent.setup()
      render(<Controlled initial={["a", "b", "c"]} />)
      screen.getByRole("button", { name: "Remover b" }).focus()
      await user.keyboard("{Backspace}")
      expect(screen.getByRole("button", { name: "Remover a" })).toHaveFocus()
    })

    it("Backspace no primeiro item deixa o foco no que sobrou na frente", async () => {
      const user = userEvent.setup()
      render(<Controlled initial={["a", "b"]} />)
      screen.getByRole("button", { name: "Remover a" }).focus()
      await user.keyboard("{Backspace}")
      expect(screen.getByRole("button", { name: "Remover b" })).toHaveFocus()
    })

    it("ao remover o único item o foco volta para o campo de texto", async () => {
      const user = userEvent.setup()
      render(<Controlled initial={["a"]} />)
      screen.getByRole("button", { name: "Remover a" }).focus()
      await user.keyboard(" ")
      expect(screen.getByRole("textbox")).toHaveFocus()
    })

    it("dá para esvaziar a lista só com o teclado", async () => {
      const user = userEvent.setup()
      render(<Controlled initial={["a", "b", "c"]} />)
      await user.tab()
      await user.keyboard("{Enter}{Enter}{Enter}")
      expect(screen.queryByRole("button", { name: /Remover/ })).not.toBeInTheDocument()
      expect(screen.getByRole("textbox")).toHaveFocus()
    })

    it("se o pai não aceita a remoção, o foco fica onde estava", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<MultiInput label="Tags" value={["a", "b"]} onValueChange={onValueChange} />)
      const button = screen.getByRole("button", { name: "Remover a" })
      button.focus()
      await user.keyboard("{Enter}")
      expect(onValueChange).toHaveBeenCalledWith(["b"])
      expect(button).toHaveFocus()
    })

    it("outras teclas no botão de remover não removem nada", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<MultiInput label="Tags" value={["a", "b"]} onValueChange={onValueChange} />)
      screen.getByRole("button", { name: "Remover a" }).focus()
      await user.keyboard("x{ArrowRight}")
      expect(onValueChange).not.toHaveBeenCalled()
    })
  })

  // Regressão: no modo número a lista era ordenada e depois cortada, então
  // [10, 20, 30] + 5 com limite 3 virava [5, 10, 20]: o 30, que já estava
  // lá, sumia.
  describe("maxItems recusa os itens novos", () => {
    it("lista de números cheia: o novo é recusado e os antigos ficam", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      const onReject = vi.fn()
      render(
        <MultiInput
          type="number"
          label="Prazos"
          value={[10, 20, 30]}
          maxItems={3}
          onValueChange={onValueChange}
          onReject={onReject}
        />,
      )
      const input = screen.getByRole("textbox")
      await user.type(input, "5{Enter}")
      expect(onValueChange).not.toHaveBeenCalled()
      expect(onReject).toHaveBeenCalledWith("max-items")
      // O texto fica no campo: a pessoa vê que ele não entrou.
      expect(input).toHaveValue("5")
    })

    it("com espaço para um só, entra o primeiro novo e o resto é recusado", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      const onReject = vi.fn()
      render(
        <MultiInput
          type="number"
          label="Prazos"
          value={[10, 20]}
          maxItems={3}
          onValueChange={onValueChange}
          onReject={onReject}
        />,
      )
      // Entra o 40, digitado primeiro; o 5 não toma o lugar de quem já estava.
      await user.type(screen.getByRole("textbox"), "40 5{Enter}")
      expect(onValueChange).toHaveBeenLastCalledWith([10, 20, 40])
      expect(onReject).toHaveBeenCalledWith("max-items")
    })

    it("lista de texto cheia: o novo é recusado, sem chamar onValueChange", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      const onReject = vi.fn()
      render(
        <MultiInput
          label="Tags"
          value={["a", "b"]}
          maxItems={2}
          onValueChange={onValueChange}
          onReject={onReject}
        />,
      )
      const input = screen.getByRole("textbox")
      await user.type(input, "c{Enter}")
      expect(onValueChange).not.toHaveBeenCalled()
      expect(onReject).toHaveBeenCalledWith("max-items")
      expect(input).toHaveValue("c")
    })

    it("um item repetido não conta para o limite nem dispara onValueChange", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      const onReject = vi.fn()
      render(
        <MultiInput
          label="Tags"
          value={["a", "b"]}
          maxItems={2}
          onValueChange={onValueChange}
          onReject={onReject}
        />,
      )
      const input = screen.getByRole("textbox")
      await user.type(input, "a{Enter}")
      expect(onValueChange).not.toHaveBeenCalled()
      expect(onReject).not.toHaveBeenCalled()
      // Já está na lista: o texto sai do campo.
      expect(input).toHaveValue("")
    })
  })

  // Regressão: o modo número usava parseInt, que lê o começo do texto e
  // ignora o resto: "10.000" virava 10, "12x" virava 12, e "3,5" virava os
  // itens 3 e 5.
  describe("modo número: cada pedaço precisa ser um inteiro por inteiro", () => {
    function setup(initial: number[] = []) {
      const onValueChange = vi.fn()
      const onReject = vi.fn()
      render(
        <MultiInput
          type="number"
          label="Prazos"
          value={initial}
          onValueChange={onValueChange}
          onReject={onReject}
        />,
      )
      return { input: screen.getByRole("textbox"), onValueChange, onReject }
    }

    it.each([
      ["10.000", "ponto de milhar"],
      ["3,5", "decimal com vírgula"],
      ["3.5", "decimal com ponto"],
      ["12x", "letra depois do número"],
      ["x12", "letra antes do número"],
      ["-5", "negativo"],
      ["0", "zero"],
      ["1e3", "notação científica"],
      ["99999999999999999999", "grande demais"],
    ])("%s (%s) é recusado e nada entra", async (text) => {
      const user = userEvent.setup()
      const { input, onValueChange, onReject } = setup()
      await user.type(input, `${text}{Enter}`)
      expect(onValueChange).not.toHaveBeenCalled()
      expect(onReject).toHaveBeenCalledWith("invalid")
      // O texto fica no campo para ser corrigido.
      expect(input).toHaveValue(text)
    })

    it.each([
      ["30,60,90", [30, 60, 90]],
      ["10, 20", [10, 20]],
      ["10 20", [10, 20]],
      ["10;20", [10, 20]],
      ["5/10/15", [5, 10, 15]],
      ["007", [7]],
    ])("%s é lido como lista", async (text, expected) => {
      const user = userEvent.setup()
      const { input, onValueChange, onReject } = setup()
      await user.type(input, `${text}{Enter}`)
      expect(onValueChange).toHaveBeenLastCalledWith(expected)
      expect(onReject).not.toHaveBeenCalled()
    })

    it("os pedaços válidos entram e os inválidos são recusados, sem meio-termo", async () => {
      const user = userEvent.setup()
      const { input, onValueChange, onReject } = setup()
      await user.type(input, "7 3,5 12x 9{Enter}")
      expect(onValueChange).toHaveBeenLastCalledWith([7, 9])
      expect(onReject).toHaveBeenCalledWith("invalid")
    })

    it("um decimal colado é recusado e fica no campo para ser corrigido", () => {
      const { input, onValueChange, onReject } = setup()
      fireEvent.paste(input, { clipboardData: { getData: () => "3,5" } })
      expect(onValueChange).not.toHaveBeenCalled()
      expect(onReject).toHaveBeenCalledWith("invalid")
      expect(input).toHaveValue("3,5")
    })

    it("uma lista colada entra inteira", () => {
      const { input, onValueChange } = setup()
      fireEvent.paste(input, { clipboardData: { getData: () => "30,60,90" } })
      expect(onValueChange).toHaveBeenLastCalledWith([30, 60, 90])
      expect(input).toHaveValue("")
    })
  })
  // O campo não tinha ref, name, className nem aria-required: o React Hook
  // Form não conseguia focar o campo num erro, um form nativo não recebia a
  // lista e o leitor de tela não ouvia que o campo é obrigatório.
  describe("ref, name, className e obrigatório", () => {
    it("ref aponta para o campo de texto", () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<MultiInput ref={ref} label="Tags" value={[]} onValueChange={vi.fn()} />)
      expect(ref.current).toBe(screen.getByRole("textbox", { name: "Tags" }))
    })

    it("com name, o form nativo recebe a lista separada por vírgula", () => {
      render(
        <form data-testid="form">
          <MultiInput name="tags" value={["urgente", "fiscal"]} onValueChange={vi.fn()} />
          <MultiInput name="paginas" type="number" value={[35, 10]} onValueChange={vi.fn()} />
        </form>,
      )
      const data = new FormData(screen.getByTestId("form") as HTMLFormElement)
      expect(data.get("tags")).toBe("urgente,fiscal")
      expect(data.get("paginas")).toBe("10,35")
      // Só o input oculto leva o nome; o campo de digitação, não.
      expect(screen.getAllByRole("textbox").every((el) => !el.hasAttribute("name"))).toBe(true)
    })

    it("sem name, nada vai para o form; desabilitado, a lista também não vai", () => {
      const { rerender } = render(
        <form data-testid="form">
          <MultiInput value={["a"]} onValueChange={vi.fn()} />
        </form>,
      )
      expect([...new FormData(screen.getByTestId("form") as HTMLFormElement).keys()]).toEqual([])
      rerender(
        <form data-testid="form">
          <MultiInput name="tags" disabled value={["a"]} onValueChange={vi.fn()} />
        </form>,
      )
      expect(new FormData(screen.getByTestId("form") as HTMLFormElement).get("tags")).toBeNull()
    })

    it("className vai para a caixa que desenha a borda", () => {
      render(<MultiInput className="w-64" value={[]} onValueChange={vi.fn()} />)
      expect(document.querySelector("[data-slot=multi-input]")).toHaveClass("w-64", "border")
    })

    it("required: o campo de texto é anunciado como obrigatório", () => {
      render(<MultiInput label="Tags" required value={["a"]} onValueChange={vi.fn()} />)
      expect(screen.getByRole("textbox", { name: /Tags/ })).toHaveAttribute("aria-required", "true")
    })

    it("required: um form nativo não passa com a lista vazia, e passa com um item", () => {
      const { rerender } = render(
        <form data-testid="form">
          <MultiInput label="Tags" required value={[]} onValueChange={vi.fn()} />
        </form>,
      )
      const form = screen.getByTestId("form") as HTMLFormElement
      expect(form.checkValidity()).toBe(false)
      rerender(
        <form data-testid="form">
          <MultiInput label="Tags" required value={["a"]} onValueChange={vi.fn()} />
        </form>,
      )
      expect(form.checkValidity()).toBe(true)
    })
  })
  // Os itens de um campo desabilitado ficavam a 50% sem nada dizer que o
  // grupo estava inativo: o leitor de tela não ouvia, e o axe cobrava deles
  // o contraste de texto ativo.
  it("desabilitado, o grupo é anunciado como desabilitado", () => {
    const { rerender } = render(
      <MultiInput label="Áreas" disabled value={["civil"]} onValueChange={vi.fn()} />,
    )
    expect(screen.getByRole("group", { name: "Áreas" })).toHaveAttribute("aria-disabled", "true")
    rerender(<MultiInput label="Áreas" value={["civil"]} onValueChange={vi.fn()} />)
    expect(screen.getByRole("group", { name: "Áreas" })).not.toHaveAttribute("aria-disabled")
  })
  // "Adicione um item", "Lista de itens" e "Remover …" eram texto fixo: um
  // produto não conseguia ajustar a cópia.
  describe("labels", () => {
    it("os textos padrão são os de defaultMultiInputLabels", () => {
      render(<MultiInput value={["a"]} onValueChange={vi.fn()} />)
      expect(screen.getByRole("group", { name: defaultMultiInputLabels.list })).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: defaultMultiInputLabels.remove("a") }),
      ).toBeInTheDocument()
      expect(defaultMultiInputLabels.placeholder).toBe("Adicione um item")
    })

    it("cada texto pode ser trocado, nos dois modos", () => {
      const labels = {
        placeholder: "Add a tag",
        numberPlaceholder: "Add a number",
        list: "Tag list",
        numberList: "Number list",
        remove: (item: string) => `Remove ${item}`,
      }
      const { rerender } = render(<MultiInput value={[]} onValueChange={vi.fn()} labels={labels} />)
      expect(screen.getByPlaceholderText("Add a tag")).toBeInTheDocument()
      expect(screen.getByRole("group", { name: "Tag list" })).toBeInTheDocument()
      rerender(<MultiInput type="number" value={[7]} onValueChange={vi.fn()} labels={labels} />)
      expect(screen.getByRole("group", { name: "Number list" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Remove 7" })).toBeInTheDocument()
      rerender(<MultiInput type="number" value={[]} onValueChange={vi.fn()} labels={labels} />)
      expect(screen.getByPlaceholderText("Add a number")).toBeInTheDocument()
    })

    it("placeholder e aria-label explícitos ganham de labels", () => {
      render(
        <MultiInput
          value={[]}
          onValueChange={vi.fn()}
          placeholder="E-mail"
          aria-label="Contatos"
          labels={{ placeholder: "Add", list: "List" }}
        />,
      )
      expect(screen.getByPlaceholderText("E-mail")).toBeInTheDocument()
      expect(screen.getByRole("group", { name: "Contatos" })).toBeInTheDocument()
    })
  })
})
