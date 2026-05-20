import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { Popover } from "./popover"

describe("Popover", () => {
  it("opens on trigger click", async () => {
    render(
      <Popover trigger={<button type="button">Open</button>}>
        <p>Conteúdo</p>
      </Popover>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Open" }))
    expect(screen.getByText("Conteúdo")).toBeInTheDocument()
  })

  it("supports controlled open", () => {
    render(
      <Popover open>
        <p>Visible</p>
      </Popover>,
    )
    expect(screen.getByText("Visible")).toBeInTheDocument()
  })

  it("applies align prop to content", async () => {
    render(
      <Popover trigger={<button type="button">X</button>} align="start">
        <p>c</p>
      </Popover>,
    )
    await userEvent.click(screen.getByRole("button", { name: "X" }))
    const content = document.querySelector('[data-slot="popover-content"]')
    expect(content).toHaveAttribute("data-align", "start")
  })

  it("calls onOpenChange when the trigger is clicked (controlled round-trip)", async () => {
    function Controlled() {
      const [open, setOpen] = React.useState(false)
      return (
        <Popover trigger={<button type="button">Toggle</button>} open={open} onOpenChange={setOpen}>
          <p>Body</p>
        </Popover>
      )
    }
    const user = userEvent.setup()
    render(<Controlled />)
    expect(screen.queryByText("Body")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Toggle" }))
    expect(screen.getByText("Body")).toBeInTheDocument()
    // Clicking the trigger again should toggle closed.
    await user.click(screen.getByRole("button", { name: "Toggle" }))
    await waitFor(() => {
      expect(screen.queryByText("Body")).not.toBeInTheDocument()
    })
  })

  it("invokes onOpenChange(true) when trigger is clicked from closed state", async () => {
    const onOpenChange = vi.fn()
    render(
      <Popover trigger={<button type="button">T</button>} onOpenChange={onOpenChange}>
        <p>c</p>
      </Popover>,
    )
    await userEvent.click(screen.getByRole("button", { name: "T" }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it("closes on Escape key (fires onEscapeKeyDown and onOpenChange(false))", async () => {
    const onEscapeKeyDown = vi.fn()
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Popover
        trigger={<button type="button">T</button>}
        onEscapeKeyDown={onEscapeKeyDown}
        onOpenChange={onOpenChange}
      >
        <p>Body</p>
      </Popover>,
    )
    await user.click(screen.getByRole("button", { name: "T" }))
    expect(screen.getByText("Body")).toBeInTheDocument()
    await user.keyboard("{Escape}")
    expect(onEscapeKeyDown).toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
    await waitFor(() => {
      expect(screen.queryByText("Body")).not.toBeInTheDocument()
    })
  })

  it("closes on outside pointer interaction", async () => {
    const onPointerDownOutside = vi.fn()
    const user = userEvent.setup()
    render(
      <div>
        <button type="button" data-testid="outside">
          Outside
        </button>
        <Popover
          trigger={<button type="button">T</button>}
          onPointerDownOutside={onPointerDownOutside}
        >
          <p>Body</p>
        </Popover>
      </div>,
    )
    await user.click(screen.getByRole("button", { name: "T" }))
    expect(screen.getByText("Body")).toBeInTheDocument()
    await user.click(screen.getByTestId("outside"))
    expect(onPointerDownOutside).toHaveBeenCalled()
    await waitFor(() => {
      expect(screen.queryByText("Body")).not.toBeInTheDocument()
    })
  })

  it("propagates side prop to data-side on the content", async () => {
    render(
      <Popover trigger={<button type="button">T</button>} side="bottom">
        <p>c</p>
      </Popover>,
    )
    await userEvent.click(screen.getByRole("button", { name: "T" }))
    const content = document.querySelector('[data-slot="popover-content"]')
    // Radix Popper writes the resolved side; in jsdom there is no flip so it
    // matches the requested side.
    expect(content).toHaveAttribute("data-side", "bottom")
  })

  it("forwards align='end' to data-align", async () => {
    render(
      <Popover trigger={<button type="button">T</button>} align="end">
        <p>c</p>
      </Popover>,
    )
    await userEvent.click(screen.getByRole("button", { name: "T" }))
    const content = document.querySelector('[data-slot="popover-content"]')
    expect(content).toHaveAttribute("data-align", "end")
  })

  it("stamps data-state='open' on the trigger when the popover opens", async () => {
    render(
      <Popover trigger={<button type="button">T</button>}>
        <p>c</p>
      </Popover>,
    )
    const trigger = screen.getByRole("button", { name: "T" })
    expect(trigger).toHaveAttribute("data-state", "closed")
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute("data-state", "open")
  })

  it("returns focus to the trigger when the popover closes", async () => {
    const user = userEvent.setup()
    render(
      <Popover trigger={<button type="button">T</button>}>
        <p>Body</p>
      </Popover>,
    )
    const trigger = screen.getByRole("button", { name: "T" })
    await user.click(trigger)
    expect(screen.getByText("Body")).toBeInTheDocument()
    await user.keyboard("{Escape}")
    await waitFor(() => {
      expect(trigger).toHaveFocus()
    })
  })

  it("respects defaultOpen for the uncontrolled mode", () => {
    render(
      <Popover trigger={<button type="button">T</button>} defaultOpen>
        <p>InitiallyOpen</p>
      </Popover>,
    )
    expect(screen.getByText("InitiallyOpen")).toBeInTheDocument()
  })

  it("applies a custom className to the content", async () => {
    render(
      <Popover trigger={<button type="button">T</button>} className="custom-popover">
        <p>c</p>
      </Popover>,
    )
    await userEvent.click(screen.getByRole("button", { name: "T" }))
    const content = document.querySelector('[data-slot="popover-content"]')
    expect(content).toHaveClass("custom-popover")
  })
})
