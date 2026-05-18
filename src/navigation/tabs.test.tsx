import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Tabs } from "./tabs"

describe("Tabs", () => {
  it("renders labels and swaps content on click", async () => {
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

    await userEvent.click(screen.getByRole("tab", { name: "Tab B" }))
    expect(screen.getByText("Content B")).toBeInTheDocument()
  })

  it("supports keyboard arrow navigation between triggers", async () => {
    render(
      <Tabs
        defaultValue="a"
        items={[
          { value: "a", label: "A", content: "AC" },
          { value: "b", label: "B", content: "BC" },
          { value: "c", label: "C", content: "CC" },
        ]}
      />,
    )

    const a = screen.getByRole("tab", { name: "A" })
    a.focus()
    expect(a).toHaveFocus()

    await userEvent.keyboard("{ArrowRight}")
    expect(screen.getByRole("tab", { name: "B" })).toHaveFocus()

    await userEvent.keyboard("{ArrowRight}")
    expect(screen.getByRole("tab", { name: "C" })).toHaveFocus()
  })

  it("disabled tab is not selectable", async () => {
    render(
      <Tabs
        defaultValue="a"
        items={[
          { value: "a", label: "A", content: "AC" },
          { value: "b", label: "B", content: "BC", disabled: true },
        ]}
      />,
    )

    const disabled = screen.getByRole("tab", { name: "B" })
    expect(disabled).toBeDisabled()

    // Clicking a disabled tab must not switch content.
    await userEvent.click(disabled)
    expect(screen.getByText("AC")).toBeInTheDocument()
  })

  it("controlled — calls onValueChange with the new value", async () => {
    const onValueChange = vi.fn()
    render(
      <Tabs
        value="a"
        onValueChange={onValueChange}
        items={[
          { value: "a", label: "A", content: "AC" },
          { value: "b", label: "B", content: "BC" },
        ]}
      />,
    )

    await userEvent.click(screen.getByRole("tab", { name: "B" }))
    expect(onValueChange).toHaveBeenCalledWith("b")
  })

  it('orientation="vertical" applies vertical-specific classes', () => {
    const { container } = render(
      <Tabs
        defaultValue="a"
        orientation="vertical"
        items={[
          { value: "a", label: "A", content: "AC" },
          { value: "b", label: "B", content: "BC" },
        ]}
      />,
    )

    const root = container.querySelector('[data-slot="tabs"]')
    expect(root).toBeTruthy()
    // Root should arrange list + content side-by-side
    expect(root?.className).toMatch(/flex/)

    const list = container.querySelector('[data-slot="tabs-list"]')
    expect(list).toBeTruthy()
    expect(list?.className).toMatch(/flex-col/)
  })

  it('orientation="horizontal" (default) does not add flex-col on list', () => {
    const { container } = render(
      <Tabs
        defaultValue="a"
        items={[
          { value: "a", label: "A", content: "AC" },
          { value: "b", label: "B", content: "BC" },
        ]}
      />,
    )
    const list = container.querySelector('[data-slot="tabs-list"]')
    expect(list?.className).not.toMatch(/flex-col/)
  })
})
