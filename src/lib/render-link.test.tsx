import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { type RenderLink, renderLinkElement } from "./render-link"

describe("renderLinkElement", () => {
  it("renders a plain anchor when there is no renderLink", () => {
    render(
      renderLinkElement(undefined, { href: "/leads", children: "Leads", "aria-current": "page" }),
    )
    const link = screen.getByRole("link", { name: "Leads" })
    expect(link).toHaveAttribute("href", "/leads")
    expect(link).toHaveAttribute("aria-current", "page")
  })

  it("hands every prop to the consumer's link", async () => {
    const onClick = vi.fn((e: React.MouseEvent) => e.preventDefault())
    const renderLink: RenderLink = ({ href, children, ...props }) => (
      <a data-router-link="" href={`/app${href}`} {...props}>
        {children}
      </a>
    )
    render(
      renderLinkElement(renderLink, {
        href: "/leads",
        children: "Leads",
        className: "item",
        onClick,
      }),
    )
    const link = screen.getByRole("link", { name: "Leads" })
    expect(link).toHaveAttribute("data-router-link")
    expect(link).toHaveAttribute("href", "/app/leads")
    expect(link).toHaveClass("item")
    await userEvent.click(link)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
