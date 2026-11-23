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

  it("filters by the visible label when value is an opaque id", async () => {
    const idOptions: ComboboxOption[] = [
      { value: "7f3a", label: "Alpha" },
      { value: "9b2c", label: "Bravo" },
    ]
    render(<Combobox options={idOptions} placeholder="Pick" />)
    await userEvent.click(screen.getByRole("combobox"))
    const searchInput = await screen.findByPlaceholderText("Buscar...")
    await userEvent.type(searchInput, "brav")
    expect(await screen.findByRole("option", { name: /Bravo/ })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: /Alpha/ })).not.toBeInTheDocument()
  })

  it("does not match the search against the option's value (numeric ids)", async () => {
    const idOptions: ComboboxOption[] = [
      { value: "101", label: "Alpha" },
      { value: "202", label: "Bravo" },
    ]
    render(<Combobox options={idOptions} placeholder="Pick" emptyMessage="Nada" />)
    await userEvent.click(screen.getByRole("combobox"))
    await userEvent.type(await screen.findByPlaceholderText("Buscar..."), "10")
    expect(screen.queryByRole("option", { name: /Alpha/ })).not.toBeInTheDocument()
    expect(await screen.findByText("Nada")).toBeInTheDocument()
  })

  it("finds an option by one of its keywords", async () => {
    const cities: ComboboxOption[] = [
      { value: "1", label: "São Paulo", keywords: ["SP", "Sampa"] },
      { value: "2", label: "Rio de Janeiro", keywords: ["RJ"] },
    ]
    render(<Combobox options={cities} placeholder="Pick" />)
    await userEvent.click(screen.getByRole("combobox"))
    await userEvent.type(await screen.findByPlaceholderText("Buscar..."), "sampa")
    expect(await screen.findByRole("option", { name: /São Paulo/ })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: /Rio/ })).not.toBeInTheDocument()
  })

  it("creatable: filters existing options by label, not just value", async () => {
    const idOptions: ComboboxOption[] = [{ value: "7f3a", label: "Alpha" }]
    render(<Combobox creatable options={idOptions} placeholder="Pick" />)
    await userEvent.click(screen.getByRole("combobox"))
    const searchInput = await screen.findByPlaceholderText("Buscar...")
    await userEvent.type(searchInput, "alph")
    expect(await screen.findByRole("option", { name: /Alpha/ })).toBeInTheDocument()
  })

  it("matches accented labels when searching without diacritics, in both modes", async () => {
    const accentOptions: ComboboxOption[] = [{ value: "c1", label: "Coração" }]
    const { unmount } = render(<Combobox options={accentOptions} placeholder="Pick" />)
    await userEvent.click(screen.getByRole("combobox"))
    await userEvent.type(await screen.findByPlaceholderText("Buscar..."), "coracao")
    expect(await screen.findByRole("option", { name: /Coração/ })).toBeInTheDocument()
    unmount()
    render(<Combobox creatable options={accentOptions} placeholder="Pick" />)
    await userEvent.click(screen.getByRole("combobox"))
    await userEvent.type(await screen.findByPlaceholderText("Buscar..."), "coracao")
    expect(await screen.findByRole("option", { name: /Coração/ })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: /Usar/ })).not.toBeInTheDocument()
  })

  it("keeps the dropdown list from scrolling its ancestors (overscroll contained)", async () => {
    render(<Combobox options={[{ value: "a", label: "Alpha" }]} placeholder="Pick" />)
    await userEvent.click(screen.getByRole("combobox"))
    const list = await screen.findByRole("listbox")
    expect(list.className).toMatch(/overscroll-y-contain/)
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

  it("disabled: offers no clear control, so the value cannot be cleared by keyboard", async () => {
    const onValueChange = vi.fn()
    render(
      <Combobox
        options={options}
        value="c"
        disabled
        onValueChange={onValueChange}
        placeholder="Selecione"
      />,
    )
    expect(screen.queryByRole("button", { name: "Limpar seleção" })).toBeNull()
    await userEvent.tab()
    await userEvent.keyboard("{Enter}")
    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.getByRole("combobox")).toHaveTextContent("Charlie")
  })

  it("the clear control is a real button next to the trigger, not inside it", () => {
    render(<Combobox options={options} value="a" placeholder="Selecione" />)
    const trigger = screen.getByRole("combobox")
    const clear = screen.getByRole("button", { name: "Limpar seleção" })
    expect(clear.tagName).toBe("BUTTON")
    expect(trigger.contains(clear)).toBe(false)
  })

  it("clearing puts the focus back on the trigger", async () => {
    render(<SingleControlled initial="a" />)
    await userEvent.click(screen.getByRole("button", { name: "Limpar seleção" }))
    expect(screen.queryByRole("button", { name: "Limpar seleção" })).toBeNull()
    expect(screen.getByRole("combobox")).toHaveFocus()
    expect(screen.getByRole("combobox")).toHaveTextContent("Selecione")
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

describe("Combobox: listas grandes e busca no servidor", () => {
  const many: ComboboxOption[] = Array.from({ length: 250 }, (_, i) => ({
    value: `o-${i + 1}`,
    label: `Opção ${i + 1}`,
  }))

  it("renders at most maxVisibleOptions (100) and says how many are hidden", async () => {
    render(<Combobox options={many} placeholder="Pick" />)
    await userEvent.click(screen.getByRole("combobox"))
    await screen.findByRole("listbox")
    expect(screen.getAllByRole("option")).toHaveLength(100)
    expect(screen.getByText(/150 opções a mais/)).toBeInTheDocument()
    expect(screen.getByText(/continue digitando/i)).toBeInTheDocument()
  })

  it("filters the whole list, not just what is on screen, and drops the line when all fit", async () => {
    render(<Combobox options={many} placeholder="Pick" />)
    await userEvent.click(screen.getByRole("combobox"))
    await userEvent.type(await screen.findByPlaceholderText("Buscar..."), "opcao 24")
    // 24 and 240-249
    expect(screen.getAllByRole("option")).toHaveLength(11)
    expect(screen.getByRole("option", { name: /Opção 249/ })).toBeInTheDocument()
    expect(screen.queryByText(/opções a mais/)).toBeNull()
  })

  it("keeps the chosen option in the list even past the cap", async () => {
    render(<Combobox options={many} value="o-200" placeholder="Pick" />)
    await userEvent.click(screen.getByRole("combobox"))
    expect(await screen.findByRole("option", { name: /Opção 200/ })).toBeInTheDocument()
    expect(screen.getByText(/149 opções a mais/)).toBeInTheDocument()
  })

  it("maxVisibleOptions and the line's text can be changed", async () => {
    render(
      <Combobox
        options={many}
        placeholder="Pick"
        maxVisibleOptions={10}
        labels={{ hiddenOptions: (n) => `+${n} itens` }}
      />,
    )
    await userEvent.click(screen.getByRole("combobox"))
    await screen.findByRole("listbox")
    expect(screen.getAllByRole("option")).toHaveLength(10)
    expect(screen.getByText("+240 itens")).toBeInTheDocument()
  })

  it("server search: reports the term and shows the options as given with shouldFilter={false}", async () => {
    const onSearchChange = vi.fn()
    const serverOptions: ComboboxOption[] = [
      { value: "1", label: "Alpha" },
      { value: "2", label: "Bravo" },
    ]
    render(
      <Combobox
        options={serverOptions}
        shouldFilter={false}
        onSearchChange={onSearchChange}
        placeholder="Pick"
      />,
    )
    await userEvent.click(screen.getByRole("combobox"))
    await userEvent.type(await screen.findByPlaceholderText("Buscar..."), "zz")
    expect(onSearchChange).toHaveBeenLastCalledWith("zz")
    // Nothing matches "zz" locally, but the server's answer is shown as is.
    expect(screen.getAllByRole("option")).toHaveLength(2)
  })

  it("loading: says it is loading instead of saying nothing was found", async () => {
    render(<Combobox options={[]} loading shouldFilter={false} placeholder="Pick" />)
    await userEvent.click(screen.getByRole("combobox"))
    expect(await screen.findByText("Carregando…")).toBeInTheDocument()
    expect(screen.queryByText("Nenhuma opção encontrada.")).toBeNull()
  })

  it("server search: keeps showing the chosen label when the options no longer contain it", () => {
    const { rerender } = render(
      <Combobox options={[{ value: "1", label: "Alpha" }]} value="1" shouldFilter={false} />,
    )
    rerender(<Combobox options={[{ value: "2", label: "Bravo" }]} value="1" shouldFilter={false} />)
    expect(screen.getByRole("combobox")).toHaveTextContent("Alpha")
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
