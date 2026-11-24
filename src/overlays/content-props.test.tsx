import { render, screen } from "@testing-library/react"
import * as React from "react"
import { beforeAll, describe, expect, it } from "vitest"

import { AlertDialog } from "./alert-dialog"
import { Dialog } from "./dialog"
import { DropdownMenu } from "./dropdown-menu"
import { Popover } from "./popover"
import { Sheet } from "./sheet"
import { Tooltip } from "./tooltip"
import { Tour } from "./tour"

beforeAll(() => {
  const proto = Element.prototype as unknown as Record<string, unknown>
  proto.hasPointerCapture ??= () => false
  proto.releasePointerCapture ??= () => {}
})

// Each overlay, open, with a ref and contentProps on its panel.
const cases: Array<{
  name: string
  slot: string
  render: (ref: React.Ref<HTMLDivElement>) => React.ReactElement
}> = [
  {
    name: "Dialog",
    slot: "dialog-content",
    render: (ref) => (
      <Dialog
        open
        title="Proposta"
        ref={ref}
        contentProps={{ id: "painel", "data-testid": "x", "data-slot": "outro" }}
      />
    ),
  },
  {
    name: "AlertDialog",
    slot: "alert-dialog-content",
    render: (ref) => (
      <AlertDialog
        open
        title="Excluir?"
        onConfirm={() => {}}
        ref={ref}
        contentProps={{ id: "painel", "data-testid": "x", "data-slot": "outro" }}
      />
    ),
  },
  {
    name: "Sheet",
    slot: "sheet-content",
    render: (ref) => (
      <Sheet
        open
        title="Filtros"
        ref={ref}
        contentProps={{ id: "painel", "data-testid": "x", "data-slot": "outro" }}
      />
    ),
  },
  {
    name: "Popover",
    slot: "popover-content",
    render: (ref) => (
      <Popover
        open
        trigger={<button type="button">Abrir</button>}
        aria-label="Filtros"
        ref={ref}
        contentProps={{ id: "painel", "data-testid": "x", "data-slot": "outro" }}
      >
        conteúdo
      </Popover>
    ),
  },
  {
    name: "Tooltip",
    slot: "tooltip-content",
    render: (ref) => (
      <Tooltip
        open
        content="Dica"
        ref={ref}
        contentProps={{ id: "painel", "data-testid": "x", "data-slot": "outro" }}
      >
        <button type="button">Alvo</button>
      </Tooltip>
    ),
  },
  {
    name: "DropdownMenu",
    slot: "dropdown-menu-content",
    render: (ref) => (
      <DropdownMenu
        open
        trigger={<button type="button">Ações</button>}
        items={[{ id: "a", label: "Editar", onSelect: () => {} }]}
        ref={ref}
        contentProps={{ id: "painel", "data-testid": "x", "data-slot": "outro" }}
      />
    ),
  },
  {
    name: "Tour",
    slot: "tour-step",
    render: (ref) => (
      <Tour
        open
        steps={[{ target: "#nada", title: "Bem-vindo" }]}
        ref={ref}
        contentProps={{ id: "painel", "data-testid": "x", "data-slot": "outro" }}
      />
    ),
  },
]

describe("overlay content: ref and contentProps", () => {
  for (const c of cases) {
    it(`${c.name}: the ref is the panel, contentProps land on it, its own data-slot wins`, () => {
      const ref = React.createRef<HTMLDivElement>()
      render(c.render(ref))
      const panel = screen.getByTestId("x")
      expect(ref.current).toBe(panel)
      expect(panel).toHaveAttribute("id", "painel")
      expect(panel).toHaveAttribute("data-slot", c.slot)
    })
  }
})
