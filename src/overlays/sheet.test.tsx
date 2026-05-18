import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Sheet } from "./sheet"

describe("Sheet", () => {
  it("opens via trigger and renders title/description/children", async () => {
    render(
      <Sheet trigger={<button type="button">Abrir</button>} title="Config" description="...">
        <p>body</p>
      </Sheet>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText("Config")).toBeInTheDocument()
    expect(screen.getByText("body")).toBeInTheDocument()
  })

  it("renders footer slot", async () => {
    render(
      <Sheet
        trigger={<button type="button">Abrir</button>}
        title="X"
        footer={
          <button type="button" data-testid="ok">
            OK
          </button>
        }
      >
        body
      </Sheet>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    expect(screen.getByTestId("ok")).toBeInTheDocument()
  })

  it("supports side prop", () => {
    render(
      <Sheet open side="left" title="X">
        body
      </Sheet>,
    )
    expect(document.querySelector('[data-slot="sheet-content"]')).toHaveAttribute(
      "data-side",
      "left",
    )
  })
})
