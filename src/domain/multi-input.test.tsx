import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { MultiInput } from "./multi-input"

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
})
