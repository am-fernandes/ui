import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Popover } from "./popover"

describe("Popover", () => {
  it("opens on trigger click", async () => {
    render(
      <Popover trigger={<button type="button">Open</button>}>
        <p>Conteúdo</p>
      </Popover>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Open" }))
    expect(screen.getByText("Conteúdo")).toBeInTheDocument()
  })

  it("supports controlled open", () => {
    render(
      <Popover open>
        <p>Visible</p>
      </Popover>,
    )
    expect(screen.getByText("Visible")).toBeInTheDocument()
  })

  it("applies align prop to content", async () => {
    render(
      <Popover trigger={<button type="button">X</button>} align="start">
        <p>c</p>
      </Popover>,
    )
    await userEvent.click(screen.getByRole("button", { name: "X" }))
    const content = document.querySelector('[data-slot="popover-content"]')
    expect(content).toHaveAttribute("data-align", "start")
  })
})
