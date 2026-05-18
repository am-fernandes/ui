import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { DropdownMenu } from "./dropdown-menu"

describe("DropdownMenu", () => {
  it("renders the trigger", () => {
    render(
      <DropdownMenu trigger={<button type="button">Open</button>} items={[{ label: "Perfil" }]} />,
    )
    expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument()
  })

  it("renders items when controlled open", () => {
    render(
      <DropdownMenu
        open
        trigger={<button type="button">Open</button>}
        items={[
          { type: "label", label: "Conta" },
          { label: "Perfil" },
          { type: "separator" },
          { label: "Sair", destructive: true },
        ]}
      />,
    )
    expect(screen.getByText("Conta")).toBeInTheDocument()
    expect(screen.getByText("Perfil")).toBeInTheDocument()
    expect(screen.getByText("Sair")).toBeInTheDocument()
  })

  it("hides items when closed", () => {
    render(
      <DropdownMenu
        open={false}
        trigger={<button type="button">Open</button>}
        items={[{ label: "Perfil" }]}
      />,
    )
    expect(screen.queryByText("Perfil")).not.toBeInTheDocument()
  })
})
