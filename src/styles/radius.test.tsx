import { readFileSync } from "node:fs"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Calendar } from "../forms/calendar"
import { Tabs } from "../navigation/tabs"
import { DropdownMenu } from "../overlays/dropdown-menu"
import { SegmentedControl } from "../primitives/segmented-control"

const tokens = readFileSync("src/styles/tokens.css", "utf8")

const radius = (level: "inner" | "element" | "container" | "track") =>
  Number(tokens.match(new RegExp(`--radius-${level}: (\\d+)px`))?.[1])

const concentricPadding = (outer: number, inner: number, border = 0) =>
  `p-${(outer - inner - border) / 4}`

describe("radius", () => {
  it("uses the 4 / 6 / 10 scale", () => {
    expect([radius("inner"), radius("element"), radius("container")]).toEqual([4, 6, 10])
  })

  it("pads the Tabs track so the tabs are concentric", () => {
    render(<Tabs items={[{ value: "a", label: "A", content: "Painel" }]} />)
    expect(screen.getByRole("tablist")).toHaveClass(
      "rounded-track",
      concentricPadding(radius("track"), radius("inner")),
    )
    expect(screen.getByRole("tab")).toHaveClass("rounded-inner")
    expect(screen.getByRole("tablist")).toHaveClass("items-stretch")
  })

  it("pads the SegmentedControl track so the segments are concentric", () => {
    render(<SegmentedControl label="Visão" options={[{ value: "a", label: "A" }]} />)
    expect(screen.getByRole("radiogroup")).toHaveClass(
      "rounded-track",
      concentricPadding(radius("track"), radius("inner")),
    )
    expect(screen.getByRole("radio")).toHaveClass("rounded-inner")
  })

  it("pads a menu so its items are concentric", async () => {
    render(
      <DropdownMenu trigger={<button type="button">Abrir</button>} items={[{ label: "Editar" }]} />,
    )
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    expect(screen.getByRole("menu")).toHaveClass(
      concentricPadding(radius("container"), radius("element"), 1),
    )
  })

  it("pads the Calendar so the days are concentric inside a bordered popover", () => {
    const { container } = render(<Calendar />)
    expect(container.querySelector('[data-slot="calendar"]')).toHaveClass(
      concentricPadding(radius("container"), radius("inner"), 1),
    )
  })

  it("gives every Calendar day and arrow the cell radius", () => {
    const { container } = render(<Calendar mode="single" selected={new Date()} />)
    const buttons = [
      ...container.querySelectorAll('[data-slot="calendar-day-button"]'),
      ...container.querySelectorAll("nav button"),
    ]
    expect(buttons.length).toBeGreaterThan(28)
    for (const button of buttons) {
      expect(button).toHaveClass("rounded-(--cell-radius)")
      expect(button).not.toHaveClass("rounded-element")
    }
  })
})
