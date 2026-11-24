import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Sparkline } from "./sparkline"

describe("Sparkline", () => {
  it("is an image named by its label, at the size given", () => {
    render(<Sparkline data={[14, 18, 22]} label="Vendas de 14 para 22" width={120} height={32} />)
    const spark = screen.getByRole("img", { name: "Vendas de 14 para 22" })
    expect(spark).toHaveAttribute("width", "120")
    expect(spark).toHaveAttribute("height", "32")
  })

  it("draws the line in the de-emphasis colour and the latest point in the accent", () => {
    const { container } = render(<Sparkline data={[1, 3, 2, 5]} label="Tendência" />)
    expect(container.querySelector('[data-slot="sparkline-line"]')).toHaveClass(
      "stroke-muted-foreground",
    )
    const end = container.querySelector('[data-slot="sparkline-end"]') as SVGCircleElement
    expect(end).toHaveClass("fill-chart-1")
    expect(end).toHaveAttribute("r", "4")
    // The latest point is the highest here: at the top padding.
    expect(Number(end.getAttribute("cy"))).toBe(6)
    expect(Number(end.getAttribute("cx"))).toBe(90)
  })

  it("puts a flat series in the middle", () => {
    const { container } = render(<Sparkline data={[5, 5, 5]} label="Estável" height={28} />)
    expect(container.querySelector('[data-slot="sparkline-end"]')).toHaveAttribute("cy", "14")
  })

  it("breaks the line at a missing value and marks the last value there is", () => {
    const { container } = render(
      <Sparkline data={[1, 2, Number.NaN, 4, 5, Number.NaN]} label="Com falhas" />,
    )
    expect(container.querySelectorAll('[data-slot="sparkline-line"]')).toHaveLength(2)
    const end = container.querySelector('[data-slot="sparkline-end"]') as SVGCircleElement
    expect(Number(end.getAttribute("cx"))).toBeCloseTo(6 + (4 * 84) / 5)
  })

  it("has no axes, ticks or tooltip", () => {
    const { container } = render(<Sparkline data={[1, 2, 3]} label="Tendência" />)
    expect(container.querySelector("text")).toBeNull()
    expect(container.querySelector("[tabindex]")).toBeNull()
  })
})
