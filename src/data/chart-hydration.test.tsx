import { act } from "@testing-library/react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { BarChart } from "./bar-chart"
import { LineChart } from "./line-chart"

const measureText = vi.fn((text: string) => ({ width: text.length * 12 }))

const data = [
  { month: "janeiro", done: 1200000 },
  { month: "fevereiro", done: 3400000 },
]
const series = [{ key: "done", label: "Realizado" }]

const charts = [
  ["BarChart", <BarChart key="bar" title="Vendas" category="month" series={series} data={data} />],
  ["LineChart", <LineChart key="line" title="Vendas" x="month" series={series} data={data} />],
] as const

describe("charts (hydration)", () => {
  let container: HTMLDivElement

  beforeEach(() => {
    measureText.mockClear()
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue("browser")
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      measureText,
    } as unknown as ReturnType<HTMLCanvasElement["getContext"]>)
    container = document.createElement("div")
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
    vi.restoreAllMocks()
  })

  it.each(charts)("%s mede com o canvas só depois de hidratar", async (_, chart) => {
    container.innerHTML = renderToString(chart)
    expect(measureText).not.toHaveBeenCalled()

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    const recoverable = vi.fn()
    await act(async () => {
      hydrateRoot(container, chart, { onRecoverableError: recoverable })
    })

    expect(recoverable).not.toHaveBeenCalled()
    expect(consoleError.mock.calls.filter((call) => /hydrat/i.test(String(call[0])))).toEqual([])
    expect(measureText).toHaveBeenCalled()
  })
})
