import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Accordion } from "./accordion"

describe("Accordion", () => {
  it("renders titles and expands content on click", async () => {
    render(
      <Accordion
        type="single"
        collapsible
        items={[
          { value: "a", title: "Pergunta 1", content: "Resposta 1" },
          { value: "b", title: "Pergunta 2", content: "Resposta 2" },
          { value: "c", title: "Pergunta 3", content: "Resposta 3" },
        ]}
      />,
    )
    expect(screen.getByText("Pergunta 1")).toBeInTheDocument()
    expect(screen.getByText("Pergunta 2")).toBeInTheDocument()
    expect(screen.getByText("Pergunta 3")).toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: "Pergunta 2" }))
    expect(screen.getByText("Resposta 2")).toBeVisible()
  })
})
