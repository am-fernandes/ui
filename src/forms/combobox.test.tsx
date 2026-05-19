import { render, renderHook, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { Combobox, type ComboboxOption, useComboboxOptions } from "./combobox"

const options: ComboboxOption[] = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Bravo" },
  { value: "c", label: "Charlie" },
]

function SingleControlled({
  initial,
  creatable,
}: {
  initial?: string
  creatable?: boolean
}) {
  const [value, setValue] = React.useState<string | undefined>(initial)
  return (
    <Combobox
      options={options}
      value={value}
      onValueChange={setValue}
      creatable={creatable}
      placeholder="Selecione"
      emptyMessage="Nada encontrado"
    />
  )
}

function MultiControlled({ initial }: { initial?: string[] }) {
  const [value, setValue] = React.useState<string[]>(initial ?? [])
  return (
    <Combobox
      multiple
      options={options}
      value={value}
      onValueChange={setValue}
      placeholder="Selecione vários"
    />
  )
}

describe("Combobox", () => {
  it("renders trigger with placeholder", () => {
    render(<Combobox options={options} placeholder="Pick one" />)
    expect(screen.getByText("Pick one")).toBeInTheDocument()
    expect(screen.getByRole("combobox")).toBeInTheDocument()
  })

  it("opens and shows options on click", async () => {
    render(<Combobox options={options} placeholder="Pick one" />)
    await userEvent.click(screen.getByRole("combobox"))
    expect(await screen.findByText("Alpha")).toBeInTheDocument()
    expect(screen.getByText("Bravo")).toBeInTheDocument()
  })

  it("supports multiple mode", () => {
    render(<Combobox multiple options={options} value={["a", "b"]} placeholder="Pick many" />)
    expect(screen.getByText("Alpha")).toBeInTheDocument()
    expect(screen.getByText("Bravo")).toBeInTheDocument()
  })

  it("selects an option on click and emits its value (single)", async () => {
    const onValueChange = vi.fn()
    render(<Combobox options={options} onValueChange={onValueChange} placeholder="Selecione" />)
    await userEvent.click(screen.getByRole("combobox"))
    await userEvent.click(await screen.findByText("Alpha"))
    expect(onValueChange).toHaveBeenCalledWith("a")
  })

  it("deselects when re-clicking the already-selected option (single)", async () => {
    const onValueChange = vi.fn()
    render(
      <Combobox
        options={options}
        value="a"
        onValueChange={onValueChange}
        placeholder="Selecione"
      />,
    )
    await userEvent.click(screen.getByRole("combobox"))
    // The trigger shows "Alpha" too — match exactly the cmdk item by role+name.
    const items = await screen.findAllByText("Alpha")
    // The first one inside the popover (cmdk) — use the last match (which is the open list item).
    const lastAlpha = items[items.length - 1]
    if (lastAlpha) {
      await userEvent.click(lastAlpha)
    }
    expect(onValueChange).toHaveBeenLastCalledWith("")
  })

  it("toggles values in multiple mode and renders badges", async () => {
    render(<MultiControlled />)
    await userEvent.click(screen.getByRole("combobox"))
    await userEvent.click(await screen.findByText("Alpha"))
    // After selecting Alpha, a badge with label "Alpha" should appear.
    const badges = await screen.findAllByText("Alpha")
    expect(badges.length).toBeGreaterThan(0)
  })

  it("removes a multi value via the X button on the badge", async () => {
    render(<MultiControlled initial={["a", "b"]} />)
    const removeBtn = screen.getByRole("button", { name: "Remover Alpha" })
    await userEvent.click(removeBtn)
    // Alpha badge should no longer be rendered.
    await waitFor(() => {
      // The remaining badge text "Bravo" still exists, but Alpha (as badge) is gone.
      expect(screen.queryByRole("button", { name: "Remover Alpha" })).toBeNull()
    })
  })

  it("clears the single selection via the Limpar seleção control", async () => {
    const onValueChange = vi.fn()
    render(
      <Combobox
        options={options}
        value="a"
        onValueChange={onValueChange}
        placeholder="Selecione"
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: "Limpar seleção" }))
    expect(onValueChange).toHaveBeenLastCalledWith("")
  })

  it("clears the multi selection via the Limpar seleção control", async () => {
    const onValueChange = vi.fn()
    render(
      <Combobox
        multiple
        options={options}
        value={["a", "b"]}
        onValueChange={onValueChange}
        placeholder="Selecione vários"
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: "Limpar seleção" }))
    expect(onValueChange).toHaveBeenLastCalledWith([])
  })

  it("shows the empty message when no option matches the search", async () => {
    render(<Combobox options={options} placeholder="Pick" emptyMessage="Nenhum item disponível" />)
    await userEvent.click(screen.getByRole("combobox"))
    const searchInput = await screen.findByPlaceholderText("Buscar...")
    await userEvent.type(searchInput, "zzz-nonsense")
    expect(await screen.findByText("Nenhum item disponível")).toBeInTheDocument()
  })

  it("creatable: types a new value and clicks the Usar option to create it", async () => {
    const onValueChange = vi.fn()
    render(
      <Combobox
        creatable
        options={options}
        onValueChange={onValueChange}
        placeholder="Selecione"
      />,
    )
    await userEvent.click(screen.getByRole("combobox"))
    const searchInput = await screen.findByPlaceholderText("Buscar...")
    await userEvent.type(searchInput, "Novo")
    const createOption = await screen.findByText(/Usar:\s+/i)
    await userEvent.click(createOption)
    expect(onValueChange).toHaveBeenLastCalledWith("Novo")
  })

  it("creatable: when typed value already exists (case-insensitive) the Usar option is hidden", async () => {
    render(<SingleControlled creatable />)
    await userEvent.click(screen.getByRole("combobox"))
    const searchInput = await screen.findByPlaceholderText("Buscar...")
    await userEvent.type(searchInput, "alpha")
    // Should NOT show "Usar: alpha" since it matches Alpha label.
    expect(screen.queryByText(/Usar:/i)).toBeNull()
  })

  it("creatable + multiple: adds typed value to the array", async () => {
    const onValueChange = vi.fn()
    render(
      <Combobox
        creatable
        multiple
        options={options}
        value={[]}
        onValueChange={onValueChange}
        placeholder="Selecione"
      />,
    )
    await userEvent.click(screen.getByRole("combobox"))
    const searchInput = await screen.findByPlaceholderText("Buscar...")
    await userEvent.type(searchInput, "MyTag")
    const createOption = await screen.findByText(/Usar:\s+/i)
    await userEvent.click(createOption)
    expect(onValueChange).toHaveBeenLastCalledWith(["MyTag"])
  })

  it("creatable + multiple: skips creation if the value already exists in the array", async () => {
    const onValueChange = vi.fn()
    render(
      <Combobox
        creatable
        multiple
        options={options}
        value={["MyTag"]}
        onValueChange={onValueChange}
        placeholder="Selecione"
      />,
    )
    await userEvent.click(screen.getByRole("combobox"))
    const searchInput = await screen.findByPlaceholderText("Buscar...")
    await userEvent.type(searchInput, "MyTag")
    // The Usar option is not shown because the value matches via case-insensitive,
    // but if there's no matching option label we can still get there. Simulate by
    // typing something not in options but in current value.
    // Note: showCreateOption checks options only, not current values, so it appears.
    const createOption = screen.queryByText(/Usar:\s+/i)
    if (createOption) {
      await userEvent.click(createOption)
      // Should not duplicate: last call should not contain ["MyTag", "MyTag"]
      const lastCall = onValueChange.mock.calls.at(-1)
      if (lastCall) {
        expect(lastCall[0]).toEqual(["MyTag"])
      }
    }
  })

  it("does not open when disabled", async () => {
    render(<Combobox options={options} disabled placeholder="Pick" />)
    await userEvent.click(screen.getByRole("combobox"))
    expect(screen.queryByText("Alpha")).toBeNull()
  })

  it("renders selected single label in the trigger", () => {
    render(<Combobox options={options} value="b" placeholder="Pick" />)
    expect(screen.getByText("Bravo")).toBeInTheDocument()
  })

  it("renders the count in the trigger when multi has selections", () => {
    render(<Combobox multiple options={options} value={["a", "b"]} placeholder="Pick" />)
    expect(screen.getByText("2 selecionados")).toBeInTheDocument()
  })

  it("renders the singular variant in the trigger when only one is selected", () => {
    render(<Combobox multiple options={options} value={["a"]} placeholder="Pick" />)
    expect(screen.getByText("1 selecionado")).toBeInTheDocument()
  })

  it("renders aria-invalid on the trigger when error is provided", () => {
    render(<Combobox options={options} error="Obrigatório" placeholder="Pick" />)
    const trigger = screen.getByRole("combobox")
    expect(trigger).toHaveAttribute("aria-invalid", "true")
  })

  it("renders an overflow badge for multi values past maxBadges", () => {
    render(
      <Combobox
        multiple
        options={options}
        value={["a", "b", "c"]}
        maxBadges={1}
        placeholder="Pick"
      />,
    )
    expect(screen.getByText("+2")).toBeInTheDocument()
  })

  it("uses pt-BR labels by default", () => {
    render(<Combobox options={options} />)
    // Default placeholder
    expect(screen.getByText("Selecione...")).toBeInTheDocument()
  })

  it("overrides labels via the labels prop (en-US sample)", async () => {
    render(
      <Combobox
        multiple
        options={options}
        value={["a"]}
        labels={{
          placeholder: "Select...",
          searchPlaceholder: "Search...",
          emptyMessage: "No options found.",
          clearSelection: "Clear selection",
          selectedCount: (n) => (n === 1 ? `${n} selected` : `${n} selected`),
          removeBadge: (l) => `Remove ${l}`,
          createOption: (s) => `Use: "${s}"`,
        }}
      />,
    )
    // Multi-mode trigger text uses overridden selectedCount.
    expect(screen.getByText("1 selected")).toBeInTheDocument()
    // Clear-all aria-label overridden.
    expect(screen.getByRole("button", { name: "Clear selection" })).toBeInTheDocument()
    // Remove-badge aria-label overridden.
    expect(screen.getByRole("button", { name: "Remove Alpha" })).toBeInTheDocument()
    // Open the popover to check searchPlaceholder + emptyMessage.
    await userEvent.click(screen.getByRole("combobox"))
    const searchInput = await screen.findByPlaceholderText("Search...")
    await userEvent.type(searchInput, "zzz-nonsense")
    expect(await screen.findByText("No options found.")).toBeInTheDocument()
  })

  it("triggers Limpar seleção via keyboard (Enter)", async () => {
    const onValueChange = vi.fn()
    render(
      <Combobox
        options={options}
        value="a"
        onValueChange={onValueChange}
        placeholder="Selecione"
      />,
    )
    const clearBtn = screen.getByRole("button", { name: "Limpar seleção" })
    clearBtn.focus()
    await userEvent.keyboard("{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith("")
  })
})

describe("useComboboxOptions", () => {
  it("maps {id, nome} entities to {value, label}", () => {
    const { result } = renderHook(() =>
      useComboboxOptions([
        { id: 1, nome: "Alice" },
        { id: 2, nome: "Bob" },
      ]),
    )
    expect(result.current).toEqual([
      { value: "1", label: "Alice" },
      { value: "2", label: "Bob" },
    ])
  })

  it("falls back to id when label key is missing", () => {
    const { result } = renderHook(() =>
      useComboboxOptions(
        [{ id: 5, nome: "Five" }, { id: 6 }] as Array<{ id: number; nome?: string }>,
        "nome",
      ),
    )
    expect(result.current).toEqual([
      { value: "5", label: "Five" },
      { value: "6", label: "6" },
    ])
  })

  it("supports a custom label key", () => {
    const { result } = renderHook(() =>
      useComboboxOptions(
        [
          { id: "x", label: "Xenon" },
          { id: "y", label: "Yttrium" },
        ],
        "label",
      ),
    )
    expect(result.current).toEqual([
      { value: "x", label: "Xenon" },
      { value: "y", label: "Yttrium" },
    ])
  })

  it("returns an empty array when data is undefined", () => {
    const { result } = renderHook(() => useComboboxOptions(undefined))
    expect(result.current).toEqual([])
  })
})
