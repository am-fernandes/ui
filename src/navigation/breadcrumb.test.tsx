import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb"

describe("Breadcrumb", () => {
  it("renders via items API", () => {
    render(<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Page" }]} />)
    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("Page")).toBeInTheDocument()
    expect(screen.getByText("Home").tagName).toBe("A")
  })

  it("renders via composicional API", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Now</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("Now")).toBeInTheDocument()
  })
})
