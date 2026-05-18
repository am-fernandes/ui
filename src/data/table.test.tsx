import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table"

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

  it("renders a TableCaption", () => {
    render(
      <Table>
        <TableCaption>My caption</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(screen.getByText("My caption")).toBeInTheDocument()
  })

  it("renders a TableFooter", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>footer</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    )
    expect(screen.getByText("footer")).toBeInTheDocument()
  })

  it("applies containerClassName on the wrapping div", () => {
    const { container } = render(
      <Table containerClassName="container-x">
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(container.querySelector('[data-slot="table-container"]')).toHaveClass("container-x")
  })
})
