import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog"

describe("Dialog", () => {
  it("renders trigger when closed", () => {
    render(
      <Dialog open={false}>
        <DialogTrigger>Abrir</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Título</DialogTitle>
            <DialogDescription>Descrição</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    )
    expect(screen.getByText("Abrir")).toBeInTheDocument()
    expect(screen.queryByText("Título")).not.toBeInTheDocument()
  })

  it("shows content when open", () => {
    render(
      <Dialog open={true}>
        <DialogTrigger>Abrir</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Título</DialogTitle>
            <DialogDescription>Descrição</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    )
    expect(screen.getByText("Título")).toBeInTheDocument()
    expect(screen.getByText("Descrição")).toBeInTheDocument()
  })

  it("calls onOpenChange(false) when Escape is pressed", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <Dialog defaultOpen onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Título</DialogTitle>
            <DialogDescription>Descrição</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    )
    await user.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("renders close (X) button and closes on click", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <Dialog defaultOpen onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Título</DialogTitle>
            <DialogDescription>Descrição</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    )
    const closeButton = screen.getByRole("button", { name: "Close" })
    expect(closeButton).toBeInTheDocument()
    await user.click(closeButton)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("hides the close button when hideCloseButton is set", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent hideCloseButton>
          <DialogHeader>
            <DialogTitle>Título</DialogTitle>
            <DialogDescription>Descrição</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    )
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument()
  })

  it("uses a custom closeLabel for sr-only text and aria-label", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent closeLabel="Fechar">
          <DialogHeader>
            <DialogTitle>Título</DialogTitle>
            <DialogDescription>Descrição</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    )
    expect(screen.getByRole("button", { name: "Fechar" })).toBeInTheDocument()
  })
})
