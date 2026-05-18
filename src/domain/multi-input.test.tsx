import { render, screen } from "@testing-library/react"
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
})
