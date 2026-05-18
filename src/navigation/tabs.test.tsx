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
    expect(list?.getAttribute("aria-orientation")).toBe("vertical")
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

  it("renders a badge on the trigger when provided", () => {
    const { container } = render(
      <Tabs
        defaultValue="inbox"
        items={[
          {
            value: "inbox",
            label: "Inbox",
            badge: <span data-testid="badge-12">12</span>,
            content: "Inbox content",
          },
          { value: "archive", label: "Archive", content: "Archive content" },
        ]}
      />,
    )
    expect(screen.getByTestId("badge-12")).toBeInTheDocument()
    expect(container.querySelector('[data-slot="tabs-badge"]')).toBeTruthy()
    // The trigger accessible name includes both label and badge content.
    expect(screen.getByRole("tab", { name: /Inbox/ })).toBeInTheDocument()
  })

  it("lazy mounts only the active panel; switching mounts the new panel", async () => {
    const { container } = render(
      <Tabs
        lazy
        defaultValue="a"
        items={[
          {
            value: "a",
            label: "A",
            content: <div data-testid="panel-a">PA</div>,
          },
          {
            value: "b",
            label: "B",
            content: <div data-testid="panel-b">PB</div>,
          },
          {
            value: "c",
            label: "C",
            content: <div data-testid="panel-c">PC</div>,
          },
        ]}
      />,
    )

    // Only the active panel is mounted in the DOM.
    expect(container.querySelector('[data-testid="panel-a"]')).toBeTruthy()
    expect(container.querySelector('[data-testid="panel-b"]')).toBeNull()
    expect(container.querySelector('[data-testid="panel-c"]')).toBeNull()
    // There should be exactly one rendered tabpanel.
    expect(container.querySelectorAll('[data-slot="tabs-content"]')).toHaveLength(1)

    await userEvent.click(screen.getByRole("tab", { name: "B" }))

    expect(container.querySelector('[data-testid="panel-b"]')).toBeTruthy()
    expect(container.querySelector('[data-testid="panel-a"]')).toBeNull()
    expect(container.querySelector('[data-testid="panel-c"]')).toBeNull()
  })

  it("non-lazy (default) mounts all panels", () => {
    const { container } = render(
      <Tabs
        defaultValue="a"
        items={[
          { value: "a", label: "A", content: <div data-testid="panel-a">PA</div> },
          { value: "b", label: "B", content: <div data-testid="panel-b">PB</div> },
        ]}
      />,
    )
    // Both panels are in the DOM (just one visible).
    expect(container.querySelectorAll('[data-slot="tabs-content"]')).toHaveLength(2)
  })
})
