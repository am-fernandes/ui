import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Bell, Trash2 } from "lucide-react"
import * as React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

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

  // The measured squares (32, 40 and 44px) are asserted in a real browser by
  // tests/e2e/control-size.spec.ts.
  it("is a square of the shared control height, with no padding", () => {
    const { rerender } = render(<IconButton icon={<Bell />} label="A" />)
    const button = () => screen.getByRole("button")
    expect(button()).toHaveClass("size-control-md", "p-0", "shrink-0")
    // The square replaces the height and the padding of the Button it is built on.
    expect(button()).not.toHaveClass("h-control-md")
    expect(button()).not.toHaveClass("px-3")

    rerender(<IconButton icon={<Bell />} label="A" size="sm" />)
    expect(button()).toHaveClass("size-control-sm")
    expect(button()).not.toHaveClass("px-2.5")

    rerender(<IconButton icon={<Bell />} label="A" size="lg" />)
    expect(button()).toHaveClass("size-control-lg", "[&_svg]:size-5")
    expect(button()).not.toHaveClass("[&_svg]:size-4")
  })

  it("merges className", () => {
    render(<IconButton icon={<Bell />} label="A" className="rounded-full" />)
    expect(screen.getByRole("button")).toHaveClass("rounded-full", "size-control-md")
  })

  it("lets a className size replace the square", () => {
    render(<IconButton icon={<Bell />} label="A" className="size-6" />)
    expect(screen.getByRole("button")).toHaveClass("size-6")
    expect(screen.getByRole("button")).not.toHaveClass("size-control-md")
  })

  it("fires onClick", async () => {
    const onClick = vi.fn()
    render(<IconButton icon={<Bell />} label="A" onClick={onClick} />)
    await userEvent.click(screen.getByRole("button"))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  // An icon with no text is only explained by its tooltip. A natively disabled
  // button shows none and is skipped by Tab: in a table row nobody could tell
  // what the action was, nor that it exists and is unavailable.
  describe("disabled", () => {
    it("is unavailable through aria-disabled, never the native attribute", () => {
      render(<IconButton icon={<Trash2 />} label="Excluir" disabled />)
      const button = screen.getByRole("button", { name: "Excluir" })
      expect(button).not.toHaveAttribute("disabled")
      expect(button).toHaveAttribute("aria-disabled", "true")
      expect(button).toHaveAttribute("data-disabled")
    })

    it("ignores clicks, Enter and Space", async () => {
      const onClick = vi.fn()
      render(<IconButton icon={<Trash2 />} label="Excluir" disabled onClick={onClick} />)
      const button = screen.getByRole("button", { name: "Excluir" })
      await userEvent.click(button)
      button.focus()
      await userEvent.keyboard("{Enter}")
      await userEvent.keyboard(" ")
      expect(onClick).not.toHaveBeenCalled()
    })

    it("does not submit the form it is in, even as type=submit", async () => {
      const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
      render(
        <form onSubmit={onSubmit}>
          <IconButton icon={<Bell />} label="Enviar" type="submit" disabled />
        </form>,
      )
      await userEvent.click(screen.getByRole("button", { name: "Enviar" }))
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it("is reached by Tab and still shows what it is in the tooltip", async () => {
      render(
        <>
          <button type="button">antes</button>
          <IconButton icon={<Trash2 />} label="Excluir proposta" disabled />
        </>,
      )
      await userEvent.tab()
      await userEvent.tab()
      expect(screen.getByRole("button", { name: "Excluir proposta" })).toHaveFocus()
      expect(await screen.findByRole("tooltip")).toHaveTextContent("Excluir proposta")
    })

    it("is not marked in any way when enabled", () => {
      render(<IconButton icon={<Trash2 />} label="Excluir" />)
      const button = screen.getByRole("button", { name: "Excluir" })
      expect(button).not.toHaveAttribute("aria-disabled")
      expect(button).not.toHaveAttribute("data-disabled")
    })
  })

  describe("loading", () => {
    const announcer = () => document.querySelector('[data-slot="live-announcer"]')
    beforeEach(() => announcer()?.remove())

    it("swaps the icon for a spinner and stays focused", () => {
      const { container, rerender } = render(<IconButton icon={<Bell />} label="Salvar" />)
      const button = screen.getByRole("button", { name: "Salvar" })
      button.focus()
      rerender(<IconButton icon={<Bell />} label="Salvar" loading />)
      expect(button).not.toHaveAttribute("disabled")
      expect(button).toHaveAttribute("aria-disabled", "true")
      expect(button).toHaveAttribute("aria-busy", "true")
      expect(button).toHaveFocus()
      expect(container.querySelector("svg.lucide-bell")).toBeNull()
      expect(container.querySelector("svg.animate-spin")).not.toBeNull()
      // Busy, not disabled: the spinner is shown at full strength.
      expect(button).not.toHaveAttribute("data-disabled")
    })

    it("ignores clicks while loading", async () => {
      const onClick = vi.fn()
      render(<IconButton icon={<Bell />} label="Salvar" loading onClick={onClick} />)
      await userEvent.click(screen.getByRole("button", { name: "Salvar" }))
      expect(onClick).not.toHaveBeenCalled()
    })

    it("announces that it started loading", async () => {
      const { rerender } = render(<IconButton icon={<Bell />} label="Salvar" />)
      rerender(<IconButton icon={<Bell />} label="Salvar" loading />)
      await waitFor(() => expect(announcer()).toHaveTextContent("Carregando…"))
      rerender(<IconButton icon={<Bell />} label="Salvar" />)
      rerender(
        <IconButton icon={<Bell />} label="Salvar" loading labels={{ loading: "Salvando" }} />,
      )
      await waitFor(() => expect(announcer()).toHaveTextContent("Salvando"))
    })
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

  // React 19: a callback ref may return a cleanup. React then calls the
  // cleanup on unmount instead of calling the ref with null. The hand-made
  // merge dropped the cleanup and called the ref with null.
  it("runs the cleanup a callback ref returns, instead of calling it with null", () => {
    // With and without the tooltip around it (its trigger composes refs too).
    for (const tooltip of [false, true]) {
      const calls: Array<HTMLButtonElement | null> = []
      let attached = 0
      const ref = (el: HTMLButtonElement | null) => {
        calls.push(el)
        attached++
        return () => {
          attached--
        }
      }
      const { unmount } = render(
        <IconButton icon={<Bell />} label="A" tooltip={tooltip} ref={ref} />,
      )
      expect(calls.at(-1)).toBe(screen.getByRole("button"))
      unmount()
      expect(attached).toBe(0)
      expect(calls).not.toContain(null)
    }
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
