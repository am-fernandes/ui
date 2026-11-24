import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { AlertDialog } from "./alert-dialog"
import { Collapsible } from "./collapsible"
import { Dialog } from "./dialog"
import { DropdownMenu } from "./dropdown-menu"
import { Popover } from "./popover"
import { Sheet } from "./sheet"
import { Tooltip } from "./tooltip"

// `trigger` is typed ReactNode, but Radix's Slot renders nothing for text:
// trigger="Abrir" gave an empty page, with no error.
describe("a trigger given as text", () => {
  it.each([
    ["Dialog", <Dialog key="d" trigger="Abrir" title="Editar" />, "dialog"],
    ["Sheet", <Sheet key="s" trigger="Abrir" title="Filtros" />, "dialog"],
    [
      "AlertDialog",
      <AlertDialog key="a" trigger="Abrir" title="Excluir?" onConfirm={() => {}} />,
      "alertdialog",
    ],
    [
      "Popover",
      <Popover key="p" trigger="Abrir" aria-label="Filtros">
        conteúdo
      </Popover>,
      "dialog",
    ],
    [
      "DropdownMenu",
      <DropdownMenu key="m" trigger="Abrir" items={[{ label: "Editar" }]} />,
      "menu",
    ],
  ] as const)("%s renders it as a button that opens it", async (_, element, role) => {
    render(element)
    const button = screen.getByRole("button", { name: "Abrir" })
    await userEvent.click(button)
    expect(await screen.findByRole(role)).toBeInTheDocument()
  })

  it("Collapsible renders it as a button that toggles it", async () => {
    render(
      <Collapsible trigger="Detalhes">
        <p>conteúdo</p>
      </Collapsible>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Detalhes" }))
    expect(screen.getByText("conteúdo")).toBeInTheDocument()
  })

  it("Tooltip on a word: the text is shown and reachable with Tab", async () => {
    render(<Tooltip content="Imposto sobre a transmissão de bens imóveis">ITBI</Tooltip>)
    expect(screen.getByText("ITBI")).toBeInTheDocument()
    await userEvent.tab()
    expect(screen.getByText("ITBI")).toHaveFocus()
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Imposto sobre a transmissão")
  })
})
