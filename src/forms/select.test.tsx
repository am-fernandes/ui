import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Dialog } from "../overlays/dialog"
import { Select, type SelectGroup, type SelectOption } from "./select"

// Radix Select uses pointer capture, which jsdom lacks.
beforeAll(() => {
  const proto = Element.prototype as unknown as Record<string, unknown>
  proto.hasPointerCapture ??= () => false
  proto.setPointerCapture ??= () => {}
  proto.releasePointerCapture ??= () => {}
})

const estagios: SelectOption[] = [
  { value: "novo", label: "Novo" },
  { value: "contato", label: "Em contato" },
  { value: "visita", label: "Visita agendada" },
  { value: "perdido", label: "Perdido", disabled: true },
]

const imoveis: SelectGroup[] = [
  { label: "Residencial", options: [{ value: "casa", label: "Casa" }] },
  { label: "Comercial", options: [{ value: "loja", label: "Loja" }] },
]

describe("Select", () => {
  it("renders with its label and the placeholder", () => {
    render(<Select options={estagios} label="Estágio" />)
    const trigger = screen.getByRole("combobox", { name: "Estágio" })
    expect(trigger).toHaveTextContent("Selecione…")
    expect(trigger).toHaveAttribute("data-placeholder")
  })

  it("points aria-describedby at the description and the error, and marks it invalid", () => {
    render(
      <Select
        options={estagios}
        label="Estágio"
        description="Onde a negociação está."
        error="Escolha o estágio."
        aria-describedby="dica-externa"
      />,
    )
    const trigger = screen.getByRole("combobox", { name: "Estágio" })
    expect(trigger).toHaveAttribute("aria-invalid", "true")
    expect(trigger).toHaveAccessibleDescription("Onde a negociação está. Escolha o estágio.")
    expect(trigger.getAttribute("aria-describedby")).toContain("dica-externa")
    expect(screen.getByRole("alert")).toHaveTextContent("Escolha o estágio.")
  })

  it("is required with an asterisk and aria-required, said once", () => {
    render(<Select options={estagios} label="Estágio" required />)
    const trigger = screen.getByRole("combobox", { name: "Estágio" })
    // aria-required says "required"; the asterisk is drawn, not read.
    expect(trigger).toHaveAttribute("aria-required", "true")
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true")
    expect(screen.queryByText("obrigatório")).toBeNull()
  })

  it("chooses an option with the mouse and reports it", async () => {
    const onValueChange = vi.fn()
    render(<Select options={estagios} label="Estágio" onValueChange={onValueChange} />)
    await userEvent.click(screen.getByRole("combobox", { name: "Estágio" }))
    await userEvent.click(await screen.findByRole("option", { name: "Visita agendada" }))
    expect(onValueChange).toHaveBeenCalledWith("visita")
    expect(screen.getByRole("combobox", { name: "Estágio" })).toHaveTextContent("Visita agendada")
  })

  it("opens from the keyboard and marks the chosen option with a check", async () => {
    render(<Select options={estagios} label="Estágio" defaultValue="contato" />)
    const trigger = screen.getByRole("combobox", { name: "Estágio" })
    trigger.focus()
    await userEvent.keyboard("{Enter}")
    const chosen = await screen.findByRole("option", { name: "Em contato" })
    expect(chosen).toHaveAttribute("aria-selected", "true")
    expect(chosen.querySelector("svg")).not.toBeNull()
    expect(screen.getByRole("option", { name: "Novo" }).querySelector("svg")).toBeNull()
    expect(screen.getByRole("option", { name: "Perdido" })).toHaveAttribute("data-disabled")
  })

  it("is controlled by value", async () => {
    function Controlled() {
      const [value, setValue] = React.useState("novo")
      return (
        <>
          <Select options={estagios} label="Estágio" value={value} onValueChange={setValue} />
          <output>{value}</output>
        </>
      )
    }
    render(<Controlled />)
    await userEvent.click(screen.getByRole("combobox", { name: "Estágio" }))
    await userEvent.click(await screen.findByRole("option", { name: "Em contato" }))
    expect(screen.getByRole("status")).toHaveTextContent("contato")
  })

  it("shows group headings", async () => {
    render(<Select options={imoveis} label="Tipo" />)
    await userEvent.click(screen.getByRole("combobox", { name: "Tipo" }))
    const groups = await screen.findAllByRole("group")
    expect(groups.map((g) => g.textContent)).toEqual(["ResidencialCasa", "ComercialLoja"])
  })

  it("disabled: the trigger does not open", async () => {
    render(<Select options={estagios} label="Estágio" disabled />)
    const trigger = screen.getByRole("combobox", { name: "Estágio" })
    expect(trigger).toBeDisabled()
    await userEvent.click(trigger)
    expect(screen.queryByRole("listbox")).toBeNull()
  })

  it("readOnly: focusable and marked, but neither opens nor changes from typing", async () => {
    const onValueChange = vi.fn()
    render(
      <form>
        <Select
          options={estagios}
          label="Estágio"
          name="estagio"
          defaultValue="contato"
          readOnly
          onValueChange={onValueChange}
        />
      </form>,
    )
    const trigger = screen.getByRole("combobox", { name: "Estágio" })
    expect(trigger).toHaveAttribute("aria-readonly", "true")
    expect(trigger).toHaveAttribute("data-readonly")
    trigger.focus()
    expect(trigger).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    await userEvent.keyboard("v")
    await userEvent.click(trigger)
    expect(screen.queryByRole("listbox")).toBeNull()
    expect(onValueChange).not.toHaveBeenCalled()
    expect(trigger).toHaveTextContent("Em contato")
    // Still sent with the form.
    const form = trigger.closest("form") as HTMLFormElement
    expect(new FormData(form).get("estagio")).toBe("contato")
  })

  it("sends nothing until a choice is made, then the value", async () => {
    render(
      <form>
        <Select options={estagios} label="Estágio" name="estagio" />
      </form>,
    )
    const form = screen
      .getByRole("combobox", { name: "Estágio" })
      .closest("form") as HTMLFormElement
    // No value before a choice. (A browser leaves the field out entirely,
    // checked in the e2e test; jsdom sends the disabled empty option as "".)
    expect(new FormData(form).get("estagio") ?? "").toBe("")
    await userEvent.click(screen.getByRole("combobox", { name: "Estágio" }))
    await userEvent.click(await screen.findByRole("option", { name: "Novo" }))
    expect(new FormData(form).get("estagio")).toBe("novo")
  })

  it("lets the browser check required on the native select", () => {
    const { container } = render(
      <form>
        <Select options={estagios} label="Estágio" name="estagio" required />
      </form>,
    )
    const native = container.querySelector('[data-slot="select-native"]') as HTMLSelectElement
    expect(native.checkValidity()).toBe(false)
    expect(native).toHaveAttribute("aria-hidden", "true")
    expect(native).toHaveAttribute("tabindex", "-1")
  })

  it("goes back to defaultValue on a form reset", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { container } = render(
      <form>
        <Select options={estagios} label="Estágio" name="estagio" defaultValue="contato" />
      </form>,
    )
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const trigger = screen.getByRole("combobox", { name: "Estágio" })
    await user.click(trigger)
    await user.click(await screen.findByRole("option", { name: "Novo" }))
    const form = container.querySelector("form") as HTMLFormElement
    expect(new FormData(form).get("estagio")).toBe("novo")
    fireEvent.reset(form)
    form.reset()
    vi.runAllTimers()
    await waitFor(() => expect(trigger).toHaveTextContent("Em contato"))
    expect(new FormData(form).get("estagio")).toBe("contato")
    vi.useRealTimers()
  })

  it("forwards the ref to the trigger button", () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<Select options={estagios} label="Estágio" ref={ref} />)
    expect(ref.current).toBe(screen.getByRole("combobox", { name: "Estágio" }))
  })

  it("has the field trigger height of its size", () => {
    const { rerender } = render(<Select options={estagios} label="Estágio" size="sm" />)
    expect(screen.getByRole("combobox")).toHaveClass("h-control-sm")
    rerender(<Select options={estagios} label="Estágio" size="lg" />)
    expect(screen.getByRole("combobox")).toHaveClass("h-control-lg")
  })

  it("choosing inside a Dialog does not close the Dialog", async () => {
    render(
      <Dialog open title="Dados do imóvel" onOpenChange={() => {}}>
        <Select options={estagios} label="Estágio" />
      </Dialog>,
    )
    await userEvent.click(screen.getByRole("combobox", { name: "Estágio" }))
    await userEvent.click(await screen.findByRole("option", { name: "Novo" }))
    expect(screen.getByRole("dialog", { name: "Dados do imóvel" })).toBeInTheDocument()
    expect(screen.getByRole("combobox", { name: "Estágio" })).toHaveTextContent("Novo")
  })

  it("sends a value that is not among the options, not the first option", () => {
    render(
      <form aria-label="negociação">
        <Select options={estagios} label="Estágio" name="estagio" value="arquivado" />
      </form>,
    )
    const form = screen.getByRole<HTMLFormElement>("form")
    expect(new FormData(form).get("estagio")).toBe("arquivado")
  })
})
