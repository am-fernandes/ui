import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"

describe("Card", () => {
  it("renders header + title + description + content", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Título</CardTitle>
          <CardDescription>Descrição</CardDescription>
        </CardHeader>
        <CardContent>Conteúdo do card</CardContent>
      </Card>,
    )
    expect(screen.getByText("Título")).toBeInTheDocument()
    expect(screen.getByText("Descrição")).toBeInTheDocument()
    expect(screen.getByText("Conteúdo do card")).toBeInTheDocument()
  })
})
