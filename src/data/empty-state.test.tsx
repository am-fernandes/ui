import { act, render, screen } from "@testing-library/react"
import { Inbox } from "lucide-react"
import * as React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { EmptyState } from "./empty-state"

describe("EmptyState", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("renders the title as an h3 by default and the description", () => {
    render(<EmptyState title="Nenhum lead encontrado" description="Tente outros filtros." />)
    const heading = screen.getByRole("heading", { level: 3, name: "Nenhum lead encontrado" })
    expect(heading).toHaveClass("text-base", "font-semibold")
    expect(screen.getByText("Tente outros filtros.")).toHaveClass("text-muted-foreground")
  })

  it("changes only the heading tag with headingLevel", () => {
    render(<EmptyState title="Vazio" headingLevel={2} />)
    const heading = screen.getByRole("heading", { level: 2, name: "Vazio" })
    expect(heading).toHaveClass("text-base")
  })

  it("renders the icon as decoration", () => {
    const { container } = render(<EmptyState title="Vazio" icon={<Inbox />} />)
    const icon = container.querySelector('[data-slot="empty-state-icon"]')
    expect(icon).toHaveAttribute("aria-hidden", "true")
    expect(icon?.querySelector("svg.lucide-inbox")).not.toBeNull()
    expect(icon).toHaveClass("size-12")
  })

  it("omits optional parts", () => {
    const { container } = render(<EmptyState title="Vazio" />)
    expect(container.querySelector('[data-slot="empty-state-icon"]')).toBeNull()
    expect(container.querySelector('[data-slot="empty-state-actions"]')).toBeNull()
    expect(container.querySelector("p")).toBeNull()
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })

  it("lays actions out in a row", () => {
    render(
      <EmptyState
        title="Vazio"
        actions={
          <>
            <button type="button">Novo lead</button>
            <button type="button">Limpar filtros</button>
          </>
        }
      />,
    )
    const actions = screen.getByRole("button", { name: "Novo lead" }).parentElement
    expect(actions).toHaveAttribute("data-slot", "empty-state-actions")
    expect(actions).toHaveClass("flex-wrap")
    expect(actions).not.toHaveClass("flex-col")
  })

  it("tightens spacing and stacks actions when compact", () => {
    const { container } = render(
      <EmptyState
        compact
        title="Vazio"
        icon={<Inbox />}
        actions={<button type="button">Novo</button>}
      />,
    )
    const root = container.querySelector('[data-slot="empty-state"]')
    expect(root).toHaveClass("gap-3", "py-6")
    expect(container.querySelector('[data-slot="empty-state-icon"]')).toHaveClass("size-10")
    expect(container.querySelector('[data-slot="empty-state-actions"]')).toHaveClass("flex-col")
  })

  it("announces title and description after it appears when announce is set", () => {
    vi.useFakeTimers()
    render(<EmptyState announce title="Nenhum resultado" description="Nada para “zzz”." />)
    const status = screen.getByRole("status")
    // Empty on insertion, so the later change is what gets read out.
    expect(status).toHaveTextContent("")
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(status).toHaveTextContent("Nenhum resultado. Nada para “zzz”.")
  })

  it("re-announces when the message changes", () => {
    vi.useFakeTimers()
    const { rerender } = render(<EmptyState announce title="Nenhum resultado" />)
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(screen.getByRole("status")).toHaveTextContent("Nenhum resultado")
    rerender(<EmptyState announce title="Nenhum lead" />)
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(screen.getByRole("status")).toHaveTextContent("Nenhum lead")
  })

  it("forwards ref, className and other attributes", () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<EmptyState ref={ref} title="Vazio" className="border" data-testid="es" />)
    expect(ref.current).toBe(screen.getByTestId("es"))
    expect(ref.current).toHaveClass("border", "text-center")
  })
})
