import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Tree, type TreeNodeData } from "./tree"

const data: TreeNodeData[] = [
  {
    id: "root",
    label: "Root",
    children: [
      { id: "child-1", label: "Child 1" },
      { id: "child-2", label: "Child 2" },
    ],
  },
  { id: "sibling", label: "Sibling" },
]

describe("Tree", () => {
  it("renders top-level labels", () => {
    render(<Tree data={data} />)
    expect(screen.getByText("Root")).toBeInTheDocument()
    expect(screen.getByText("Sibling")).toBeInTheDocument()
  })

  it("hides children until parent is expanded", () => {
    render(<Tree data={data} />)
    expect(screen.queryByText("Child 1")).not.toBeInTheDocument()
  })

  it("expands children on click", async () => {
    render(<Tree data={data} />)
    await userEvent.click(screen.getByText("Root"))
    expect(screen.getByText("Child 1")).toBeInTheDocument()
    expect(screen.getByText("Child 2")).toBeInTheDocument()
  })

  it("respects defaultExpanded", () => {
    render(<Tree data={data} defaultExpanded={["root"]} />)
    expect(screen.getByText("Child 1")).toBeInTheDocument()
  })
})
