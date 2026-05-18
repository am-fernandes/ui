import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { RadioGroup, RadioGroupItem } from "./radio-group"

describe("RadioGroup", () => {
  it("renders all items with role=radio", () => {
    render(
      <RadioGroup defaultValue="a">
        <RadioGroupItem value="a" id="a" />
        <RadioGroupItem value="b" id="b" />
      </RadioGroup>,
    )
    const radios = screen.getAllByRole("radio")
    expect(radios).toHaveLength(2)
  })

  it("default orientation is vertical (grid layout)", () => {
    render(
      <RadioGroup defaultValue="a" data-testid="group">
        <RadioGroupItem value="a" id="a" />
      </RadioGroup>,
    )
    const group = screen.getByTestId("group")
    expect(group).toHaveAttribute("aria-orientation", "vertical")
    expect(group).toHaveClass("grid")
  })

  it("horizontal orientation uses flex layout", () => {
    render(
      <RadioGroup defaultValue="a" orientation="horizontal" data-testid="group">
        <RadioGroupItem value="a" id="a" />
        <RadioGroupItem value="b" id="b" />
      </RadioGroup>,
    )
    const group = screen.getByTestId("group")
    expect(group).toHaveAttribute("aria-orientation", "horizontal")
    expect(group).toHaveClass("flex")
  })

  it("supports controlled value + onValueChange", async () => {
    function Controlled() {
      const [value, setValue] = useState("a")
      return (
        <RadioGroup value={value} onValueChange={setValue} data-testid="group">
          <RadioGroupItem value="a" id="a" aria-label="A" />
          <RadioGroupItem value="b" id="b" aria-label="B" />
        </RadioGroup>
      )
    }
    render(<Controlled />)
    const a = screen.getByRole("radio", { name: "A" })
    const b = screen.getByRole("radio", { name: "B" })
    expect(a).toHaveAttribute("aria-checked", "true")
    expect(b).toHaveAttribute("aria-checked", "false")
    await userEvent.click(b)
    expect(a).toHaveAttribute("aria-checked", "false")
    expect(b).toHaveAttribute("aria-checked", "true")
  })

  it("fires onValueChange", async () => {
    const onValueChange = vi.fn()
    render(
      <RadioGroup defaultValue="a" onValueChange={onValueChange}>
        <RadioGroupItem value="a" id="a" aria-label="A" />
        <RadioGroupItem value="b" id="b" aria-label="B" />
      </RadioGroup>,
    )
    await userEvent.click(screen.getByRole("radio", { name: "B" }))
    expect(onValueChange).toHaveBeenCalledWith("b")
  })

  it("disabled group blocks all items", async () => {
    const onValueChange = vi.fn()
    render(
      <RadioGroup defaultValue="a" disabled onValueChange={onValueChange}>
        <RadioGroupItem value="a" id="a" aria-label="A" />
        <RadioGroupItem value="b" id="b" aria-label="B" />
      </RadioGroup>,
    )
    await userEvent.click(screen.getByRole("radio", { name: "B" }))
    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.getByRole("radio", { name: "A" })).toBeDisabled()
    expect(screen.getByRole("radio", { name: "B" })).toBeDisabled()
  })

  it("renders indicator on selected item only", () => {
    const { container } = render(
      <RadioGroup defaultValue="a">
        <RadioGroupItem value="a" id="a" />
        <RadioGroupItem value="b" id="b" />
      </RadioGroup>,
    )
    const indicators = container.querySelectorAll('[data-slot="radio-group-indicator"]')
    // Radix only mounts the Indicator when its parent item is checked.
    expect(indicators).toHaveLength(1)
  })
})
