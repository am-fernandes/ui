import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { FieldDescription, FieldLegend, FieldSet } from "./field"

describe("Field", () => {
  it("renders legend inside fieldset", () => {
    render(
      <FieldSet>
        <FieldLegend>Test legend</FieldLegend>
        <FieldDescription>Descrição auxiliar</FieldDescription>
      </FieldSet>,
    )
    expect(screen.getByText("Test legend")).toBeInTheDocument()
    expect(screen.getByText("Descrição auxiliar")).toBeInTheDocument()
  })
})
