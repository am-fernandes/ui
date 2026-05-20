import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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

  it("applies focus-visible ring classes", () => {
    render(<Button>x</Button>)
    const btn = screen.getByRole("button")
    expect(btn.className).toMatch(/focus-visible:ring/)
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
