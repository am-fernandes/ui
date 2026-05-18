import { render } from "@testing-library/react"
import { Bar, BarChart } from "recharts"
import { describe, expect, it } from "vitest"

import { ChartContainer } from "./chart"

describe("ChartContainer", () => {
  it("mounts and renders a chart slot", () => {
    const { container } = render(
      <div style={{ width: 400, height: 300 }}>
        <ChartContainer config={{ value: { label: "Value", color: "#888" } }}>
          <BarChart data={[{ name: "a", value: 1 }]}>
            <Bar dataKey="value" />
          </BarChart>
        </ChartContainer>
      </div>,
    )
    expect(container.querySelector('[data-slot="chart"]')).toBeTruthy()
  })
})
