import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import * as React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Button } from "../primitives/button"
import { IconButton } from "../primitives/icon-button"
import { DropdownMenu, type DropdownMenuEntry, type DropdownMenuProps } from "./dropdown-menu"

function renderMenu(items: DropdownMenuEntry[], props: Partial<DropdownMenuProps> = {}) {
  return render(<DropdownMenu trigger={<Button>Ações</Button>} items={items} {...props} />)
}

async function openMenu(name = "Ações") {
  await userEvent.click(screen.getByRole("button", { name }))
  return screen.getByRole("menu")
}

describe("DropdownMenu", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("trigger", () => {
    it("renders only the trigger while closed", () => {
      renderMenu([{ label: "Editar" }])
      const trigger = screen.getByRole("button", { name: "Ações" })
      expect(trigger).toHaveAttribute("aria-haspopup", "menu")
      expect(trigger).toHaveAttribute("aria-expanded", "false")
      expect(screen.queryByRole("menu")).not.toBeInTheDocument()
    })

    it("opens on click and is labelled by the trigger", async () => {
      renderMenu([{ label: "Editar" }])
      // While a modal menu is open the rest of the page is hidden from
      // assistive tech, so grab the trigger first.
      const trigger = screen.getByRole("button", { name: "Ações" })
      const menu = await openMenu()
      expect(trigger).toHaveAttribute("aria-expanded", "true")
      expect(menu).toHaveAttribute("aria-labelledby", trigger.id)
      expect(within(menu).getByRole("menuitem", { name: "Editar" })).toBeInTheDocument()
    })

    it("opens from the keyboard and focuses the first item", async () => {
      renderMenu([{ label: "Editar" }, { label: "Duplicar" }])
      screen.getByRole("button", { name: "Ações" }).focus()
      await userEvent.keyboard("{Enter}")
      expect(screen.getByRole("menuitem", { name: "Editar" })).toHaveFocus()
    })

    it("works with an IconButton trigger", async () => {
      render(
        <DropdownMenu
          trigger={<IconButton icon={<MoreHorizontal />} label="Mais ações" />}
          items={[{ label: "Editar" }]}
        />,
      )
      const menu = await openMenu("Mais ações")
      expect(menu).toHaveAccessibleName("Mais ações")
    })
  })

  describe("action items", () => {
    it("calls onSelect, closes and returns focus to the trigger", async () => {
      const onSelect = vi.fn()
      renderMenu([{ label: "Editar", onSelect }])
      const menu = await openMenu()
      await userEvent.click(within(menu).getByRole("menuitem", { name: "Editar" }))
      expect(onSelect).toHaveBeenCalledTimes(1)
      expect(screen.queryByRole("menu")).not.toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Ações" })).toHaveFocus()
    })

    it("selects with Enter", async () => {
      const onSelect = vi.fn()
      renderMenu([{ label: "Editar", onSelect }])
      screen.getByRole("button", { name: "Ações" }).focus()
      await userEvent.keyboard("{Enter}")
      await userEvent.keyboard("{Enter}")
      expect(onSelect).toHaveBeenCalledTimes(1)
    })

    it("stays open with keepOpen", async () => {
      const onSelect = vi.fn()
      renderMenu([{ label: "Aumentar", onSelect, keepOpen: true }])
      const menu = await openMenu()
      await userEvent.click(within(menu).getByRole("menuitem", { name: "Aumentar" }))
      await userEvent.click(within(menu).getByRole("menuitem", { name: "Aumentar" }))
      expect(onSelect).toHaveBeenCalledTimes(2)
      expect(screen.getByRole("menu")).toBeInTheDocument()
    })

    it("does not select a disabled item", async () => {
      const onSelect = vi.fn()
      renderMenu([{ label: "Arquivar", onSelect, disabled: true }, { label: "Editar" }])
      const menu = await openMenu()
      const item = within(menu).getByRole("menuitem", { name: "Arquivar" })
      expect(item).toHaveAttribute("aria-disabled", "true")
      expect(item).toHaveAttribute("data-disabled")
      await userEvent.click(item)
      expect(onSelect).not.toHaveBeenCalled()
    })

    it("renders icon and shortcut", async () => {
      renderMenu([{ label: "Duplicar", icon: Copy, shortcut: "⌘D" }])
      const menu = await openMenu()
      const item = within(menu).getByRole("menuitem", { name: /Duplicar/ })
      expect(item.querySelector("svg.lucide-copy")).not.toBeNull()
      expect(within(item).getByText("⌘D")).toHaveAttribute("data-slot", "dropdown-menu-shortcut")
    })

    it("paints destructive items in the error colour", async () => {
      renderMenu([
        { label: "Editar", icon: Pencil },
        { label: "Excluir", icon: Trash2, variant: "destructive" },
      ])
      const menu = await openMenu()
      const destructive = within(menu).getByRole("menuitem", { name: "Excluir" })
      expect(destructive).toHaveAttribute("data-variant", "destructive")
      expect(destructive).toHaveClass("text-destructive")
      const regular = within(menu).getByRole("menuitem", { name: "Editar" })
      expect(regular).toHaveAttribute("data-variant", "default")
      expect(regular).not.toHaveClass("text-destructive")
    })
  })

  describe("links", () => {
    it("renders href items as real links", async () => {
      renderMenu([{ label: "Abrir proposta", href: "/propostas/1" }])
      const menu = await openMenu()
      const link = within(menu).getByRole("menuitem", { name: "Abrir proposta" })
      expect(link.tagName).toBe("A")
      expect(link).toHaveAttribute("href", "/propostas/1")
      expect(link).not.toHaveAttribute("rel")
    })

    it("adds rel=noopener for target=_blank", async () => {
      renderMenu([{ label: "Documentação", href: "https://exemplo.com", target: "_blank" }])
      const menu = await openMenu()
      const link = within(menu).getByRole("menuitem", { name: "Documentação" })
      expect(link).toHaveAttribute("target", "_blank")
      expect(link).toHaveAttribute("rel", "noopener noreferrer")
    })

    it("drops unsafe hrefs, keeps onSelect and warns in dev", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      const onSelect = vi.fn()
      renderMenu([{ label: "Evil", href: "javascript:alert(1)", onSelect }])
      const menu = await openMenu()
      const item = within(menu).getByRole("menuitem", { name: "Evil" })
      expect(item.tagName).not.toBe("A")
      expect(menu.querySelector("a")).toBeNull()
      expect(String(warn.mock.calls[0]?.[0])).toContain("[DropdownMenu]")
      await userEvent.click(item)
      expect(onSelect).toHaveBeenCalledTimes(1)
    })

    it("does not warn for an empty href", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      renderMenu([{ label: "Nada", href: "" }])
      await openMenu()
      expect(warn).not.toHaveBeenCalled()
    })
  })

  describe("checkbox items", () => {
    it("reflects checked and reports the next value", async () => {
      const onCheckedChange = vi.fn()
      renderMenu([
        { type: "checkbox", label: "Mostrar arquivados", checked: false, onCheckedChange },
        { type: "checkbox", label: "Compacto", checked: true, onCheckedChange: () => {} },
      ])
      const menu = await openMenu()
      const unchecked = within(menu).getByRole("menuitemcheckbox", { name: "Mostrar arquivados" })
      const checked = within(menu).getByRole("menuitemcheckbox", { name: "Compacto" })
      expect(unchecked).toHaveAttribute("aria-checked", "false")
      expect(checked).toHaveAttribute("aria-checked", "true")
      expect(checked.querySelector("svg.lucide-check")).not.toBeNull()
      expect(unchecked.querySelector("svg.lucide-check")).toBeNull()

      await userEvent.click(unchecked)
      expect(onCheckedChange).toHaveBeenCalledWith(true)
      expect(screen.queryByRole("menu")).not.toBeInTheDocument()
    })

    it("stays open with keepOpen so several options can be toggled", async () => {
      function Columns() {
        const [visible, setVisible] = React.useState({ nome: true, cpf: true })
        return (
          <DropdownMenu
            trigger={<Button>Colunas</Button>}
            items={[
              {
                type: "checkbox",
                label: "Nome",
                checked: visible.nome,
                onCheckedChange: (v) => setVisible((s) => ({ ...s, nome: v })),
                keepOpen: true,
              },
              {
                type: "checkbox",
                label: "CPF",
                checked: visible.cpf,
                onCheckedChange: (v) => setVisible((s) => ({ ...s, cpf: v })),
                keepOpen: true,
              },
            ]}
          />
        )
      }
      render(<Columns />)
      const menu = await openMenu("Colunas")
      await userEvent.click(within(menu).getByRole("menuitemcheckbox", { name: "Nome" }))
      await userEvent.click(within(menu).getByRole("menuitemcheckbox", { name: "CPF" }))
      expect(screen.getByRole("menu")).toBeInTheDocument()
      expect(within(menu).getByRole("menuitemcheckbox", { name: "Nome" })).toHaveAttribute(
        "aria-checked",
        "false",
      )
      expect(within(menu).getByRole("menuitemcheckbox", { name: "CPF" })).toHaveAttribute(
        "aria-checked",
        "false",
      )
    })

    it("renders icon and shortcut on checkbox items", async () => {
      renderMenu([
        {
          type: "checkbox",
          label: "Fixar",
          icon: Copy,
          shortcut: "⌘F",
          checked: false,
          onCheckedChange: () => {},
          disabled: true,
        },
      ])
      const menu = await openMenu()
      const item = within(menu).getByRole("menuitemcheckbox", { name: /Fixar/ })
      expect(item.querySelector("svg.lucide-copy")).not.toBeNull()
      expect(within(item).getByText("⌘F")).toBeInTheDocument()
      expect(item).toHaveAttribute("aria-disabled", "true")
    })
  })

  describe("radio groups", () => {
    const options = [
      { value: "recentes", label: "Mais recentes" },
      { value: "antigos", label: "Mais antigos", icon: Copy },
      { value: "valor", label: "Maior valor", disabled: true },
    ]

    it("renders a labelled group of radios and reports the choice", async () => {
      const onValueChange = vi.fn()
      renderMenu([
        { type: "radio", label: "Ordenar por", value: "recentes", onValueChange, options },
      ])
      const menu = await openMenu()
      const group = within(menu).getByRole("group", { name: "Ordenar por" })
      const current = within(group).getByRole("menuitemradio", { name: "Mais recentes" })
      const other = within(group).getByRole("menuitemradio", { name: "Mais antigos" })
      expect(current).toHaveAttribute("aria-checked", "true")
      expect(other).toHaveAttribute("aria-checked", "false")
      expect(other.querySelector("svg.lucide-copy")).not.toBeNull()
      expect(within(group).getByRole("menuitemradio", { name: "Maior valor" })).toHaveAttribute(
        "aria-disabled",
        "true",
      )

      await userEvent.click(other)
      expect(onValueChange).toHaveBeenCalledWith("antigos")
      expect(screen.queryByRole("menu")).not.toBeInTheDocument()
    })

    it("can stay open and has no label when none is given", async () => {
      const onValueChange = vi.fn()
      renderMenu([{ type: "radio", value: "recentes", onValueChange, options, keepOpen: true }])
      const menu = await openMenu()
      const group = within(menu).getByRole("group")
      expect(group).not.toHaveAttribute("aria-labelledby")
      await userEvent.click(within(group).getByRole("menuitemradio", { name: "Mais antigos" }))
      expect(onValueChange).toHaveBeenCalledWith("antigos")
      expect(screen.getByRole("menu")).toBeInTheDocument()
    })
  })

  describe("structure", () => {
    it("renders labelled groups and separators", async () => {
      renderMenu([
        {
          type: "group",
          label: "Proposta",
          items: [{ label: "Editar" }, { label: "Duplicar" }],
        },
        { type: "separator" },
        { type: "group", items: [{ label: "Excluir", variant: "destructive" }] },
      ])
      const menu = await openMenu()
      const groups = within(menu).getAllByRole("group")
      expect(groups[0]).toHaveAccessibleName("Proposta")
      expect(within(groups[0]!).getAllByRole("menuitem")).toHaveLength(2)
      expect(groups[1]).not.toHaveAttribute("aria-labelledby")
      expect(within(menu).getByRole("separator")).toHaveClass("h-px", "bg-border")
    })

    it("opens a submenu with ArrowRight and closes it with ArrowLeft", async () => {
      const onSelect = vi.fn()
      renderMenu([
        { label: "Editar" },
        {
          type: "submenu",
          label: "Mover para",
          icon: Copy,
          items: [{ label: "Pendentes", onSelect }, { label: "Aprovadas" }],
        },
      ])
      const menu = await openMenu()
      const subTrigger = within(menu).getByRole("menuitem", { name: "Mover para" })
      expect(subTrigger).toHaveAttribute("aria-haspopup", "menu")
      expect(subTrigger.querySelector("svg.lucide-copy")).not.toBeNull()
      subTrigger.focus()
      await userEvent.keyboard("{ArrowRight}")
      const submenu = (await screen.findAllByRole("menu")).find((m) => m !== menu) as HTMLElement
      expect(submenu).toHaveAttribute("data-slot", "dropdown-menu-sub-content")
      expect(subTrigger).toHaveAttribute("aria-expanded", "true")
      await userEvent.click(within(submenu).getByRole("menuitem", { name: "Pendentes" }))
      expect(onSelect).toHaveBeenCalledTimes(1)
      expect(screen.queryByRole("menu")).not.toBeInTheDocument()
    })

    it("closes the submenu with ArrowLeft and keeps the parent open", async () => {
      renderMenu([{ type: "submenu", label: "Mover para", items: [{ label: "Pendentes" }] }])
      const menu = await openMenu()
      const subTrigger = within(menu).getByRole("menuitem", { name: "Mover para" })
      subTrigger.focus()
      await userEvent.keyboard("{ArrowRight}")
      expect(screen.getAllByRole("menu")).toHaveLength(2)
      await userEvent.keyboard("{ArrowLeft}")
      expect(screen.getAllByRole("menu")).toHaveLength(1)
      expect(subTrigger).toHaveFocus()
    })

    it("disables a submenu trigger", async () => {
      renderMenu([
        { type: "submenu", label: "Mover para", disabled: true, items: [{ label: "Pendentes" }] },
      ])
      const menu = await openMenu()
      expect(within(menu).getByRole("menuitem", { name: "Mover para" })).toHaveAttribute(
        "aria-disabled",
        "true",
      )
    })

    it("uses ids as keys and needs none for static lists", async () => {
      const error = vi.spyOn(console, "error").mockImplementation(() => {})
      renderMenu([
        { id: "a", label: "Editar" },
        { label: "Duplicar" },
        { type: "separator" },
        { type: "separator" },
      ])
      await openMenu()
      const keyWarnings = error.mock.calls.filter((c) => String(c[0]).includes("key"))
      expect(keyWarnings).toHaveLength(0)
    })
  })

  describe("keyboard", () => {
    it("moves with arrows and wraps around", async () => {
      renderMenu([{ label: "Editar" }, { label: "Duplicar" }, { label: "Excluir" }])
      screen.getByRole("button", { name: "Ações" }).focus()
      await userEvent.keyboard("{Enter}")
      expect(screen.getByRole("menuitem", { name: "Editar" })).toHaveFocus()
      await userEvent.keyboard("{ArrowDown}")
      expect(screen.getByRole("menuitem", { name: "Duplicar" })).toHaveFocus()
      await userEvent.keyboard("{ArrowUp}{ArrowUp}")
      expect(screen.getByRole("menuitem", { name: "Excluir" })).toHaveFocus()
    })

    it("closes on Escape and returns focus to the trigger", async () => {
      renderMenu([{ label: "Editar" }])
      await openMenu()
      await userEvent.keyboard("{Escape}")
      expect(screen.queryByRole("menu")).not.toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Ações" })).toHaveFocus()
    })
  })

  describe("state and placement", () => {
    it("can be controlled", async () => {
      const onOpenChange = vi.fn()
      const { rerender } = renderMenu([{ label: "Editar" }], { open: false, onOpenChange })
      await userEvent.click(screen.getByRole("button", { name: "Ações" }))
      expect(onOpenChange).toHaveBeenCalledWith(true)
      expect(screen.queryByRole("menu")).not.toBeInTheDocument()

      rerender(
        <DropdownMenu
          trigger={<Button>Ações</Button>}
          items={[{ label: "Editar" }]}
          open
          onOpenChange={onOpenChange}
        />,
      )
      expect(screen.getByRole("menu")).toBeInTheDocument()
    })

    it("starts open with defaultOpen", () => {
      renderMenu([{ label: "Editar" }], { defaultOpen: true })
      expect(screen.getByRole("menu")).toBeInTheDocument()
    })

    it("opens below, aligned to the start, by default", () => {
      renderMenu([{ label: "Editar" }], { defaultOpen: true })
      const content = screen.getByRole("menu")
      expect(content).toHaveAttribute("data-side", "bottom")
      expect(content).toHaveAttribute("data-align", "start")
    })

    it("honours side, align and className", () => {
      renderMenu([{ label: "Editar" }], {
        defaultOpen: true,
        side: "top",
        align: "end",
        className: "w-64",
      })
      const content = screen.getByRole("menu")
      expect(content).toHaveAttribute("data-side", "top")
      expect(content).toHaveAttribute("data-align", "end")
      expect(content).toHaveClass("w-64", "bg-popover", "border", "rounded-md")
    })

    it("locks the page while open by default, but not with modal={false}", async () => {
      const { unmount } = renderMenu([{ label: "Editar" }])
      await openMenu()
      expect(document.body.style.pointerEvents).toBe("none")
      unmount()

      renderMenu([{ label: "Editar" }], { modal: false })
      await openMenu()
      expect(document.body.style.pointerEvents).not.toBe("none")
    })
  })
})
