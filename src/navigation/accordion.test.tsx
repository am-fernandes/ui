import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Accordion } from "./accordion"

describe("Accordion", () => {
  it("renders titles and expands content on click", async () => {
    render(
      <Accordion
        type="single"
        collapsible
        items={[
          { value: "a", title: "Pergunta 1", content: "Resposta 1" },
          { value: "b", title: "Pergunta 2", content: "Resposta 2" },
          { value: "c", title: "Pergunta 3", content: "Resposta 3" },
        ]}
      />,
    )
    expect(screen.getByText("Pergunta 1")).toBeInTheDocument()
    expect(screen.getByText("Pergunta 2")).toBeInTheDocument()
    expect(screen.getByText("Pergunta 3")).toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: "Pergunta 2" }))
    expect(screen.getByText("Resposta 2")).toBeVisible()
  })

  it('supports type="multiple" — multiple items can be open at once', async () => {
    render(
      <Accordion
        type="multiple"
        items={[
          { value: "a", title: "One", content: "Content one" },
          { value: "b", title: "Two", content: "Content two" },
        ]}
      />,
    )

    await userEvent.click(screen.getByRole("button", { name: "One" }))
    await userEvent.click(screen.getByRole("button", { name: "Two" }))

    expect(screen.getByText("Content one")).toBeVisible()
    expect(screen.getByText("Content two")).toBeVisible()
  })

  it("controlled (single) — calls onValueChange when toggled", async () => {
    const onValueChange = vi.fn()
    render(
      <Accordion
        type="single"
        collapsible
        value="a"
        onValueChange={onValueChange}
        items={[
          { value: "a", title: "A", content: "AC" },
          { value: "b", title: "B", content: "BC" },
        ]}
      />,
    )

    await userEvent.click(screen.getByRole("button", { name: "B" }))
    expect(onValueChange).toHaveBeenCalledWith("b")
  })

  it("disabled item is not clickable", () => {
    render(
      <Accordion
        type="single"
        collapsible
        items={[
          { value: "a", title: "Enabled", content: "EC" },
          { value: "b", title: "Disabled", content: "DC", disabled: true },
        ]}
      />,
    )

    const disabledTrigger = screen.getByRole("button", { name: "Disabled" })
    expect(disabledTrigger).toBeDisabled()
    expect(disabledTrigger.getAttribute("data-state")).toBe("closed")
  })

  it("disabled item looks disabled: dimmed once, default cursor, no hover underline", () => {
    const { container } = render(
      <Accordion
        type="single"
        collapsible
        items={[
          { value: "a", title: "Enabled", content: "EC" },
          { value: "b", title: "Disabled", content: "DC", disabled: true },
        ]}
      />,
    )
    const [enabledItem, disabledItem] = container.querySelectorAll('[data-slot="accordion-item"]')
    expect(disabledItem).toHaveAttribute("data-disabled")
    expect(disabledItem).toHaveClass("data-[disabled]:opacity-50")
    const trigger = screen.getByRole("button", { name: "Disabled" })
    expect(trigger).toHaveClass("disabled:cursor-default")
    expect(trigger).not.toHaveClass("hover:underline")
    expect(trigger.className).toContain("enabled:hover:underline")
    expect(enabledItem).not.toHaveAttribute("data-disabled")
  })

  it("disabled item does not expand on click", async () => {
    render(
      <Accordion
        type="single"
        collapsible
        items={[
          { value: "a", title: "Available", content: "Open content" },
          { value: "b", title: "Locked", content: "Hidden content", disabled: true },
        ]}
      />,
    )

    const lockedTrigger = screen.getByRole("button", { name: "Locked" })
    await userEvent.click(lockedTrigger)
    expect(lockedTrigger.getAttribute("data-state")).toBe("closed")
    expect(screen.queryByText("Hidden content")).not.toBeInTheDocument()
  })

  it("renders item.action next to the trigger and clicks fire independently", async () => {
    const onAction = vi.fn()
    const onValueChange = vi.fn()
    render(
      <Accordion
        type="single"
        collapsible
        onValueChange={onValueChange}
        items={[
          {
            value: "a",
            title: "Removable",
            content: "Body",
            action: (
              <button type="button" aria-label="Remover Removable" onClick={onAction}>
                X
              </button>
            ),
          },
        ]}
      />,
    )

    await userEvent.click(screen.getByRole("button", { name: "Remover Removable" }))
    expect(onAction).toHaveBeenCalledTimes(1)
    // Action click should NOT bubble into the accordion trigger.
    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.getByRole("button", { name: "Removable" }).getAttribute("data-state")).toBe(
      "closed",
    )
  })

  it("renders an action slot with the accordion-action data-slot", () => {
    const { container } = render(
      <Accordion
        type="single"
        collapsible
        items={[
          {
            value: "a",
            title: "T",
            content: "C",
            action: <span data-testid="custom-action">Act</span>,
          },
        ]}
      />,
    )
    expect(container.querySelector('[data-slot="accordion-action"]')).toBeTruthy()
    expect(screen.getByTestId("custom-action")).toBeInTheDocument()
  })

  it("respects defaultValue (single) — item starts open", () => {
    render(
      <Accordion
        type="single"
        collapsible
        defaultValue="b"
        items={[
          { value: "a", title: "First", content: "FC" },
          { value: "b", title: "Second", content: "SC" },
        ]}
      />,
    )
    expect(screen.getByRole("button", { name: "Second" }).getAttribute("data-state")).toBe("open")
    expect(screen.getByRole("button", { name: "First" }).getAttribute("data-state")).toBe("closed")
  })

  it("keyboard arrow navigation moves focus across triggers", async () => {
    render(
      <Accordion
        type="single"
        collapsible
        items={[
          { value: "a", title: "First", content: "FC" },
          { value: "b", title: "Second", content: "SC" },
          { value: "c", title: "Third", content: "TC" },
        ]}
      />,
    )

    const first = screen.getByRole("button", { name: "First" })
    first.focus()
    expect(first).toHaveFocus()

    await userEvent.keyboard("{ArrowDown}")
    expect(screen.getByRole("button", { name: "Second" })).toHaveFocus()

    await userEvent.keyboard("{ArrowDown}")
    expect(screen.getByRole("button", { name: "Third" })).toHaveFocus()
  })

  describe("keepMounted", () => {
    const formItems = [
      { value: "dados", title: "Dados", content: <input aria-label="Nome" /> },
      { value: "endereco", title: "Endereço", content: <input aria-label="CEP" /> },
    ]

    it("by default unmounts a closed section", async () => {
      render(<Accordion type="single" collapsible defaultValue="dados" items={formItems} />)
      expect(screen.getByRole("textbox", { name: "Nome" })).toBeInTheDocument()
      expect(screen.queryByLabelText("CEP")).not.toBeInTheDocument()
    })

    it("keeps closed sections in the DOM, hidden, with what was typed", async () => {
      render(
        <Accordion type="single" collapsible keepMounted defaultValue="dados" items={formItems} />,
      )
      expect(screen.getByLabelText("CEP")).not.toBeVisible()
      await userEvent.type(screen.getByRole("textbox", { name: "Nome" }), "Maria")
      await userEvent.click(screen.getByRole("button", { name: "Endereço" }))
      expect(screen.getByRole("textbox", { name: "CEP" })).toBeVisible()
      expect(screen.getByLabelText("Nome")).not.toBeVisible()
      await userEvent.click(screen.getByRole("button", { name: "Dados" }))
      expect(screen.getByRole("textbox", { name: "Nome" })).toHaveValue("Maria")
    })

    it("keeps the trigger and its region linked", async () => {
      render(<Accordion type="multiple" keepMounted items={formItems} />)
      const trigger = screen.getByRole("button", { name: "Endereço" })
      expect(trigger).toHaveAttribute("aria-expanded", "false")
      await userEvent.click(trigger)
      expect(trigger).toHaveAttribute("aria-expanded", "true")
      const region = screen.getByRole("region", { name: "Endereço" })
      expect(trigger).toHaveAttribute("aria-controls", region.id)
      expect(region).toContainElement(screen.getByLabelText("CEP"))
    })

    it("still reports changes when controlled", async () => {
      const onValueChange = vi.fn()
      render(
        <Accordion
          type="single"
          keepMounted
          value="dados"
          onValueChange={onValueChange}
          items={formItems}
        />,
      )
      await userEvent.click(screen.getByRole("button", { name: "Endereço" }))
      expect(onValueChange).toHaveBeenCalledWith("endereco")
      // Controlled: nothing moves until the value does.
      expect(screen.getByLabelText("CEP")).not.toBeVisible()
    })
  })

  it("applies data-slot attributes", () => {
    const { container } = render(
      <Accordion type="single" collapsible items={[{ value: "a", title: "T", content: "C" }]} />,
    )
    expect(container.querySelector('[data-slot="accordion"]')).toBeTruthy()
    expect(container.querySelector('[data-slot="accordion-item"]')).toBeTruthy()
    expect(container.querySelector('[data-slot="accordion-trigger"]')).toBeTruthy()
    expect(container.querySelector('[data-slot="accordion-content"]')).toBeTruthy()
  })
})
