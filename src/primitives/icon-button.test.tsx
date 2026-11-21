import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Bell, Trash2 } from "lucide-react"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { IconButton } from "./icon-button"

describe("IconButton", () => {
  it("uses label as the accessible name and renders the icon", () => {
    const { container } = render(<IconButton icon={<Bell />} label="Notificações" />)
    const button = screen.getByRole("button", { name: "Notificações" })
    expect(button).toHaveAttribute("data-slot", "icon-button")
    expect(container.querySelector("svg.lucide-bell")).not.toBeNull()
  })

  it("defaults to type=button so it never submits a form by accident", async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <IconButton icon={<Bell />} label="Limpar" />
      </form>,
    )
    const button = screen.getByRole("button", { name: "Limpar" })
    expect(button).toHaveAttribute("type", "button")
    await userEvent.click(button)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("accepts type=submit", () => {
    render(<IconButton icon={<Bell />} label="Enviar" type="submit" />)
    expect(screen.getByRole("button", { name: "Enviar" })).toHaveAttribute("type", "submit")
  })

  it("is a ghost button by default and supports the Button variants", () => {
    const { rerender } = render(<IconButton icon={<Bell />} label="A" />)
    expect(screen.getByRole("button")).toHaveClass("state-layer")
    expect(screen.getByRole("button")).not.toHaveClass("bg-primary")

    rerender(<IconButton icon={<Trash2 />} label="A" variant="destructive" />)
    expect(screen.getByRole("button")).toHaveClass("bg-destructive", "text-destructive-foreground")

    rerender(<IconButton icon={<Bell />} label="A" variant="default" />)
    expect(screen.getByRole("button")).toHaveClass("bg-primary")

    rerender(<IconButton icon={<Bell />} label="A" variant="outline" />)
    expect(screen.getByRole("button")).toHaveClass("border", "border-input")

    rerender(<IconButton icon={<Bell />} label="A" variant="secondary" />)
    expect(screen.getByRole("button")).toHaveClass("bg-secondary")
  })

  it("is a square with no padding, sized by `size`", () => {
    const { rerender } = render(<IconButton icon={<Bell />} label="A" />)
    const button = () => screen.getByRole("button")
    expect(button()).toHaveClass("size-10", "p-0")
    expect(button()).not.toHaveClass("px-3")
    expect(button()).not.toHaveClass("py-2.5")

    rerender(<IconButton icon={<Bell />} label="A" size="sm" />)
    expect(button()).toHaveClass("size-8")

    rerender(<IconButton icon={<Bell />} label="A" size="lg" />)
    expect(button()).toHaveClass("size-11", "[&_svg]:size-5")
    expect(button()).not.toHaveClass("[&_svg]:size-4")
  })

  it("merges className", () => {
    render(<IconButton icon={<Bell />} label="A" className="rounded-full" />)
    expect(screen.getByRole("button")).toHaveClass("rounded-full", "size-10")
  })

  it("fires onClick", async () => {
    const onClick = vi.fn()
    render(<IconButton icon={<Bell />} label="A" onClick={onClick} />)
    await userEvent.click(screen.getByRole("button"))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("disables the button", async () => {
    const onClick = vi.fn()
    render(<IconButton icon={<Bell />} label="A" disabled onClick={onClick} />)
    const button = screen.getByRole("button")
    expect(button).toBeDisabled()
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it("swaps the icon for a spinner while loading", () => {
    const { container } = render(<IconButton icon={<Bell />} label="Salvar" loading />)
    const button = screen.getByRole("button", { name: "Salvar" })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute("aria-busy", "true")
    expect(container.querySelector("svg.lucide-bell")).toBeNull()
    expect(container.querySelector("svg.animate-spin")).not.toBeNull()
  })

  it("is not busy when idle", () => {
    render(<IconButton icon={<Bell />} label="Salvar" />)
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-busy")
    expect(screen.getByRole("button")).toBeEnabled()
  })

  it("shows the label as a tooltip on focus", async () => {
    render(<IconButton icon={<Bell />} label="Notificações" />)
    await userEvent.tab()
    expect(screen.getByRole("button", { name: "Notificações" })).toHaveFocus()
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Notificações")
  })

  it("honours tooltipSide", async () => {
    const sideOf = async (props: { tooltipSide?: "right" }) => {
      const { unmount } = render(<IconButton icon={<Bell />} label="N" {...props} />)
      await userEvent.tab()
      await screen.findByRole("tooltip")
      const content = document.querySelector('[data-slot="tooltip-content"]') as HTMLElement
      // jsdom has no layout, so collision handling may flip to the opposite
      // side — but always on the axis that was asked for.
      await waitFor(() => expect(content).toHaveAttribute("data-side"))
      const side = content.getAttribute("data-side")
      unmount()
      return side
    }
    expect(["right", "left"]).toContain(await sideOf({ tooltipSide: "right" }))
    expect(["top", "bottom"]).toContain(await sideOf({}))
  })

  it("skips the tooltip with tooltip={false}", async () => {
    render(<IconButton icon={<Bell />} label="Notificações" tooltip={false} />)
    await userEvent.tab()
    expect(screen.getByRole("button", { name: "Notificações" })).toHaveFocus()
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
  })

  describe("tooltip on focus", () => {
    // jsdom can't tell keyboard focus from programmatic focus, so stub the
    // two selectors the component checks.
    function stubMatches(result: { focusVisible: boolean; hover?: boolean } | "throw") {
      const original = Element.prototype.matches
      return vi.spyOn(Element.prototype, "matches").mockImplementation(function (
        this: Element,
        selector: string,
      ) {
        if (selector === ":focus-visible" || selector === ":hover") {
          if (result === "throw") throw new SyntaxError("unsupported selector")
          return selector === ":hover" ? (result.hover ?? false) : result.focusVisible
        }
        return original.call(this, selector)
      })
    }

    it("stays closed when focus is placed by code after a mouse interaction", async () => {
      const spy = stubMatches({ focusVisible: false })
      render(<IconButton icon={<Bell />} label="Ações" />)
      const button = screen.getByRole("button", { name: "Ações" })
      act(() => button.focus())
      expect(button).toHaveFocus()
      // Give Radix a chance to open it; it must not.
      await new Promise((r) => setTimeout(r, 50))
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
      spy.mockRestore()
    })

    it("opens on keyboard focus", async () => {
      const spy = stubMatches({ focusVisible: true })
      render(<IconButton icon={<Bell />} label="Ações" />)
      act(() => screen.getByRole("button", { name: "Ações" }).focus())
      expect(await screen.findByRole("tooltip")).toHaveTextContent("Ações")
      spy.mockRestore()
    })

    it("opens when the focused button is also hovered", async () => {
      const spy = stubMatches({ focusVisible: false, hover: true })
      render(<IconButton icon={<Bell />} label="Ações" />)
      act(() => screen.getByRole("button", { name: "Ações" }).focus())
      expect(await screen.findByRole("tooltip")).toHaveTextContent("Ações")
      spy.mockRestore()
    })

    it("falls back to opening when the engine lacks :focus-visible", async () => {
      const spy = stubMatches("throw")
      render(<IconButton icon={<Bell />} label="Ações" />)
      act(() => screen.getByRole("button", { name: "Ações" }).focus())
      expect(await screen.findByRole("tooltip")).toHaveTextContent("Ações")
      spy.mockRestore()
    })
  })

  it("supports callback refs", () => {
    let node: HTMLButtonElement | null = null
    render(
      <IconButton
        icon={<Bell />}
        label="A"
        ref={(el) => {
          node = el
        }}
      />,
    )
    expect(node).toBe(screen.getByRole("button"))
  })

  it("forwards the ref to the <button>", () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<IconButton icon={<Bell />} label="A" ref={ref} />)
    expect(ref.current).toBe(screen.getByRole("button"))
  })

  it("passes through other button attributes", () => {
    render(<IconButton icon={<Bell />} label="A" data-testid="x" aria-pressed="true" />)
    const button = screen.getByTestId("x")
    expect(button).toHaveAttribute("aria-pressed", "true")
    expect(button).toHaveAccessibleName("A")
  })
})
