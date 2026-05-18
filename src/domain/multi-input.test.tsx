import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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
})
