import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command"

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

  it("filters items as the user types", async () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandItem value="apple">Apple</CommandItem>
          <CommandItem value="banana">Banana</CommandItem>
          <CommandItem value="cherry">Cherry</CommandItem>
        </CommandList>
      </Command>,
    )

    const input = screen.getByPlaceholderText("Search...")
    await userEvent.type(input, "ban")

    // Matching item stays visible.
    await waitFor(() => {
      expect(screen.getByText("Banana")).toBeInTheDocument()
    })
    // cmdk removes or hides non-matching items — assert Apple/Cherry are no longer rendered as visible matches.
    await waitFor(() => {
      expect(screen.queryByText("Apple")).not.toBeInTheDocument()
      expect(screen.queryByText("Cherry")).not.toBeInTheDocument()
    })
  })

  it("renders CommandEmpty when nothing matches", async () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No matches found</CommandEmpty>
          <CommandItem value="apple">Apple</CommandItem>
        </CommandList>
      </Command>,
    )

    await userEvent.type(screen.getByPlaceholderText("Search..."), "zzz")
    await waitFor(() => {
      expect(screen.getByText("No matches found")).toBeInTheDocument()
    })
  })

  it("fires onSelect when an item is selected", async () => {
    const onSelect = vi.fn()
    render(
      <Command>
        <CommandList>
          <CommandItem value="hello" onSelect={onSelect}>
            Hello
          </CommandItem>
        </CommandList>
      </Command>,
    )

    await userEvent.click(screen.getByText("Hello"))
    expect(onSelect).toHaveBeenCalled()
  })

  it("CommandDialog includes sr-only DialogTitle and DialogDescription", () => {
    render(
      <CommandDialog open>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandItem>Item</CommandItem>
        </CommandList>
      </CommandDialog>,
    )

    // Both title and description should be present (rendered in portal)
    const title = document.querySelector('[data-slot="dialog-title"]')
    const desc = document.querySelector('[data-slot="dialog-description"]')
    expect(title).toBeTruthy()
    expect(desc).toBeTruthy()
    expect(title?.classList.contains("sr-only")).toBe(true)
    expect(desc?.classList.contains("sr-only")).toBe(true)
  })

  it("CommandDialog respects custom title/description props", () => {
    render(
      <CommandDialog open title="Quick search" description="Find anything">
        <CommandList>
          <CommandItem>Item</CommandItem>
        </CommandList>
      </CommandDialog>,
    )

    const title = document.querySelector('[data-slot="dialog-title"]')
    const desc = document.querySelector('[data-slot="dialog-description"]')
    expect(title?.textContent).toBe("Quick search")
    expect(desc?.textContent).toBe("Find anything")
  })
})
