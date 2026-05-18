import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet"

describe("Sheet", () => {
  it("renders trigger when closed", () => {
    render(
      <Sheet open={false}>
        <SheetTrigger>Abrir</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Título</SheetTitle>
            <SheetDescription>Descrição</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    )
    expect(screen.getByText("Abrir")).toBeInTheDocument()
    expect(screen.queryByText("Título")).not.toBeInTheDocument()
  })

  it("renders content when open", () => {
    render(
      <Sheet open={true}>
        <SheetTrigger>Abrir</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Título</SheetTitle>
            <SheetDescription>Descrição</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    )
    expect(screen.getByText("Título")).toBeInTheDocument()
    expect(screen.getByText("Descrição")).toBeInTheDocument()
  })

  it("calls onOpenChange(false) when Escape is pressed", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <Sheet defaultOpen onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Título</SheetTitle>
            <SheetDescription>Descrição</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    )
    await user.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("renders default close button and closes on click", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <Sheet defaultOpen onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Título</SheetTitle>
            <SheetDescription>Descrição</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    )
    const closeButton = screen.getByRole("button", { name: "Close" })
    await user.click(closeButton)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("uses a custom closeLabel", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent closeLabel="Fechar">
          <SheetHeader>
            <SheetTitle>Título</SheetTitle>
            <SheetDescription>Descrição</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    )
    expect(screen.getByRole("button", { name: "Fechar" })).toBeInTheDocument()
  })
})
