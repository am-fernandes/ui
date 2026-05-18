import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

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

  it("supports controlled expansion", async () => {
    function Wrapper() {
      const [expanded, setExpanded] = React.useState<Set<string>>(new Set())
      return (
        <>
          <button
            type="button"
            data-testid="ext-toggle"
            onClick={() => setExpanded(new Set(["root"]))}
          >
            expand root
          </button>
          <Tree data={data} expanded={expanded} onExpandedChange={setExpanded} />
        </>
      )
    }
    render(<Wrapper />)
    expect(screen.queryByText("Child 1")).not.toBeInTheDocument()
    await userEvent.click(screen.getByTestId("ext-toggle"))
    expect(screen.getByText("Child 1")).toBeInTheDocument()
  })

  it("invokes onSelectedChange when clicking a node", async () => {
    const onSelectedChange = vi.fn()
    render(<Tree data={data} onSelectedChange={onSelectedChange} />)
    await userEvent.click(screen.getByText("Sibling"))
    expect(onSelectedChange).toHaveBeenCalledWith("sibling")
  })

  it("keyboard nav: ArrowRight expands a collapsed parent", () => {
    render(<Tree data={data} />)
    const items = screen.getAllByRole("treeitem")
    // Root is the first treeitem (initially focused via roving tabindex).
    const root = items[0] as HTMLElement
    fireEvent.keyDown(root, { key: "ArrowRight" })
    expect(screen.getByText("Child 1")).toBeInTheDocument()
  })

  it("keyboard nav: ArrowLeft collapses an expanded parent", () => {
    render(<Tree data={data} defaultExpanded={["root"]} />)
    expect(screen.getByText("Child 1")).toBeInTheDocument()
    const items = screen.getAllByRole("treeitem")
    const root = items[0] as HTMLElement
    fireEvent.keyDown(root, { key: "ArrowLeft" })
    expect(screen.queryByText("Child 1")).not.toBeInTheDocument()
  })

  it("keyboard nav: ArrowDown moves focus", () => {
    render(<Tree data={data} defaultExpanded={["root"]} />)
    const items = screen.getAllByRole("treeitem")
    const root = items[0] as HTMLElement
    root.focus()
    fireEvent.keyDown(root, { key: "ArrowDown" })
    // The next treeitem should now have tabIndex=0.
    const allItems = screen.getAllByRole("treeitem")
    expect(allItems[1]?.getAttribute("tabindex")).toBe("0")
  })

  it("renders empty when given an empty data array", () => {
    const { container } = render(<Tree data={[]} />)
    expect(container.querySelector('[data-slot="tree"]')).toBeTruthy()
    expect(screen.queryAllByRole("treeitem")).toHaveLength(0)
  })

  it("truncates beyond maxDepth", () => {
    // Build a 3-deep chain with maxDepth=2 -> level 2 should render the placeholder.
    const deep: TreeNodeData[] = [
      {
        id: "l0",
        label: "L0",
        children: [
          {
            id: "l1",
            label: "L1",
            children: [{ id: "l2", label: "L2" }],
          },
        ],
      },
    ]
    render(<Tree data={deep} defaultExpanded={["l0", "l1"]} maxDepth={2} />)
    expect(screen.getByText(/depth limit reached/i)).toBeInTheDocument()
    expect(screen.queryByText("L2")).not.toBeInTheDocument()
  })

  it("breaks cycles with a warning placeholder", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    // Build a recursive structure: A -> B -> A (same id).
    const a: TreeNodeData = { id: "a", label: "A" }
    const b: TreeNodeData = { id: "b", label: "B", children: [a] }
    a.children = [b]
    render(<Tree data={[a]} defaultExpanded={["a", "b"]} />)
    expect(screen.getByText(/cycle detected/i)).toBeInTheDocument()
    warn.mockRestore()
  })

  it("warns on duplicate ids", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    render(
      <Tree
        data={[
          { id: "dup", label: "A" },
          { id: "dup", label: "B" },
        ]}
      />,
    )
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
