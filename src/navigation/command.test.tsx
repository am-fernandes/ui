import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Command, CommandInput, CommandItem, CommandList } from "./command"

describe("Command", () => {
  it("renders input + item", () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandItem>Foo</CommandItem>
        </CommandList>
      </Command>,
    )
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument()
    expect(screen.getByText("Foo")).toBeInTheDocument()
  })
})
