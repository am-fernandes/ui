import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Star } from "lucide-react"
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

  it("renders loading state when loading=true", () => {
    render(
      <CommandPalette
        open
        loading
        title="X"
        groups={[{ items: [{ label: "Dashboard", onSelect: () => {} }] }]}
      />,
    )
    expect(screen.getByText(/Carregando/)).toBeInTheDocument()
  })

  it("renders a custom emptyMessage when provided", async () => {
    render(
      <CommandPalette
        open
        title="X"
        emptyMessage={<span data-testid="custom-empty">Nada aqui</span>}
        groups={[{ items: [{ label: "Dashboard", onSelect: () => {} }] }]}
      />,
    )
    // Trigger empty state by typing a search that matches nothing.
    const input = screen.getByPlaceholderText("Buscar...")
    await userEvent.type(input, "zzzzzz")
    expect(screen.getByTestId("custom-empty")).toBeInTheDocument()
  })

  it("renders the sr-only description when description is set", () => {
    render(
      <CommandPalette
        open
        title="X"
        description="Procure por algo"
        groups={[{ items: [{ label: "Dashboard", onSelect: () => {} }] }]}
      />,
    )
    expect(screen.getByText("Procure por algo")).toBeInTheDocument()
  })

  it("renders item.icon when supplied", () => {
    const { container } = render(
      <CommandPalette
        open
        title="X"
        groups={[{ items: [{ label: "Favs", icon: Star, onSelect: () => {} }] }]}
      />,
    )
    // The icon renders as an svg inside the row.
    const row = screen.getByText("Favs").closest("[role='option']") as HTMLElement | null
    // cmdk uses role="option" or treats items differently; either way the svg
    // should be inside the item container.
    const svg = (row ?? container).querySelector("svg")
    expect(svg).toBeTruthy()
  })

  it("does not invoke onSelect when item is disabled", async () => {
    const onSelect = vi.fn()
    render(
      <CommandPalette
        open
        title="X"
        groups={[{ items: [{ label: "Salvar", disabled: true, onSelect }] }]}
      />,
    )
    await userEvent.click(screen.getByText("Salvar"))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it("uses pt-BR labels by default", () => {
    render(
      <CommandPalette
        open
        title="X"
        loading
        groups={[{ items: [{ label: "Dashboard", onSelect: () => {} }] }]}
      />,
    )
    expect(screen.getByPlaceholderText("Buscar...")).toBeInTheDocument()
    expect(screen.getByText("Carregando…")).toBeInTheDocument()
  })

  it("overrides labels via the labels prop (en-US sample)", async () => {
    render(
      <CommandPalette
        open
        title="X"
        labels={{
          placeholder: "Search...",
          emptyMessage: "No results",
          loading: "Loading…",
        }}
        groups={[{ items: [{ label: "Dashboard", onSelect: () => {} }] }]}
      />,
    )
    const input = screen.getByPlaceholderText("Search...")
    await userEvent.type(input, "zzzzzz")
    expect(screen.getByText("No results")).toBeInTheDocument()
  })

  it("finds an item via custom keywords search", async () => {
    render(
      <CommandPalette
        open
        title="X"
        groups={[
          {
            items: [
              { label: "Save File", keywords: ["disk", "storage"], onSelect: () => {} },
              { label: "Print", onSelect: () => {} },
            ],
          },
        ]}
      />,
    )
    await userEvent.type(screen.getByPlaceholderText("Buscar..."), "disk")
    expect(screen.getByText("Save File")).toBeInTheDocument()
    expect(screen.queryByText("Print")).not.toBeInTheDocument()
  })
})
