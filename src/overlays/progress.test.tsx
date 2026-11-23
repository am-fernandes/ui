import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Progress } from "./progress"

describe("Progress", () => {
  it("renders with progressbar role", () => {
    render(<Progress value={60} />)
    expect(screen.getByRole("progressbar")).toBeInTheDocument()
  })

  it("accepts value=0", () => {
    render(<Progress value={0} />)
    expect(screen.getByRole("progressbar")).toBeInTheDocument()
  })

  it("accepts value=100", () => {
    render(<Progress value={100} />)
    expect(screen.getByRole("progressbar")).toBeInTheDocument()
  })

  it("sets transform translateX(-40%) for value=60", () => {
    render(<Progress value={60} data-testid="progress" />)
    const indicator = screen
      .getByTestId("progress")
      .querySelector('[data-slot="progress-indicator"]')
    expect(indicator).not.toBeNull()
    expect(indicator).toHaveStyle({ transform: "translateX(-40%)" })
  })

  it("sets aria-valuenow", () => {
    render(<Progress value={42} />)
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "42")
  })

  it("clamps values above 100", () => {
    render(<Progress value={150} data-testid="progress" />)
    const indicator = screen
      .getByTestId("progress")
      .querySelector('[data-slot="progress-indicator"]')
    expect(indicator).toHaveStyle({ transform: "translateX(-0%)" })
  })

  it("clamps negative values to 0", () => {
    render(<Progress value={-20} data-testid="progress" />)
    const indicator = screen
      .getByTestId("progress")
      .querySelector('[data-slot="progress-indicator"]')
    expect(indicator).toHaveStyle({ transform: "translateX(-100%)" })
  })
})

// `max` was ignored (value={3} max={7} drew 3%), and value={null} became 0:
// there was no indeterminate state.
describe("Progress max and indeterminate", () => {
  const indicatorOf = () =>
    screen.getByRole("progressbar").querySelector('[data-slot="progress-indicator"]') as HTMLElement

  it("draws value / max: step 3 of 7 is 3/7 of the bar", () => {
    render(<Progress value={3} max={7} aria-label="Etapas" />)
    const bar = screen.getByRole("progressbar", { name: "Etapas" })
    expect(bar).toHaveAttribute("aria-valuenow", "3")
    expect(bar).toHaveAttribute("aria-valuemax", "7")
    const shown = 100 - Number.parseFloat(/-([\d.]+)%/.exec(indicatorOf().style.transform)![1]!)
    expect(shown).toBeCloseTo((3 / 7) * 100, 5)
  })

  it("clamps to max", () => {
    render(<Progress value={9} max={7} aria-label="Etapas" />)
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "7")
    expect(indicatorOf()).toHaveStyle({ transform: "translateX(-0%)" })
  })

  it.each([null, undefined])("value=%s is indeterminate", (value) => {
    render(<Progress value={value} aria-label="Importando" />)
    const bar = screen.getByRole("progressbar", { name: "Importando" })
    expect(bar).toHaveAttribute("data-state", "indeterminate")
    expect(bar).not.toHaveAttribute("aria-valuenow")
    expect(indicatorOf()).toHaveAttribute("data-state", "indeterminate")
    expect(indicatorOf().style.transform).toBe("")
  })

  it("value=0 is not indeterminate", () => {
    render(<Progress value={0} aria-label="Envio" />)
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0")
  })
})
