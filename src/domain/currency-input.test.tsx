import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { CurrencyInput } from "./currency-input"

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
})
