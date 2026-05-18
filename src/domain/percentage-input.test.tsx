import { fireEvent, render, screen } from "@testing-library/react"
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

  it("clamps to default max=100 when more than 100 is typed", () => {
    const onValueChange = vi.fn()
    render(<PercentageInput value={0} onValueChange={onValueChange} />)
    const input = screen.getByDisplayValue("0,00") as HTMLInputElement
    // "12000" -> 120.00 -> clamped to 100
    fireEvent.change(input, { target: { value: "12000" } })
    expect(onValueChange).toHaveBeenLastCalledWith(100)
  })

  it("respects a custom max (e.g. 200)", () => {
    const onValueChange = vi.fn()
    render(<PercentageInput value={0} onValueChange={onValueChange} max={200} />)
    const input = screen.getByDisplayValue("0,00") as HTMLInputElement
    fireEvent.change(input, { target: { value: "15050" } })
    expect(onValueChange).toHaveBeenLastCalledWith(150.5)
    fireEvent.change(input, { target: { value: "30000" } })
    expect(onValueChange).toHaveBeenLastCalledWith(200)
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
})
