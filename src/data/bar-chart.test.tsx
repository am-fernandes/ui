import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { BarChart } from "./bar-chart"

const data = [
  { trimestre: "1º tri", bosque: 42, torre: 31, vila: 18 },
  { trimestre: "2º tri", bosque: 38, torre: 36, vila: null },
  { trimestre: "3º tri", bosque: 45, torre: -5, vila: 30 },
]
const series = [
  { key: "bosque", label: "Residencial Bosque" },
  { key: "torre", label: "Torre Norte" },
  { key: "vila", label: "Vila Jardim" },
]

const fills = (container: HTMLElement, key: string) =>
  [...container.querySelectorAll(`[data-slot="bar-chart-bar"][data-series="${key}"]`)].map(
    (bar) => bar.getAttribute("class")?.match(/fill-chart-\d/)?.[0],
  )

describe("BarChart", () => {
  it("is named by its title and described by its description and the keyboard hint", () => {
    render(
      <BarChart
        title="Vendas por trimestre"
        description="Unidades."
        data={data}
        category="trimestre"
        series={series}
      />,
    )
    const chart = screen.getByRole("img", { name: "Vendas por trimestre" })
    expect(chart).toHaveAccessibleDescription("Unidades. Use as setas para percorrer os valores.")
    expect(screen.getByRole("figure", { name: "Vendas por trimestre" })).toBeInTheDocument()
  })

  it("draws one bar per value, in the series colours in order, skipping missing values", () => {
    const { container } = render(
      <BarChart title="Vendas" data={data} category="trimestre" series={series} />,
    )
    expect(fills(container, "bosque")).toEqual(["fill-chart-1", "fill-chart-1", "fill-chart-1"])
    expect(fills(container, "torre")).toEqual(["fill-chart-2", "fill-chart-2", "fill-chart-2"])
    expect(fills(container, "vila")).toEqual(["fill-chart-3", "fill-chart-3"])
  })

  it("shows a legend for two or more series, none for one", () => {
    const { rerender } = render(
      <BarChart title="Vendas" data={data} category="trimestre" series={series} />,
    )
    const legend = screen.getByRole("list", { name: "Séries" })
    expect(
      within(legend)
        .getAllByRole("button")
        .map((b) => b.textContent),
    ).toEqual(["Residencial Bosque", "Torre Norte", "Vila Jardim"])
    rerender(
      <BarChart
        title="Vendas"
        data={data}
        category="trimestre"
        series={[series[0] as (typeof series)[0]]}
      />,
    )
    expect(screen.queryByRole("list", { name: "Séries" })).toBeNull()
  })

  it("hides a series from the legend without repainting the others", async () => {
    const { container } = render(
      <BarChart title="Vendas" data={data} category="trimestre" series={series} />,
    )
    const torre = screen.getByRole("button", { name: "Torre Norte" })
    expect(torre).toHaveAttribute("aria-pressed", "true")
    await userEvent.click(torre)
    expect(torre).toHaveAttribute("aria-pressed", "false")
    expect(fills(container, "torre")).toEqual([])
    expect(fills(container, "vila")).toEqual(["fill-chart-3", "fill-chart-3"])
    // The table follows the visible series.
    expect(screen.getAllByRole("columnheader").map((h) => h.textContent)).toEqual([
      "Categoria",
      "Residencial Bosque",
      "Vila Jardim",
    ])
  })

  it("keeps the last visible series on screen", async () => {
    render(<BarChart title="Vendas" data={data} category="trimestre" series={series.slice(0, 2)} />)
    await userEvent.click(screen.getByRole("button", { name: "Residencial Bosque" }))
    expect(screen.getByRole("button", { name: "Torre Norte" })).toBeDisabled()
  })

  it("keeps a pinned colour when another series is removed", () => {
    const { container } = render(
      <BarChart
        title="Vendas"
        data={data}
        category="trimestre"
        series={[series[0] as (typeof series)[0], { key: "vila", label: "Vila Jardim", color: 3 }]}
      />,
    )
    expect(fills(container, "vila")).toEqual(["fill-chart-3", "fill-chart-3"])
  })

  it("stops a seventh series with a message about grouping into Outros", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const seven = Array.from({ length: 7 }, (_, i) => ({ key: `s${i}`, label: `Série ${i}` }))
    expect(() =>
      render(<BarChart title="Vendas" data={data} category="trimestre" series={seven} />),
    ).toThrow(/7 series; the most is 6.*"Outros"/)
    error.mockRestore()
  })

  it("has the numbers as a table, hidden from view unless showTable", () => {
    const { container, rerender } = render(
      <BarChart
        title="Vendas"
        data={data}
        category="trimestre"
        series={series}
        formatValue={(v) => `${v} un.`}
        labels={{ category: "Trimestre" }}
      />,
    )
    const table = screen.getByRole("table", { name: "Vendas" })
    expect(container.querySelector('[data-slot="chart-table"]')).toHaveClass("sr-only")
    const rows = within(table)
      .getAllByRole("row")
      .map((row) => row.textContent)
    expect(rows).toEqual([
      "TrimestreResidencial BosqueTorre NorteVila Jardim",
      "1º tri42 un.31 un.18 un.",
      "2º tri38 un.36 un.—",
      "3º tri45 un.-5 un.30 un.",
    ])
    rerender(<BarChart title="Vendas" data={data} category="trimestre" series={series} showTable />)
    expect(container.querySelector('[data-slot="chart-table"]')).not.toHaveClass("sr-only")
  })

  it("moves through the categories with the arrows and announces each one", () => {
    const { container } = render(
      <BarChart title="Vendas" data={data} category="trimestre" series={series} />,
    )
    const chart = screen.getByRole("img", { name: "Vendas" })
    fireEvent.keyDown(chart, { key: "ArrowRight" })
    const announcer = container.querySelector('[data-slot="chart-announcer"]') as HTMLElement
    expect(announcer).toHaveTextContent(
      "1º tri. Residencial Bosque: 42; Torre Norte: 31; Vila Jardim: 18",
    )
    fireEvent.keyDown(chart, { key: "End" })
    expect(announcer).toHaveTextContent("3º tri. Residencial Bosque: 45; Torre Norte: -5")
    expect(container.querySelector('[data-slot="chart-tooltip"]')).toHaveTextContent("3º tri")
    fireEvent.keyDown(chart, { key: "Escape" })
    expect(container.querySelector('[data-slot="chart-tooltip"]')).toBeNull()
  })

  it("draws negative bars down from the zero line, rounded at their data end", () => {
    const { container } = render(
      <BarChart title="Saldo" data={data} category="trimestre" series={series} />,
    )
    const negative = container.querySelector(
      '[data-series="torre"][data-category="3º tri"]',
    ) as SVGPathElement
    // The rounded corner is at the bottom (the data end): the path's arcs
    // come after the vertical run down from the zero line.
    expect(negative.getAttribute("d")).toMatch(/^M[\d.]+,[\d.]+V[\d.]+A4,4/)
  })

  it("stacks with a 2px gap and rounds only the outermost segment", () => {
    const { container } = render(
      <BarChart
        title="Vendas"
        data={data.slice(0, 1)}
        category="trimestre"
        series={series}
        stacked
      />,
    )
    const ds = [...container.querySelectorAll('[data-slot="bar-chart-bar"]')].map((p) =>
      p.getAttribute("d"),
    )
    expect(ds[0]).not.toContain("A")
    expect(ds[1]).not.toContain("A")
    expect(ds[2]).toContain("A")
  })

  it("shows the empty message, or a loading state, instead of the plot", () => {
    const { rerender } = render(
      <BarChart
        title="Vendas"
        data={[]}
        category="trimestre"
        series={series}
        emptyMessage="Nenhuma venda."
      />,
    )
    expect(screen.getByText("Nenhuma venda.")).toBeInTheDocument()
    expect(screen.queryByRole("img")).toBeNull()
    rerender(<BarChart title="Vendas" data={data} category="trimestre" series={series} loading />)
    expect(screen.getByRole("figure")).toHaveAttribute("aria-busy", "true")
    expect(screen.getByText("Carregando gráfico…")).toBeInTheDocument()
  })

  it("cuts long category names and keeps the full text", () => {
    const { container } = render(
      <BarChart
        title="Leads"
        orientation="horizontal"
        data={[{ canal: "Portais imobiliários (Zap, Viva Real, OLX)", leads: 10 }]}
        category="canal"
        series={[{ key: "leads", label: "Leads" }]}
      />,
    )
    const label = container.querySelector('[data-slot="bar-chart-category"]') as SVGTextElement
    expect(label.textContent).toMatch(/…$/)
    expect(label.querySelector("title")).toHaveTextContent(
      "Portais imobiliários (Zap, Viva Real, OLX)",
    )
  })
})

describe("BarChart: a hidden series left alone", () => {
  it("comes back instead of leaving an empty chart, and can be hidden again", async () => {
    const chart = (shown: typeof series) => (
      <BarChart title="Vendas" data={data} category="trimestre" series={shown} />
    )
    const two = series.slice(0, 2)
    const { container, rerender } = render(chart(two))
    await userEvent.click(screen.getByRole("button", { name: "Torre Norte" }))
    rerender(chart(two.slice(1)))
    expect(container.querySelector('[data-series="torre"]')).not.toBeNull()
    rerender(chart(two))
    expect(screen.getByRole("button", { name: "Torre Norte" })).toHaveAttribute(
      "aria-pressed",
      "false",
    )
  })
})
