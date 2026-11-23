import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { Button } from "./button"

describe("Button", () => {
  it("renders children as accessible name", () => {
    render(<Button>Salvar</Button>)
    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument()
  })

  it("applies destructive variant class", () => {
    render(<Button variant="destructive">Excluir</Button>)
    expect(screen.getByRole("button")).toHaveClass("bg-destructive")
  })

  it("renders a spinner and disables when loading", () => {
    render(<Button loading>Salvar</Button>)
    const btn = screen.getByRole("button", { name: /Salvar/ })
    expect(btn).toBeDisabled()
    expect(btn.querySelector("svg.animate-spin")).toBeInTheDocument()
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
      "hover:bg-primary-hover",
      "active:bg-primary-pressed",
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
