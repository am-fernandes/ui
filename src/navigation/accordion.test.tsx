import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion"

describe("Accordion", () => {
  it("renders via items API", () => {
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
  })

  it("renders via composicional API", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="a">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )
    expect(screen.getByText("Trigger")).toBeInTheDocument()
  })
})
