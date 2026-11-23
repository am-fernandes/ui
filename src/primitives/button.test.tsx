import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type * as React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { Button, buttonVariants, defaultButtonLabels } from "./button"

describe("Button", () => {
  it("renders children as accessible name", () => {
    render(<Button>Salvar</Button>)
    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument()
  })

  it("applies destructive variant class", () => {
    render(<Button variant="destructive">Excluir</Button>)
    expect(screen.getByRole("button")).toHaveClass("bg-destructive")
  })

  // Focus kept in a real browser, the width and the Enter key in a text field
  // are asserted by tests/e2e/primitives.spec.ts.
  describe("loading", () => {
    const announcer = () => document.querySelector('[data-slot="live-announcer"]')
    // The page keeps one announcer: start each test without the last message.
    beforeEach(() => announcer()?.remove())

    it("is busy and unavailable, but not natively disabled, so it keeps the focus", () => {
      const { rerender } = render(<Button>Salvar</Button>)
      const btn = screen.getByRole("button", { name: "Salvar" })
      btn.focus()
      rerender(<Button loading>Salvar</Button>)
      expect(btn).not.toHaveAttribute("disabled")
      expect(btn).toHaveAttribute("aria-disabled", "true")
      expect(btn).toHaveAttribute("aria-busy", "true")
      expect(btn).toHaveAttribute("data-loading")
      expect(btn).toHaveFocus()
    })

    it("carries none of that when it is not loading", () => {
      render(<Button loading={false}>Salvar</Button>)
      const btn = screen.getByRole("button", { name: "Salvar" })
      expect(btn).not.toHaveAttribute("aria-disabled")
      expect(btn).not.toHaveAttribute("aria-busy")
      expect(btn).not.toHaveAttribute("data-loading")
      expect(btn.querySelector('[data-slot="button-spinner"]')).toBeNull()
    })

    it("shows the spinner over the label, which keeps its place and stays the name", () => {
      render(<Button loading>Salvar proposta</Button>)
      const btn = screen.getByRole("button", { name: "Salvar proposta" })
      const spinner = btn.querySelector('[data-slot="button-spinner"]')
      expect(spinner).toHaveAttribute("aria-hidden", "true")
      expect(spinner?.querySelector("svg.animate-spin")).toBeInTheDocument()
      // The label is still laid out (it gives the button its width), only unseen.
      const content = btn.querySelector('[data-slot="button-content"]')
      expect(content).toHaveTextContent("Salvar proposta")
      expect(content).toHaveClass("opacity-0")
    })

    it("ignores clicks, Enter and Space", async () => {
      const onClick = vi.fn()
      render(
        <Button loading onClick={onClick}>
          Salvar
        </Button>,
      )
      const btn = screen.getByRole("button", { name: "Salvar" })
      await userEvent.click(btn)
      btn.focus()
      await userEvent.keyboard("{Enter}")
      await userEvent.keyboard(" ")
      expect(onClick).not.toHaveBeenCalled()
    })

    it("does not submit the form while loading", async () => {
      const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault())
      render(
        <form onSubmit={onSubmit}>
          <Button type="submit" loading>
            Salvar
          </Button>
        </form>,
      )
      await userEvent.click(screen.getByRole("button", { name: "Salvar" }))
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it("does not let the click reach a row or a card around it", async () => {
      const onRowClick = vi.fn()
      render(
        // biome-ignore lint/a11y/useKeyWithClickEvents: only the bubbling matters here.
        <div onClick={onRowClick}>
          <Button loading>Salvar</Button>
        </div>,
      )
      await userEvent.click(screen.getByRole("button", { name: "Salvar" }))
      expect(onRowClick).not.toHaveBeenCalled()
    })

    it("announces that it started loading, once, and not on mount", async () => {
      const { rerender } = render(<Button loading>Já carregando</Button>)
      await new Promise((resolve) => setTimeout(resolve, 150))
      expect(announcer()?.textContent ?? "").toBe("")

      rerender(<Button loading={false}>Salvar</Button>)
      rerender(<Button loading>Salvar</Button>)
      await waitFor(() => expect(announcer()).toHaveTextContent("Carregando…"))
      // Polite, and no `role="status"`: it must not show up in a consumer's
      // getByRole("status").
      expect(announcer()).toHaveAttribute("aria-live", "polite")
      expect(screen.queryByRole("status")).not.toBeInTheDocument()
    })

    it("announces with the label the product gives", async () => {
      const { rerender } = render(<Button labels={{ loading: "Salvando proposta" }}>Salvar</Button>)
      rerender(
        <Button loading labels={{ loading: "Salvando proposta" }}>
          Salvar
        </Button>,
      )
      await waitFor(() => expect(announcer()).toHaveTextContent("Salvando proposta"))
      expect(defaultButtonLabels.loading).toBe("Carregando…")
    })

    it("stays natively disabled when `disabled` is passed as well", () => {
      render(
        <Button loading disabled>
          Salvar
        </Button>,
      )
      const btn = screen.getByRole("button", { name: "Salvar" })
      expect(btn).toBeDisabled()
      expect(btn).toHaveAttribute("aria-busy", "true")
    })
  })

  it("fires onClick when enabled", async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    await userEvent.click(screen.getByRole("button"))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it("disabled prevents click", async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Click
      </Button>,
    )
    await userEvent.click(screen.getByRole("button"))
    expect(onClick).not.toHaveBeenCalled()
  })

  describe("inside a form", () => {
    function renderForm(children: React.ReactNode) {
      const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault())
      render(<form onSubmit={onSubmit}>{children}</form>)
      return onSubmit
    }

    it("does not submit unless asked to: the default type is button", async () => {
      const onClick = vi.fn()
      const onSubmit = renderForm(<Button onClick={onClick}>Cancelar</Button>)
      const button = screen.getByRole("button", { name: "Cancelar" })
      expect(button).toHaveAttribute("type", "button")
      await userEvent.click(button)
      expect(onClick).toHaveBeenCalledOnce()
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it("submits with type=submit", async () => {
      const onSubmit = renderForm(<Button type="submit">Salvar</Button>)
      await userEvent.click(screen.getByRole("button", { name: "Salvar" }))
      expect(onSubmit).toHaveBeenCalledOnce()
    })

    it("resets with type=reset", () => {
      renderForm(<Button type="reset">Limpar</Button>)
      expect(screen.getByRole("button", { name: "Limpar" })).toHaveAttribute("type", "reset")
    })

    it("puts no type on the child when asChild renders a link", () => {
      renderForm(
        <Button asChild>
          <a href="/x">link</a>
        </Button>,
      )
      expect(screen.getByRole("link", { name: "link" })).not.toHaveAttribute("type")
    })
  })

  // The measured heights (32, 40 and 44px, border included, in every variant)
  // are asserted in a real browser by tests/e2e/control-size.spec.ts.
  describe("size", () => {
    const VARIANTS = ["default", "destructive", "outline", "secondary", "ghost", "link"] as const

    it("takes the height of the shared control sizes, md by default", () => {
      const { rerender } = render(<Button>x</Button>)
      const button = () => screen.getByRole("button")
      expect(button()).toHaveClass("h-control-md", "px-3")
      expect(button().className).not.toMatch(/(^|\s)py-/)

      rerender(<Button size="sm">x</Button>)
      expect(button()).toHaveClass("h-control-sm", "px-2.5")
      expect(button()).not.toHaveClass("h-control-md")

      rerender(<Button size="lg">x</Button>)
      expect(button()).toHaveClass("h-control-lg", "px-4")
    })

    it.each(VARIANTS)("gives the %s variant the same box, border included", (variant) => {
      render(<Button variant={variant}>x</Button>)
      expect(screen.getByRole("button")).toHaveClass("h-control-md", "border")
    })

    it("draws the border only on outline", () => {
      const { rerender } = render(<Button variant="outline">x</Button>)
      expect(screen.getByRole("button")).toHaveClass("border-input")
      expect(screen.getByRole("button")).not.toHaveClass("border-transparent")
      rerender(<Button>x</Button>)
      expect(screen.getByRole("button")).toHaveClass("border-transparent")
    })

    it("lets a className height replace the control height", () => {
      render(<Button className="h-8">x</Button>)
      expect(screen.getByRole("button")).toHaveClass("h-8")
      expect(screen.getByRole("button")).not.toHaveClass("h-control-md")
    })

    it("buttonVariants() alone is the md button, with one border colour per variant", () => {
      expect(buttonVariants().split(" ")).toEqual(
        expect.arrayContaining(["h-control-md", "px-3", "border", "border-transparent"]),
      )
      const outline = buttonVariants({ variant: "outline", size: "sm" }).split(" ")
      expect(outline).toEqual(expect.arrayContaining(["h-control-sm", "border-input"]))
      // No tailwind-merge needed to tell which border colour wins.
      expect(outline).not.toContain("border-transparent")
    })
  })

  it("renders as child with asChild (Slot)", () => {
    render(
      <Button asChild>
        <a href="/x">link</a>
      </Button>,
    )
    const link = screen.getByRole("link", { name: "link" })
    expect(link).toBeInTheDocument()
    expect(link.tagName).toBe("A")
    expect(link).toHaveAttribute("data-slot", "button")
  })

  it("uses the system focus ring, and its own hover and pressed tones on the primary", () => {
    render(<Button>x</Button>)
    expect(screen.getByRole("button")).toHaveClass(
      "focus-visible:focus-outline",
      "not-aria-disabled:hover:bg-primary-hover",
      "not-aria-disabled:active:bg-primary-pressed",
    )
  })

  it("keeps the state layer on the other variants", () => {
    render(<Button variant="outline">x</Button>)
    expect(screen.getByRole("button")).toHaveClass("state-layer", "bg-card")
  })

  it("forwards ref", () => {
    let captured: HTMLButtonElement | null = null
    render(
      <Button
        ref={(el) => {
          captured = el
        }}
      >
        x
      </Button>,
    )
    expect(captured).toBeInstanceOf(HTMLButtonElement)
  })
})
