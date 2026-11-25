import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { LineChart } from "./line-chart"

const data = [
  { mes: "2026-01", bosque: 8, torre: 4 },
  { mes: "2026-02", bosque: 7, torre: null },
  { mes: "2026-03", bosque: 10, torre: 5 },
  { mes: "2026-04", bosque: 9, torre: 6 },
]
const series = [
  { key: "bosque", label: "Residencial Bosque" },
  { key: "torre", label: "Torre Norte" },
]

describe("LineChart", () => {
  it("is named by its title and labels ISO months on the x axis", () => {
    const { container } = render(<LineChart title="Vendas" data={data} x="mes" series={series} />)
    expect(screen.getByRole("img", { name: "Vendas" })).toBeInTheDocument()
    const xs = [...container.querySelectorAll('[data-slot="line-chart-x"]')].map(
      (t) => t.textContent,
    )
    expect(xs).toEqual(["jan.", "fev.", "mar.", "abr."])
  })

  it("breaks the line at a missing point instead of drawing it as zero", () => {
    const { container } = render(<LineChart title="Vendas" data={data} x="mes" series={series} />)
    const torre = container.querySelector('[data-series="torre"]') as SVGGElement
    // Jan alone, then Mar–Apr: one dot for the lone point and one line.
    expect(torre.querySelectorAll('[data-slot="line-chart-line"]')).toHaveLength(1)
    expect(torre.querySelectorAll("circle:not([data-slot])")).toHaveLength(1)
    const bosque = container.querySelector('[data-series="bosque"]') as SVGGElement
    expect(bosque.querySelectorAll('[data-slot="line-chart-line"]')).toHaveLength(1)
  })

  it("colours each series in order, lines 2px", () => {
    const { container } = render(<LineChart title="Vendas" data={data} x="mes" series={series} />)
    const lines = [...container.querySelectorAll('[data-slot="line-chart-line"]')]
    expect(lines[0]).toHaveClass("stroke-chart-1")
    expect(lines[0]).toHaveAttribute("stroke-width", "2")
    expect(lines[1]).toHaveClass("stroke-chart-2")
  })

  it("fills the area only under a single visible series", async () => {
    const { container, rerender } = render(
      <LineChart title="Vendas" data={data} x="mes" series={series} area />,
    )
    expect(container.querySelector('[data-slot="line-chart-area"]')).toBeNull()
    rerender(<LineChart title="Vendas" data={data} x="mes" series={series.slice(0, 1)} area />)
    const fill = container.querySelector('[data-slot="line-chart-area"]')
    expect(fill).toHaveAttribute("fill-opacity", "0.1")
    // Hiding the other series from the legend has the same effect.
    rerender(<LineChart title="Vendas" data={data} x="mes" series={series} area />)
    await userEvent.click(screen.getByRole("button", { name: "Torre Norte" }))
    expect(container.querySelector('[data-slot="line-chart-area"]')).not.toBeNull()
  })

  it("names the ends of up to four series directly, when the chart is wide", () => {
    const { container } = render(<LineChart title="Vendas" data={data} x="mes" series={series} />)
    // jsdom measures nothing: the chart keeps its 640px default width.
    const names = [...container.querySelectorAll('[data-slot="line-chart-label"]')].map(
      (t) => t.textContent,
    )
    expect(names).toEqual(["Residencial Bosque", "Torre Norte"])
  })

  it("does not name a single series at its end (the title says it) and has no legend", () => {
    const { container } = render(
      <LineChart title="Vendas" data={data} x="mes" series={series.slice(0, 1)} />,
    )
    expect(container.querySelector('[data-slot="line-chart-label"]')).toBeNull()
    expect(screen.queryByRole("list", { name: "Séries" })).toBeNull()
  })

  it("leaves names to the legend when line ends would collide", () => {
    const close = data.map((d) => ({ ...d, torre: d.bosque }))
    const { container } = render(<LineChart title="Vendas" data={close} x="mes" series={series} />)
    expect(container.querySelector('[data-slot="line-chart-label"]')).toBeNull()
    expect(screen.getByRole("list", { name: "Séries" })).toBeInTheDocument()
  })

  it("moves the crosshair with the arrows, lists every series and announces it", () => {
    const { container } = render(<LineChart title="Vendas" data={data} x="mes" series={series} />)
    const chart = screen.getByRole("img", { name: "Vendas" })
    fireEvent.keyDown(chart, { key: "ArrowRight" })
    fireEvent.keyDown(chart, { key: "ArrowRight" })
    expect(container.querySelector('[data-slot="line-chart-crosshair"]')).not.toBeNull()
    const tooltip = container.querySelector('[data-slot="chart-tooltip"]') as HTMLElement
    expect(tooltip).toHaveTextContent("fev.")
    expect(tooltip).toHaveTextContent("7Residencial Bosque")
    expect(tooltip).toHaveTextContent("—Torre Norte")
    expect(container.querySelector('[data-slot="chart-announcer"]')).toHaveTextContent(
      "fev. Residencial Bosque: 7; Torre Norte: —",
    )
  })

  it("uses formatValue and formatX in the table", () => {
    render(
      <LineChart
        title="Preço do m²"
        data={data}
        x="mes"
        series={series.slice(0, 1)}
        formatValue={(v) => `R$ ${v} mil`}
        formatX={(v) => `mês ${String(v).slice(5)}`}
        labels={{ category: "Mês" }}
      />,
    )
    const rows = within(screen.getByRole("table", { name: "Preço do m²" }))
      .getAllByRole("row")
      .map((r) => r.textContent)
    expect(rows[0]).toBe("MêsResidencial Bosque")
    expect(rows[1]).toBe("mês 01R$ 8 mil")
  })
})
