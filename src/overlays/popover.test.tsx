import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Popover, PopoverContent, PopoverTrigger } from "./popover"

describe("Popover", () => {
  it("renders trigger when closed", () => {
    render(
      <Popover open={false}>
        <PopoverTrigger>Abrir</PopoverTrigger>
        <PopoverContent>Conteúdo</PopoverContent>
      </Popover>,
    )
    expect(screen.getByText("Abrir")).toBeInTheDocument()
    expect(screen.queryByText("Conteúdo")).not.toBeInTheDocument()
  })

  it("shows content when open", () => {
    render(
      <Popover open={true}>
        <PopoverTrigger>Abrir</PopoverTrigger>
        <PopoverContent>Conteúdo</PopoverContent>
      </Popover>,
    )
    expect(screen.getByText("Conteúdo")).toBeInTheDocument()
  })

  it("opens when trigger is clicked", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <Popover onOpenChange={onOpenChange}>
        <PopoverTrigger>Abrir</PopoverTrigger>
        <PopoverContent>Conteúdo</PopoverContent>
      </Popover>,
    )
    await user.click(screen.getByText("Abrir"))
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it("closes on Escape", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <Popover defaultOpen onOpenChange={onOpenChange}>
        <PopoverTrigger>Abrir</PopoverTrigger>
        <PopoverContent>Conteúdo</PopoverContent>
      </Popover>,
    )
    await user.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("applies data-align=start when align='start'", () => {
    render(
      <Popover open>
        <PopoverTrigger>Abrir</PopoverTrigger>
        <PopoverContent align="start">Conteúdo</PopoverContent>
      </Popover>,
    )
    expect(screen.getByText("Conteúdo")).toHaveAttribute("data-align", "start")
  })
})
