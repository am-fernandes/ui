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

  it("renders indeterminate state when value is undefined", () => {
    render(<Progress data-testid="progress" />)
    const indicator = screen
      .getByTestId("progress")
      .querySelector('[data-slot="progress-indicator"]')
    expect(indicator).toHaveAttribute("data-state", "indeterminate")
    expect(indicator).toHaveClass("animate-pulse")
  })
})
