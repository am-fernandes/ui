import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

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
})
