import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { Button, buttonVariants } from "./button"

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
