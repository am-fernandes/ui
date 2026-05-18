import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

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
})
