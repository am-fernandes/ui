import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Tabs } from "./tabs"

describe("Tabs", () => {
  it("renders labels and first content via items API", () => {
    render(
      <Tabs
        defaultValue="a"
        items={[
          { value: "a", label: "Tab A", content: "Content A" },
          { value: "b", label: "Tab B", content: "Content B" },
        ]}
      />,
    )
    expect(screen.getByRole("tab", { name: "Tab A" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Tab B" })).toBeInTheDocument()
    expect(screen.getByText("Content A")).toBeInTheDocument()
  })

  it("swaps content on tab click", async () => {
    render(
      <Tabs
        defaultValue="a"
        items={[
          { value: "a", label: "Tab A", content: "Content A" },
          { value: "b", label: "Tab B", content: "Content B" },
        ]}
      />,
    )
    await userEvent.click(screen.getByRole("tab", { name: "Tab B" }))
    expect(screen.getByText("Content B")).toBeInTheDocument()
  })
})
