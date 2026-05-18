import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"

describe("Table", () => {
  it("renders header and body cells", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Col A</TableHead>
            <TableHead>Col B</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>A1</TableCell>
            <TableCell>B1</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(screen.getByText("Col A")).toBeInTheDocument()
    expect(screen.getByText("Col B")).toBeInTheDocument()
    expect(screen.getByText("A1")).toBeInTheDocument()
    expect(screen.getByText("B1")).toBeInTheDocument()
  })
})
