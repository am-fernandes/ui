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

  it("selects the first tab when neither value nor defaultValue is given", () => {
    render(
      <Tabs
        items={[
          { value: "a", label: "A", content: "Painel A" },
          { value: "b", label: "B", content: "Painel B" },
        ]}
      />,
    )
    expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Painel A")
  })

  it("skips a disabled first tab", () => {
    render(
      <Tabs
        items={[
          { value: "a", label: "A", content: "Painel A", disabled: true },
          { value: "b", label: "B", content: "Painel B" },
        ]}
      />,
    )
    expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Painel B")
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

  it("by default renders only the active panel's content", async () => {
    render(
      <Tabs
        defaultValue="a"
        items={[
          { value: "a", label: "A", content: <div data-testid="panel-a">PA</div> },
          { value: "b", label: "B", content: <div data-testid="panel-b">PB</div> },
        ]}
      />,
    )
    expect(screen.getByTestId("panel-a")).toBeInTheDocument()
    expect(screen.queryByTestId("panel-b")).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("tab", { name: "B" }))
    expect(screen.queryByTestId("panel-a")).not.toBeInTheDocument()
  })

  describe("tab list wider than its container", () => {
    const many = Array.from({ length: 8 }, (_, i) => ({
      value: `t${i}`,
      label: `Aba ${i + 1}`,
      content: `Painel ${i + 1}`,
    }))

    it("scrolls sideways instead of spilling out", () => {
      const { container } = render(<Tabs items={many} />)
      const list = container.querySelector('[data-slot="tabs-list"]') as HTMLElement
      expect(list).toHaveClass("overflow-x-auto", "max-w-full")
      for (const tab of screen.getAllByRole("tab")) expect(tab).toHaveClass("shrink-0")
    })

    it("scrolls the active tab into view, without scrolling the page", async () => {
      const { container } = render(<Tabs items={many} />)
      const list = container.querySelector('[data-slot="tabs-list"]') as HTMLElement
      // jsdom does no layout: a 200px list with 100px tabs side by side.
      Object.defineProperty(list, "clientWidth", { configurable: true, value: 200 })
      screen.getAllByRole("tab").forEach((tab, i) => {
        Object.defineProperty(tab, "offsetLeft", { configurable: true, value: i * 100 })
        Object.defineProperty(tab, "offsetWidth", { configurable: true, value: 100 })
      })
      const scrollIntoView = vi.fn()
      Element.prototype.scrollIntoView = scrollIntoView
      screen.getAllByRole("tab")[0]!.focus()
      await userEvent.keyboard("{End}")
      expect(screen.getByRole("tab", { name: "Aba 8" })).toHaveAttribute("aria-selected", "true")
      // Its right edge (800px) lines up with the list's (200px wide).
      expect(list.scrollLeft).toBe(600)
      await userEvent.keyboard("{Home}")
      expect(list.scrollLeft).toBe(0)
      expect(scrollIntoView).not.toHaveBeenCalled()
    })
  })

  describe("keepMounted", () => {
    const formItems = [
      { value: "a", label: "Dados", content: <input aria-label="Nome" /> },
      { value: "b", label: "Endereço", content: <input aria-label="CEP" /> },
    ]

    it("keeps every panel in the DOM, hidden while inactive", () => {
      render(<Tabs keepMounted defaultValue="a" items={formItems} />)
      expect(screen.getByRole("textbox", { name: "Nome" })).toBeVisible()
      const cep = screen.getByLabelText("CEP")
      expect(cep).toBeInTheDocument()
      expect(cep).not.toBeVisible()
      expect(cep.closest('[role="tabpanel"]')).toHaveAttribute("hidden")
    })

    it("keeps what was typed in an uncontrolled field across tab switches", async () => {
      render(<Tabs keepMounted defaultValue="a" items={formItems} />)
      await userEvent.type(screen.getByRole("textbox", { name: "Nome" }), "Maria")
      await userEvent.click(screen.getByRole("tab", { name: "Endereço" }))
      expect(screen.getByRole("textbox", { name: "CEP" })).toBeVisible()
      await userEvent.click(screen.getByRole("tab", { name: "Dados" }))
      expect(screen.getByRole("textbox", { name: "Nome" })).toHaveValue("Maria")
    })

    it("with lazy, mounts a panel on its first visit and keeps it", async () => {
      render(<Tabs keepMounted lazy defaultValue="a" items={formItems} />)
      expect(screen.queryByLabelText("CEP")).not.toBeInTheDocument()
      await userEvent.click(screen.getByRole("tab", { name: "Endereço" }))
      await userEvent.type(screen.getByRole("textbox", { name: "CEP" }), "01310")
      await userEvent.click(screen.getByRole("tab", { name: "Dados" }))
      expect(screen.getByLabelText("CEP")).not.toBeVisible()
      await userEvent.click(screen.getByRole("tab", { name: "Endereço" }))
      expect(screen.getByRole("textbox", { name: "CEP" })).toHaveValue("01310")
    })
  })
})
