import { render, screen, waitFor } from "@testing-library/react"
import userEvent, { type UserEvent } from "@testing-library/user-event"
import * as React from "react"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { Combobox } from "../forms/combobox"
import { DateInput } from "../forms/date-input"
import { DateRangePicker } from "../forms/date-range-picker"
import { Select } from "../forms/select"
import { AppShell } from "../navigation/app-shell"
import { CommandPalette } from "../navigation/command-palette"
import { AlertDialog } from "../overlays/alert-dialog"
import { Dialog } from "../overlays/dialog"
import { DropdownMenu } from "../overlays/dropdown-menu"
import { Popover } from "../overlays/popover"
import { Sheet } from "../overlays/sheet"
import { Tooltip } from "../overlays/tooltip"
import { Tour } from "../overlays/tour"
import { Button } from "../primitives/button"

/**
 * Contract of every floating layer: opened from a dark part of the page
 * (`<section className="dark">`, which the docs support), it is dark too.
 *
 * The layers are portaled into <body>, out of that section: a menu, a
 * popover or a dialog opened from a dark panel came out in the light theme.
 * Opened outside a dark part, the layer stays as the page is.
 */

beforeAll(() => {
  const proto = Element.prototype as unknown as Record<string, unknown>
  proto.hasPointerCapture ??= () => false
  proto.setPointerCapture ??= () => {}
  proto.releasePointerCapture ??= () => {}
})

afterEach(() => {
  document.documentElement.classList.remove("dark")
})

type Layer = {
  name: string
  /** The thing that opens the layer, as it sits in the page. */
  render: () => React.ReactElement
  open: (user: UserEvent) => Promise<void>
  /** The element of the layer that carries its colours. */
  layer: () => Element | null
}

const slot = (name: string) => () => document.querySelector(`[data-slot="${name}"]`)
const click =
  (name: RegExp | string, role: "button" | "combobox" = "button") =>
  async (user: UserEvent) =>
    user.click(screen.getByRole(role, { name }))

function StateDialog() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Abrir</Button>
      <Dialog open={open} onOpenChange={setOpen} title="Editar">
        <p>Corpo</p>
      </Dialog>
    </>
  )
}

function StatePalette() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Abrir</Button>
      <CommandPalette
        title="Comandos"
        open={open}
        onOpenChange={setOpen}
        groups={[{ items: [{ label: "Salvar", onSelect: () => {} }] }]}
      />
    </>
  )
}

const layers: Layer[] = [
  {
    name: "Popover",
    render: () => (
      <Popover trigger={<Button>Abrir</Button>} aria-label="Filtros">
        <p>Filtros</p>
      </Popover>
    ),
    open: click("Abrir"),
    layer: slot("popover-content"),
  },
  {
    name: "DropdownMenu",
    render: () => (
      <DropdownMenu
        trigger={<Button>Abrir</Button>}
        items={[{ id: "a", label: "Exportar", onSelect: () => {} }]}
      />
    ),
    open: click("Abrir"),
    layer: slot("dropdown-menu-content"),
  },
  {
    name: "DropdownMenu submenu",
    render: () => (
      <DropdownMenu
        trigger={<Button>Abrir</Button>}
        items={[
          {
            type: "submenu",
            id: "mais",
            label: "Mais",
            items: [{ id: "b", label: "Arquivar", onSelect: () => {} }],
          },
        ]}
      />
    ),
    open: async (user) => {
      await user.click(screen.getByRole("button", { name: "Abrir" }))
      ;(await screen.findByRole("menuitem", { name: "Mais" })).focus()
      await user.keyboard("{ArrowRight}")
      await waitFor(() => expect(slot("dropdown-menu-sub-content")()).not.toBeNull())
    },
    layer: slot("dropdown-menu-sub-content"),
  },
  {
    name: "Tooltip",
    render: () => (
      <Tooltip content="Ajuda">
        <Button>Abrir</Button>
      </Tooltip>
    ),
    open: async (user) => {
      await user.tab()
      await waitFor(() => expect(slot("tooltip-content")()).not.toBeNull())
    },
    layer: slot("tooltip-content"),
  },
  {
    name: "Dialog",
    render: () => (
      <Dialog trigger={<Button>Abrir</Button>} title="Editar">
        <p>Corpo</p>
      </Dialog>
    ),
    open: click("Abrir"),
    layer: slot("dialog-content"),
  },
  {
    name: "Dialog backdrop",
    render: () => (
      <Dialog trigger={<Button>Abrir</Button>} title="Editar">
        <p>Corpo</p>
      </Dialog>
    ),
    open: click("Abrir"),
    layer: slot("dialog-overlay"),
  },
  {
    name: "Dialog opened by state (no trigger)",
    render: () => <StateDialog />,
    open: click("Abrir"),
    layer: slot("dialog-content"),
  },
  {
    name: "AlertDialog",
    render: () => (
      <AlertDialog
        trigger={<Button>Abrir</Button>}
        title="Excluir?"
        description="Não pode ser desfeito."
        onConfirm={() => {}}
      />
    ),
    open: click("Abrir"),
    layer: slot("alert-dialog-content"),
  },
  {
    name: "Sheet",
    render: () => (
      <Sheet trigger={<Button>Abrir</Button>} title="Detalhes">
        <p>Corpo</p>
      </Sheet>
    ),
    open: click("Abrir"),
    layer: slot("sheet-content"),
  },
  {
    name: "Select",
    render: () => (
      <Select
        label="Estágio"
        options={[
          { value: "a", label: "Alpha" },
          { value: "b", label: "Bravo" },
        ]}
      />
    ),
    open: click("Estágio", "combobox"),
    layer: slot("select-content"),
  },
  {
    name: "Combobox",
    render: () => (
      <Combobox
        label="Status"
        options={[
          { value: "a", label: "Alpha" },
          { value: "b", label: "Bravo" },
        ]}
      />
    ),
    open: click(/Status/, "combobox"),
    layer: slot("popover-content"),
  },
  {
    name: "DateInput calendar",
    render: () => <DateInput label="Data" />,
    open: click("Abrir calendário"),
    layer: slot("popover-content"),
  },
  {
    name: "DateRangePicker calendar",
    render: () => <DateRangePicker label="Período" />,
    open: click(/Período/),
    layer: slot("popover-content"),
  },
  {
    name: "CommandPalette",
    render: () => <StatePalette />,
    open: click("Abrir"),
    layer: slot("dialog-content"),
  },
  {
    name: "Tour",
    render: () => (
      <>
        <button type="button" id="alvo">
          Alvo
        </button>
        <Tour steps={[{ target: "#alvo", title: "Comece aqui" }]} open />
      </>
    ),
    open: async () => {
      await waitFor(() => expect(slot("tour-step")()).not.toBeNull())
    },
    layer: slot("tour-step"),
  },
]

describe.each(layers)("$name", (layer) => {
  it("opened from a dark section, is dark", async () => {
    const user = userEvent.setup()
    render(<section className="dark">{layer.render()}</section>)
    await layer.open(user)
    await waitFor(() => expect(layer.layer()).toHaveClass("dark"))
    // Portaled out of the section: the class is what makes it dark.
    expect(layer.layer()?.closest("section")).toBeNull()
  })

  it("opened outside a dark part, takes no theme of its own", async () => {
    const user = userEvent.setup()
    render(
      <>
        <section className="dark">
          <p>Outra parte</p>
        </section>
        {layer.render()}
      </>,
    )
    await layer.open(user)
    await waitFor(() => expect(layer.layer()).not.toBeNull())
    expect(layer.layer()).not.toHaveClass("dark")
  })

  it('under <html class="dark">, leaves the theme to the page', async () => {
    document.documentElement.classList.add("dark")
    const user = userEvent.setup()
    render(layer.render())
    await layer.open(user)
    await waitFor(() => expect(layer.layer()).not.toBeNull())
    expect(layer.layer()).not.toHaveClass("dark")
  })
})

describe("AppShell inside a dark section", () => {
  it("the flyout of a group on the collapsed rail is dark", async () => {
    const user = userEvent.setup()
    render(
      <section className="dark">
        <AppShell
          collapsed
          storageKey={false}
          items={[
            {
              id: "vendas",
              label: "Vendas",
              items: [{ id: "leads", label: "Leads", href: "/leads" }],
            },
          ]}
        >
          conteúdo
        </AppShell>
      </section>,
    )
    await user.click(screen.getByRole("button", { name: "Vendas" }))
    await waitFor(() => expect(slot("app-shell-flyout")()).toHaveClass("dark"))
  })

  it("the mobile menu is dark", async () => {
    const matchMedia = vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: true,
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    )
    const user = userEvent.setup()
    render(
      <section className="dark">
        <AppShell storageKey={false} items={[{ id: "a", label: "Início", href: "/" }]}>
          conteúdo
        </AppShell>
      </section>,
    )
    await user.click(screen.getByRole("button", { name: "Abrir menu" }))
    await waitFor(() => expect(slot("app-shell-menu")()).toHaveClass("dark"))
    expect(slot("app-shell-menu-overlay")()).toHaveClass("dark")
    matchMedia.mockRestore()
  })
})
