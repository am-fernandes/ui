import { render, screen } from "@testing-library/react"
import userEvent, { type UserEvent } from "@testing-library/user-event"
import type * as React from "react"
import { beforeAll, describe, expect, it } from "vitest"

import { AlertDialog } from "../overlays/alert-dialog"
import { Collapsible } from "../overlays/collapsible"
import { Dialog } from "../overlays/dialog"
import { DropdownMenu } from "../overlays/dropdown-menu"
import { Popover } from "../overlays/popover"
import { Sheet } from "../overlays/sheet"
import { Button } from "../primitives/button"
import { IconButton } from "../primitives/icon-button"

/**
 * Contract of every overlay that takes a `trigger`: a trigger that is busy
 * (`loading`) or unavailable without the native `disabled` (`aria-disabled`,
 * which keeps it focusable) opens nothing, by click, by pointer or by key.
 *
 * Radix opens a DropdownMenu on pointerdown and on Enter, Space and ↓, not on
 * click. The Button only ignored the click: the DataTable's export menu
 * opened again while a file was being made, and the export ran twice.
 */

beforeAll(() => {
  const proto = Element.prototype as unknown as Record<string, unknown>
  proto.hasPointerCapture ??= () => false
  proto.setPointerCapture ??= () => {}
  proto.releasePointerCapture ??= () => {}
})

type Overlay = {
  name: string
  render: (trigger: React.ReactElement) => React.ReactElement
  /** The overlay is open. */
  isOpen: () => boolean
}

const overlays: Overlay[] = [
  {
    name: "DropdownMenu",
    render: (trigger) => (
      <DropdownMenu
        trigger={trigger}
        items={[{ id: "a", label: "Exportar", onSelect: () => {} }]}
      />
    ),
    isOpen: () => screen.queryByRole("menu") !== null,
  },
  {
    name: "Popover",
    render: (trigger) => (
      <Popover trigger={trigger} aria-label="Filtros">
        <p>Filtros</p>
      </Popover>
    ),
    isOpen: () => screen.queryByRole("dialog") !== null,
  },
  {
    name: "Dialog",
    render: (trigger) => (
      <Dialog trigger={trigger} title="Editar">
        <p>Corpo</p>
      </Dialog>
    ),
    isOpen: () => screen.queryByRole("dialog") !== null,
  },
  {
    name: "AlertDialog",
    render: (trigger) => (
      <AlertDialog
        trigger={trigger}
        title="Excluir?"
        description="Não pode ser desfeito."
        onConfirm={() => {}}
      />
    ),
    isOpen: () => screen.queryByRole("alertdialog") !== null,
  },
  {
    name: "Sheet",
    render: (trigger) => (
      <Sheet trigger={trigger} title="Detalhes">
        <p>Corpo</p>
      </Sheet>
    ),
    isOpen: () => screen.queryByRole("dialog") !== null,
  },
  {
    name: "Collapsible",
    render: (trigger) => (
      <Collapsible trigger={trigger}>
        <p>Conteúdo escondido</p>
      </Collapsible>
    ),
    isOpen: () => screen.queryByText("Conteúdo escondido") !== null,
  },
]

type Trigger = { name: string; element: (busy: boolean) => React.ReactElement }

const triggers: Trigger[] = [
  { name: "Button loading", element: (busy) => <Button loading={busy}>Abrir</Button> },
  {
    name: "Button asChild disabled (a link)",
    element: (busy) => (
      <Button asChild disabled={busy}>
        <a href="#abrir">Abrir</a>
      </Button>
    ),
  },
  {
    name: "IconButton loading",
    element: (busy) => <IconButton label="Abrir" icon={<span>+</span>} loading={busy} />,
  },
  {
    name: "IconButton disabled",
    element: (busy) => <IconButton label="Abrir" icon={<span>+</span>} disabled={busy} />,
  },
]

type Gesture = { how: string; run: (user: UserEvent, trigger: HTMLElement) => Promise<void> }

const gestures: Gesture[] = [
  { how: "a click", run: (user, trigger) => user.click(trigger) },
  {
    how: "Enter",
    run: async (user, trigger) => {
      trigger.focus()
      await user.keyboard("{Enter}")
    },
  },
  {
    how: "Space",
    run: async (user, trigger) => {
      trigger.focus()
      await user.keyboard(" ")
    },
  },
  {
    how: "↓",
    run: async (user, trigger) => {
      trigger.focus()
      await user.keyboard("{ArrowDown}")
    },
  },
]

const triggerOf = () =>
  (screen.queryByRole("button", { name: "Abrir" }) ??
    screen.getByRole("link", { name: "Abrir" })) as HTMLElement

describe.each(overlays)("$name", (overlay) => {
  describe.each(triggers)("with a $name trigger", (trigger) => {
    it.each(gestures)("opens nothing on $how while busy", async ({ run }) => {
      const user = userEvent.setup()
      render(overlay.render(trigger.element(true)))
      const element = triggerOf()
      expect(element).toHaveAttribute("aria-disabled", "true")
      await run(user, element)
      expect(overlay.isOpen()).toBe(false)
      // Still in the tab order: the focus stays where the user left it.
      expect(element).not.toHaveAttribute("disabled")
    })

    it("opens on a click when free", async () => {
      const user = userEvent.setup()
      render(overlay.render(trigger.element(false)))
      await user.click(triggerOf())
      expect(overlay.isOpen()).toBe(true)
    })
  })
})

describe("an unavailable trigger still hears the keys that open nothing", () => {
  it("Tab and Escape reach onKeyDown", async () => {
    const keys: string[] = []
    const user = userEvent.setup()
    render(
      <Button loading onKeyDown={(event) => keys.push(event.key)}>
        Salvar
      </Button>,
    )
    screen.getByRole("button", { name: "Salvar" }).focus()
    await user.keyboard("{Escape}{Enter}{ArrowDown}")
    expect(keys).toEqual(["Escape"])
  })
})
