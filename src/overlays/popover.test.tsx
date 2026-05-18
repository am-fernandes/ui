import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

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
})
