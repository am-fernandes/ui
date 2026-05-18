import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Alert, AlertDescription, AlertTitle } from "./alert"

describe("Alert", () => {
  it("renders title and description", () => {
    render(
      <Alert variant="info">
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Something to note.</AlertDescription>
      </Alert>,
    )
    expect(screen.getByRole("alert")).toBeInTheDocument()
    expect(screen.getByText("Heads up")).toBeInTheDocument()
    expect(screen.getByText("Something to note.")).toBeInTheDocument()
  })

  it("applies info variant classes", () => {
    render(
      <Alert variant="info">
        <AlertTitle>Info</AlertTitle>
      </Alert>,
    )
    expect(screen.getByRole("alert")).toHaveClass("bg-status-info-bg")
  })

  it("applies destructive variant classes", () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Erro</AlertTitle>
      </Alert>,
    )
    expect(screen.getByRole("alert")).toHaveClass("bg-status-destructive-bg")
  })

  it("applies success variant classes", () => {
    render(
      <Alert variant="success">
        <AlertTitle>OK</AlertTitle>
      </Alert>,
    )
    expect(screen.getByRole("alert")).toHaveClass("bg-status-success-bg")
  })
})
