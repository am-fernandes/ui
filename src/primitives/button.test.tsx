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

  it("fires onClick", async () => {
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

  it("emits data-slot=button", () => {
    render(<Button>X</Button>)
    expect(screen.getByRole("button")).toHaveAttribute("data-slot", "button")
  })

  it("size=icon applies square dimensions (h-9 w-9)", () => {
    render(<Button size="icon">i</Button>)
    const btn = screen.getByRole("button")
    expect(btn).toHaveClass("h-9")
    expect(btn).toHaveClass("w-9")
  })

  it("asChild renders as the underlying element (anchor)", () => {
    render(
      <Button asChild>
        <a href="/somewhere">Link</a>
      </Button>,
    )
    const link = screen.getByRole("link", { name: "Link" })
    expect(link).toBeInTheDocument()
    expect(link.tagName).toBe("A")
    expect(link).toHaveAttribute("href", "/somewhere")
    expect(link).toHaveAttribute("data-slot", "button")
  })

  it("merges focus-ring base classes", () => {
    render(<Button>X</Button>)
    const btn = screen.getByRole("button")
    expect(btn).toHaveClass("focus-visible:ring-2")
    expect(btn).toHaveClass("focus-visible:ring-ring")
    expect(btn).toHaveClass("focus-visible:ring-offset-2")
  })
})
