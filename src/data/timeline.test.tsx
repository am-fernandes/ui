import { render, screen, within } from "@testing-library/react"
import { Star } from "lucide-react"
import { describe, expect, it, vi } from "vitest"

import { Timeline, type TimelineItemData } from "./timeline"

const items: TimelineItemData[] = [
  { id: "1", actorName: "ana maria souza", content: "Abriu o chamado" },
  { id: "2", icon: Star, content: "Avaliação recebida" },
  { id: "3", content: "Chamado encerrado" },
]

const connectors = (element: HTMLElement) =>
  element.querySelectorAll('[data-slot="timeline-connector"]')

describe("Timeline", () => {
  it("renders an ordered list named Histórico, one entry per item, in order", () => {
    render(<Timeline items={items} />)
    const list = screen.getByRole("list", { name: "Histórico" })
    expect(list.tagName).toBe("OL")
    expect(
      within(list)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual([
      expect.stringContaining("Abriu o chamado"),
      expect.stringContaining("Avaliação recebida"),
      expect.stringContaining("Chamado encerrado"),
    ])
  })

  it("names the avatar after the actor, with the initials of the first two words", () => {
    render(<Timeline items={items} />)
    expect(screen.getByRole("img", { name: "ana maria souza" })).toHaveTextContent(/^AM$/)
  })

  it.each([undefined, "", "   "])("falls back to the system actor for the name %j", (name) => {
    render(<Timeline items={[{ id: "1", actorName: name, content: "x" }]} />)
    expect(screen.getByRole("img", { name: "Sistema" })).toHaveTextContent(/^SI$/)
  })

  it("ignores extra spaces and takes one initial from a one-word name", () => {
    render(
      <Timeline
        items={[
          { id: "1", actorName: "  João   Lima ", content: "x" },
          { id: "2", actorName: "Maria", content: "y" },
        ]}
      />,
    )
    expect(screen.getByRole("img", { name: "João Lima" })).toHaveTextContent(/^JL$/)
    expect(screen.getByRole("img", { name: "Maria" })).toHaveTextContent(/^M$/)
  })

  it("replaces the avatar with a decorative icon when the item has one", () => {
    render(<Timeline items={[{ id: "1", icon: Star, actorName: "Ana", content: "x" }]} />)
    expect(screen.queryByRole("img")).toBeNull()
    const marker = screen.getByRole("listitem").querySelector('[data-slot="timeline-icon"]')
    expect(marker).toHaveAttribute("aria-hidden", "true")
    expect(marker?.querySelector("svg")).toBeTruthy()
  })

  it("accepts a null avatarUrl", () => {
    render(<Timeline items={[{ id: "1", actorName: "Ana", avatarUrl: null, content: "x" }]} />)
    expect(screen.getByRole("img", { name: "Ana" })).toHaveTextContent("A")
  })

  it("connects every entry to the next one, so the last has no connector", () => {
    render(<Timeline items={items} />)
    const entries = screen.getAllByRole("listitem")
    expect(entries.map((entry) => connectors(entry).length)).toEqual([1, 1, 0])
  })

  it("moves the end of the line when an entry is appended", () => {
    const { rerender } = render(<Timeline items={items.slice(0, 1)} />)
    expect(connectors(screen.getByRole("list"))).toHaveLength(0)
    rerender(<Timeline items={items.slice(0, 2)} />)
    const entries = screen.getAllByRole("listitem")
    expect(entries.map((entry) => connectors(entry).length)).toEqual([1, 0])
  })

  it("renders rich content", () => {
    render(
      <Timeline items={[{ id: "1", content: <button type="button">Ver comentário</button> }]} />,
    )
    expect(screen.getByRole("button", { name: "Ver comentário" })).toBeInTheDocument()
  })

  it("renders an empty list without entries", () => {
    render(<Timeline items={[]} />)
    expect(screen.getByRole("list")).toBeEmptyDOMElement()
  })

  it("translates the list name and the system actor", () => {
    render(
      <Timeline
        items={[{ id: "1", content: "x" }]}
        labels={{ list: "Atividades", system: "Robô", systemInitials: "RB" }}
      />,
    )
    expect(screen.getByRole("list", { name: "Atividades" })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Robô" })).toHaveTextContent("RB")
  })

  it("forwards ref, className and list attributes", () => {
    let captured: HTMLOListElement | null = null
    render(
      <Timeline
        items={items}
        id="historico"
        className="mt-4"
        aria-label="Atividades do chamado"
        ref={(element) => {
          captured = element
        }}
      />,
    )
    const list = screen.getByRole("list", { name: "Atividades do chamado" })
    expect(captured).toBe(list)
    expect(list).toHaveAttribute("id", "historico")
    expect(list).toHaveClass("mt-4", "flex")
  })

  it("stacks the entries by default and lays them side by side when horizontal", () => {
    const { rerender } = render(<Timeline items={items} />)
    const list = screen.getByRole("list")
    expect(list).toHaveAttribute("data-orientation", "vertical")
    expect(list).toHaveClass("flex-col")
    rerender(<Timeline items={items} orientation="horizontal" />)
    expect(list).toHaveAttribute("data-orientation", "horizontal")
    expect(list).not.toHaveClass("flex-col")
    const entries = screen.getAllByRole("listitem")
    expect(entries.map((entry) => connectors(entry).length)).toEqual([1, 1, 0])
  })

  it("keeps the default name when aria-label is undefined", () => {
    render(<Timeline items={items} aria-label={undefined} />)
    expect(screen.getByRole("list", { name: "Histórico" })).toBeInTheDocument()
  })

  it("blocks an avatarUrl outside the protocols, unless allowedProtocols accepts it", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const entry = [{ id: "1", content: "x", avatarUrl: "data:image/png;base64,AA==" }]
    const { unmount } = render(<Timeline items={entry} />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("[Avatar]"))
    unmount()
    warn.mockClear()
    render(<Timeline items={entry} allowedProtocols={["data:"]} />)
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})
