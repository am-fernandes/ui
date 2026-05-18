import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { MultiNumberInput } from "./multi-number-input"

describe("MultiNumberInput", () => {
  it("renders one badge per value", () => {
    render(<MultiNumberInput value={[10, 20]} onValueChange={vi.fn()} />)
    expect(screen.getByText("10")).toBeInTheDocument()
    expect(screen.getByText("20")).toBeInTheDocument()
  })

  it("renders placeholder when empty", () => {
    render(<MultiNumberInput value={[]} onValueChange={vi.fn()} placeholder="Add" />)
    expect(screen.getByPlaceholderText("Add")).toBeInTheDocument()
  })
})
