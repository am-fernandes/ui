import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItems,
  DropdownMenuTrigger,
} from "./dropdown-menu"

describe("DropdownMenu", () => {
  it("renders items via DropdownMenuItems when open", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItems
            items={[
              { type: "label", label: "Conta" },
              { label: "Perfil" },
              { type: "separator" },
              { label: "Sair", destructive: true },
            ]}
          />
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    expect(screen.getByText("Conta")).toBeInTheDocument()
    expect(screen.getByText("Perfil")).toBeInTheDocument()
    expect(screen.getByText("Sair")).toBeInTheDocument()
  })

  it("hides content when closed", () => {
    render(
      <DropdownMenu open={false}>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItems items={[{ label: "Perfil" }]} />
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    expect(screen.queryByText("Perfil")).not.toBeInTheDocument()
  })
})
