import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Skeleton, SkeletonGroup, defaultSkeletonLabels } from "./skeleton"

describe("Skeleton", () => {
  it("renders a div with animate-pulse class", () => {
    const { container } = render(<Skeleton data-testid="skeleton" />)
    const el = container.firstChild as HTMLElement
    expect(el).toBeInTheDocument()
    expect(el.tagName).toBe("DIV")
    expect(el).toHaveClass("animate-pulse")
    expect(el).toHaveAttribute("data-slot", "skeleton")
  })

  // Each block used to be an empty role="status": a table of skeletons was 16
  // live regions with nothing to say.
  it("is hidden from assistive technology: a block is not a status", () => {
    render(<Skeleton data-testid="sk" />)
    const el = screen.getByTestId("sk")
    expect(el).toHaveAttribute("aria-hidden", "true")
    expect(el).not.toHaveAttribute("role")
    expect(el).not.toHaveAttribute("aria-live")
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })

  it("merges consumer className (override wins for conflicting tw classes)", () => {
    render(<Skeleton className="rounded-none" data-testid="sk" />)
    const el = screen.getByTestId("sk")
    expect(el).toHaveClass("rounded-none")
    expect(el).not.toHaveClass("rounded-inner")
    expect(el).toHaveClass("animate-pulse")
  })
})

describe("SkeletonGroup", () => {
  it("is one status for all its blocks, and says what is loading", async () => {
    render(
      <SkeletonGroup>
        {Array.from({ length: 16 }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: placeholders have no id
          <Skeleton key={i} className="h-4" />
        ))}
      </SkeletonGroup>,
    )
    const status = screen.getByRole("status")
    expect(screen.getAllByRole("status")).toHaveLength(1)
    // Written after the region exists, so a screen reader reads it.
    expect(await screen.findByText(defaultSkeletonLabels.loading)).toHaveClass("sr-only")
    expect(status).toHaveTextContent(defaultSkeletonLabels.loading)
    expect(status).toHaveAttribute("data-slot", "skeleton-group")
  })

  it("takes the words from labels", async () => {
    render(
      <SkeletonGroup labels={{ loading: "Carregando propostas…" }}>
        <Skeleton className="h-4" />
      </SkeletonGroup>,
    )
    expect(await screen.findByText("Carregando propostas…")).toBeInTheDocument()
  })
})
