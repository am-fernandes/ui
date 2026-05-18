import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

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

  it("shows content when open", () => {
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
  })
})
