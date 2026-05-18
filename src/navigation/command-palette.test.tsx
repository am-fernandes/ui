import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CommandPalette } from "./command-palette"

describe("CommandPalette", () => {
  it("renders groups and items when open", () => {
    render(
      <CommandPalette
        open
        title="Comandos"
        groups={[{ heading: "Geral", items: [{ label: "Dashboard", onSelect: () => {} }] }]}
      />,
    )
    expect(screen.getByText("Geral")).toBeInTheDocument()
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
  })

  it("fires onSelect on item click", async () => {
    const onSelect = vi.fn()
    render(
      <CommandPalette open title="X" groups={[{ items: [{ label: "Dashboard", onSelect }] }]} />,
    )
    await userEvent.click(screen.getByText("Dashboard"))
    expect(onSelect).toHaveBeenCalled()
  })

  it("renders shortcut hint when provided", () => {
    render(
      <CommandPalette
        open
        title="X"
        groups={[{ items: [{ label: "Save", shortcut: "⌘S", onSelect: () => {} }] }]}
      />,
    )
    expect(screen.getByText("⌘S")).toBeInTheDocument()
  })

  it("supports custom item.render", () => {
    render(
      <CommandPalette
        open
        title="X"
        groups={[
          {
            items: [{ render: <span data-testid="custom">Custom row</span>, onSelect: () => {} }],
          },
        ]}
      />,
    )
    expect(screen.getByTestId("custom")).toBeInTheDocument()
  })
})
