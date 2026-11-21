import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MapPin } from "lucide-react"
import * as React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Token, type TokenColor, defaultTokenLabels } from "./token"

const COLORS: TokenColor[] = [
  "gray",
  "red",
  "orange",
  "yellow",
  "green",
  "teal",
  "blue",
  "purple",
  "pink",
]

const root = (container: HTMLElement) =>
  container.querySelector('[data-slot="token"]') as HTMLElement

describe("Token", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("renders a static label by default", () => {
    const { container } = render(<Token label="São Paulo" />)
    const token = root(container)
    expect(token.tagName).toBe("SPAN")
    expect(token).toHaveTextContent("São Paulo")
    expect(token).toHaveAttribute("data-color", "gray")
    expect(token).toHaveAttribute("data-size", "md")
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  })

  it.each(COLORS)("uses the categorical tokens for %s", (color) => {
    const { container } = render(<Token label="X" color={color} icon={MapPin} />)
    const token = root(container)
    expect(token).toHaveClass(
      `bg-category-${color}-bg`,
      `text-category-${color}-text`,
      `border-category-${color}-solid/30`,
    )
    expect(token.querySelector("svg")).toHaveClass(`text-category-${color}-solid`)
  })

  it("sizes the chip, the icon and the remove button", () => {
    const { container, rerender } = render(<Token label="X" icon={MapPin} onRemove={() => {}} />)
    expect(root(container)).toHaveClass("h-7", "text-sm")
    expect(root(container).querySelector("svg.lucide-map-pin")).toHaveClass("size-4")
    expect(screen.getByRole("button", { name: "Remover X" })).toHaveClass("size-5")

    rerender(<Token label="X" size="sm" icon={MapPin} onRemove={() => {}} />)
    expect(root(container)).toHaveClass("h-6", "text-xs")
    expect(root(container)).toHaveAttribute("data-size", "sm")
    expect(root(container).querySelector("svg.lucide-map-pin")).toHaveClass("size-3.5")
    expect(screen.getByRole("button", { name: "Remover X" })).toHaveClass("size-4")
  })

  it("hides the icon from assistive tech", () => {
    const { container } = render(<Token label="X" icon={MapPin} />)
    expect(container.querySelector("svg.lucide-map-pin")).toHaveAttribute("aria-hidden", "true")
  })

  it("merges className and forwards the ref", () => {
    const ref = React.createRef<HTMLSpanElement>()
    const { container } = render(<Token label="X" className="ml-2" ref={ref} />)
    expect(root(container)).toHaveClass("ml-2", "rounded-md")
    expect(ref.current).toBe(root(container))
  })

  describe("remove", () => {
    it("renders an × button named after the label", async () => {
      const onRemove = vi.fn()
      render(<Token label="Pendentes" onRemove={onRemove} />)
      const remove = screen.getByRole("button", { name: "Remover Pendentes" })
      expect(remove).toHaveAttribute("type", "button")
      await userEvent.click(remove)
      expect(onRemove).toHaveBeenCalledTimes(1)
    })

    it("does not trigger the token's click", async () => {
      const onClick = vi.fn()
      const onRemove = vi.fn()
      render(<Token label="Pendentes" onClick={onClick} onRemove={onRemove} />)
      await userEvent.click(screen.getByRole("button", { name: "Remover Pendentes" }))
      expect(onRemove).toHaveBeenCalledTimes(1)
      expect(onClick).not.toHaveBeenCalled()
    })

    it("keeps the clickable part and the × as siblings (no nested controls)", () => {
      render(<Token label="Pendentes" onClick={() => {}} onRemove={() => {}} />)
      const action = screen.getByRole("button", { name: "Pendentes" })
      const remove = screen.getByRole("button", { name: "Remover Pendentes" })
      expect(action.contains(remove)).toBe(false)
      expect(remove.contains(action)).toBe(false)
      expect(remove).toHaveClass("relative", "z-10")
    })

    it("is reachable and usable from the keyboard", async () => {
      const onRemove = vi.fn()
      render(<Token label="Pendentes" onRemove={onRemove} />)
      await userEvent.tab()
      expect(screen.getByRole("button", { name: "Remover Pendentes" })).toHaveFocus()
      await userEvent.keyboard("{Enter}")
      expect(onRemove).toHaveBeenCalledTimes(1)
    })

    it("accepts a custom remove label", () => {
      render(<Token label="SP" onRemove={() => {}} labels={{ remove: (l) => `Tirar ${l}` }} />)
      expect(screen.getByRole("button", { name: "Tirar SP" })).toBeInTheDocument()
      expect(defaultTokenLabels.remove("SP")).toBe("Remover SP")
    })
  })

  describe("click", () => {
    it("turns the label into a button over the whole chip", async () => {
      const onClick = vi.fn()
      render(<Token label="Filtrar por SP" onClick={onClick} />)
      const action = screen.getByRole("button", { name: "Filtrar por SP" })
      expect(action).toHaveAttribute("type", "button")
      expect(action).toHaveAttribute("data-slot", "token-action")
      expect(action).toHaveClass(
        "after:absolute",
        "after:inset-0",
        "focus-visible:after:focus-outline",
      )
      await userEvent.click(action)
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe("link", () => {
    it("turns the label into a link", async () => {
      const onClick = vi.fn()
      render(<Token label="Proposta 1042" href="#proposta" onClick={onClick} />)
      const link = screen.getByRole("link", { name: "Proposta 1042" })
      expect(link).toHaveAttribute("href", "#proposta")
      expect(link).not.toHaveAttribute("target")
      expect(link).not.toHaveAttribute("rel")
      await userEvent.click(link)
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it("adds rel=noopener for target=_blank", () => {
      render(<Token label="Docs" href="https://exemplo.com" target="_blank" />)
      const link = screen.getByRole("link", { name: "Docs" })
      expect(link).toHaveAttribute("target", "_blank")
      expect(link).toHaveAttribute("rel", "noopener noreferrer")
    })

    it("drops unsafe hrefs and warns in dev", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      render(<Token label="Evil" href="javascript:alert(1)" />)
      expect(screen.queryByRole("link")).not.toBeInTheDocument()
      expect(String(warn.mock.calls[0]?.[0])).toContain("[Token]")
    })

    it("falls back to a button when the href is unsafe but onClick is set", async () => {
      vi.spyOn(console, "warn").mockImplementation(() => {})
      const onClick = vi.fn()
      render(<Token label="Evil" href="vbscript:x" onClick={onClick} />)
      await userEvent.click(screen.getByRole("button", { name: "Evil" }))
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it("does not warn for an empty href", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      render(<Token label="Nada" href="" />)
      expect(warn).not.toHaveBeenCalled()
    })
  })

  describe("disabled", () => {
    it("dims the chip and disables both controls", async () => {
      const onClick = vi.fn()
      const onRemove = vi.fn()
      const { container } = render(
        <Token label="SP" disabled onClick={onClick} onRemove={onRemove} />,
      )
      expect(root(container)).toHaveClass("opacity-50")
      expect(root(container)).toHaveAttribute("data-disabled")
      const action = screen.getByRole("button", { name: "SP" })
      const remove = screen.getByRole("button", { name: "Remover SP" })
      expect(action).toBeDisabled()
      expect(remove).toBeDisabled()
      expect(action).toHaveClass("cursor-default")
      expect(remove).toHaveClass("cursor-default")
      await userEvent.click(action)
      await userEvent.click(remove)
      expect(onClick).not.toHaveBeenCalled()
      expect(onRemove).not.toHaveBeenCalled()
    })

    it("turns a link into a disabled link without href", () => {
      const onClick = vi.fn()
      render(<Token label="Proposta" href="#p" disabled onClick={onClick} />)
      const link = screen.getByRole("link", { name: "Proposta" })
      expect(link).not.toHaveAttribute("href")
      expect(link).toHaveAttribute("aria-disabled", "true")
      const event = new MouseEvent("click", { bubbles: true, cancelable: true })
      link.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(true)
      expect(onClick).not.toHaveBeenCalled()
    })

    it("is not marked disabled by default", () => {
      const { container } = render(<Token label="SP" />)
      expect(root(container)).not.toHaveAttribute("data-disabled")
      expect(root(container)).not.toHaveClass("opacity-50")
    })
  })
})
