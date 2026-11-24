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
    expect(screen.getByText(/limite de profundidade/i)).toBeInTheDocument()
    expect(screen.queryByText("L2")).not.toBeInTheDocument()
  })

  it("breaks cycles with a warning placeholder", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    // Build a recursive structure: A -> B -> A (same id).
    const a: TreeNodeData = { id: "a", label: "A" }
    const b: TreeNodeData = { id: "b", label: "B", children: [a] }
    a.children = [b]
    render(<Tree data={[a]} defaultExpanded={["a", "b"]} />)
    expect(screen.getByText(/ciclo detectado/i)).toBeInTheDocument()
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

  it("invokes onExpandedChange when expansion is controlled and a node is clicked", async () => {
    const onExpandedChange = vi.fn()
    render(<Tree data={data} expanded={new Set<string>()} onExpandedChange={onExpandedChange} />)
    await userEvent.click(screen.getByText("Root"))
    expect(onExpandedChange).toHaveBeenCalled()
    // Should be expanded set with `root` in it.
    const [arg] = onExpandedChange.mock.calls[0]!
    expect(arg.has("root")).toBe(true)
  })

  it("keyboard nav: ArrowUp moves focus to the previous item", () => {
    render(<Tree data={data} defaultExpanded={["root"]} />)
    const items = screen.getAllByRole("treeitem")
    // items: Root, Child 1, Child 2, Sibling
    const child2 = items[2] as HTMLElement
    child2.focus()
    fireEvent.keyDown(child2, { key: "ArrowUp" })
    // After ArrowUp, Child 1 (index 1) is focused.
    const updated = screen.getAllByRole("treeitem")
    expect(updated[1]?.getAttribute("tabindex")).toBe("0")
  })

  it("keyboard nav: ArrowRight on expanded parent moves focus to first child", () => {
    render(<Tree data={data} defaultExpanded={["root"]} />)
    const items = screen.getAllByRole("treeitem")
    const root = items[0] as HTMLElement
    root.focus()
    fireEvent.keyDown(root, { key: "ArrowRight" })
    const updated = screen.getAllByRole("treeitem")
    // First child becomes focused.
    expect(updated[1]?.getAttribute("tabindex")).toBe("0")
  })

  it("keyboard nav: ArrowLeft on a child moves focus to the parent", () => {
    render(<Tree data={data} defaultExpanded={["root"]} />)
    const items = screen.getAllByRole("treeitem")
    const child1 = items[1] as HTMLElement
    child1.focus()
    fireEvent.keyDown(child1, { key: "ArrowLeft" })
    const updated = screen.getAllByRole("treeitem")
    // Parent (Root) is focused.
    expect(updated[0]?.getAttribute("tabindex")).toBe("0")
  })

  it("keyboard nav: Home focuses the first visible item", () => {
    render(<Tree data={data} defaultExpanded={["root"]} />)
    const items = screen.getAllByRole("treeitem")
    const last = items[items.length - 1] as HTMLElement
    last.focus()
    fireEvent.keyDown(last, { key: "Home" })
    const updated = screen.getAllByRole("treeitem")
    expect(updated[0]?.getAttribute("tabindex")).toBe("0")
  })

  it("keyboard nav: End focuses the last visible item", () => {
    render(<Tree data={data} defaultExpanded={["root"]} />)
    const items = screen.getAllByRole("treeitem")
    const root = items[0] as HTMLElement
    root.focus()
    fireEvent.keyDown(root, { key: "End" })
    const updated = screen.getAllByRole("treeitem")
    expect(updated[updated.length - 1]?.getAttribute("tabindex")).toBe("0")
  })

  it("keyboard nav: Enter on a leaf calls onSelectedChange", () => {
    const onSelectedChange = vi.fn()
    render(<Tree data={data} onSelectedChange={onSelectedChange} />)
    const items = screen.getAllByRole("treeitem")
    // Sibling is the second top-level (leaf) item.
    const sibling = items[1] as HTMLElement
    sibling.focus()
    fireEvent.keyDown(sibling, { key: "Enter" })
    expect(onSelectedChange).toHaveBeenCalledWith("sibling")
  })

  it("keyboard nav: Space selects a parent without opening it; Enter selects and opens it", () => {
    const onSelectedChange = vi.fn()
    render(<Tree data={data} onSelectedChange={onSelectedChange} />)
    const root = screen.getAllByRole("treeitem")[0] as HTMLElement
    root.focus()
    fireEvent.keyDown(root, { key: " " })
    expect(onSelectedChange).toHaveBeenCalledWith("root")
    expect(screen.queryByText("Child 1")).not.toBeInTheDocument()
    fireEvent.keyDown(root, { key: "Enter" })
    expect(screen.getByText("Child 1")).toBeInTheDocument()
  })

  it("keyboard nav: ArrowRight on a collapsed leaf is a no-op", () => {
    const onSelectedChange = vi.fn()
    render(<Tree data={data} onSelectedChange={onSelectedChange} />)
    const items = screen.getAllByRole("treeitem")
    // Sibling is a leaf at index 1.
    const sibling = items[1] as HTMLElement
    sibling.focus()
    fireEvent.keyDown(sibling, { key: "ArrowRight" })
    // No children should appear; sibling stays focused.
    const updated = screen.getAllByRole("treeitem")
    expect(updated.length).toBe(2)
  })

  it("keyboard nav: ArrowLeft on a top-level leaf with no parent does not change focus", () => {
    // Initial focused id is "root" (first visible). Dispatch ArrowLeft on the
    // Sibling treeitem — since Sibling has no parent and no children to
    // collapse, the handler is a no-op. Root keeps the roving tabindex.
    render(<Tree data={data} />)
    const items = screen.getAllByRole("treeitem")
    const sibling = items[1] as HTMLElement
    fireEvent.keyDown(sibling, { key: "ArrowLeft" })
    const updated = screen.getAllByRole("treeitem")
    expect(updated[0]?.getAttribute("tabindex")).toBe("0")
    expect(updated[1]?.getAttribute("tabindex")).toBe("-1")
  })

  it("sets initial focusedId from the `selected` prop when present", () => {
    render(<Tree data={data} selected="sibling" />)
    const items = screen.getAllByRole("treeitem")
    // Sibling (index 1) should have tabindex=0 because it's the initial focus.
    expect(items[1]?.getAttribute("tabindex")).toBe("0")
    expect(items[1]?.getAttribute("aria-selected")).toBe("true")
  })

  it("Enter and Space on an item select it; other keys do not", () => {
    const onSelectedChange = vi.fn()
    render(<Tree data={data} onSelectedChange={onSelectedChange} />)
    const sibling = screen.getAllByRole("treeitem")[1] as HTMLElement
    sibling.focus()
    fireEvent.keyDown(sibling, { key: "x" })
    expect(onSelectedChange).not.toHaveBeenCalled()
    fireEvent.keyDown(sibling, { key: "Enter" })
    expect(onSelectedChange).toHaveBeenCalledWith("sibling")
    onSelectedChange.mockClear()
    fireEvent.keyDown(sibling, { key: " " })
    expect(onSelectedChange).toHaveBeenCalledWith("sibling")
  })
})

const deep: TreeNodeData[] = [
  {
    id: "emp",
    label: "Residencial Aurora",
    children: [
      {
        id: "bloco-a",
        label: "Bloco A",
        children: [
          { id: "u101", label: "Unidade 101" },
          { id: "u102", label: "Unidade 102" },
        ],
      },
      { id: "bloco-b", label: "Bloco B" },
    ],
  },
  { id: "outro", label: "Parque das Águas" },
]

describe("Tree: nested items", () => {
  const focused = () =>
    document.activeElement?.querySelector('[data-slot="tree-label"]')?.textContent

  it("ArrowDown walks every visible item, at every depth", async () => {
    render(<Tree aria-label="Empreendimentos" data={deep} defaultExpanded={["emp", "bloco-a"]} />)
    ;(screen.getAllByRole("treeitem")[0] as HTMLElement).focus()
    const seen = [focused()]
    for (let i = 0; i < 5; i++) {
      await userEvent.keyboard("{ArrowDown}")
      seen.push(focused())
    }
    expect(seen).toEqual([
      "Residencial Aurora",
      "Bloco A",
      "Unidade 101",
      "Unidade 102",
      "Bloco B",
      "Parque das Águas",
    ])
  })

  it("a key pressed on a nested item acts on that item only", async () => {
    const onSelectedChange = vi.fn()
    const onExpandedChange = vi.fn()
    render(
      <Tree
        data={deep}
        defaultExpanded={["emp", "bloco-a"]}
        onSelectedChange={onSelectedChange}
        onExpandedChange={onExpandedChange}
      />,
    )
    const unit = screen.getByText("Unidade 102").closest('[role="treeitem"]') as HTMLElement
    unit.focus()
    await userEvent.keyboard("{Enter}")
    expect(onSelectedChange.mock.calls).toEqual([["u102"]])
    expect(onExpandedChange).not.toHaveBeenCalled()
    await userEvent.keyboard("{ArrowLeft}")
    expect(focused()).toBe("Bloco A")
    // Nothing closed: ArrowLeft on a leaf only moves to its parent.
    expect(screen.getByText("Unidade 101")).toBeInTheDocument()
  })

  it("typing a letter jumps to the next item that starts with it", async () => {
    render(<Tree data={deep} defaultExpanded={["emp", "bloco-a"]} />)
    ;(screen.getAllByRole("treeitem")[0] as HTMLElement).focus()
    await userEvent.keyboard("b")
    expect(focused()).toBe("Bloco A")
    await userEvent.keyboard("b")
    expect(focused()).toBe("Bloco B")
    await userEvent.keyboard("p")
    expect(focused()).toBe("Parque das Águas")
  })
})

describe("Tree: clicks", () => {
  it("the chevron opens and closes without changing the selection", async () => {
    const onSelectedChange = vi.fn()
    const { container } = render(
      <Tree data={deep} selected="outro" onSelectedChange={onSelectedChange} />,
    )
    const chevron = container.querySelector('[data-slot="tree-toggle"]') as HTMLElement
    await userEvent.click(chevron)
    expect(screen.getByText("Bloco A")).toBeInTheDocument()
    await userEvent.click(chevron)
    expect(screen.queryByText("Bloco A")).not.toBeInTheDocument()
    expect(onSelectedChange).not.toHaveBeenCalled()
  })

  it("the label selects, opens a closed folder and never closes an open one", async () => {
    const onSelectedChange = vi.fn()
    render(<Tree data={deep} onSelectedChange={onSelectedChange} />)
    await userEvent.click(screen.getByText("Residencial Aurora"))
    expect(onSelectedChange).toHaveBeenLastCalledWith("emp")
    expect(screen.getByText("Bloco A")).toBeInTheDocument()
    await userEvent.click(screen.getByText("Residencial Aurora"))
    expect(screen.getByText("Bloco A")).toBeInTheDocument()
  })
})

describe("Tree: props", () => {
  it("accepts expanded as an array", () => {
    render(<Tree data={deep} expanded={["emp"]} />)
    expect(screen.getByText("Bloco A")).toBeInTheDocument()
    expect(screen.queryByText("Unidade 101")).not.toBeInTheDocument()
  })

  it("keeps an uncontrolled selection from defaultSelected", async () => {
    render(<Tree data={deep} defaultSelected="outro" />)
    const outro = screen.getByText("Parque das Águas").closest('[role="treeitem"]')
    expect(outro).toHaveAttribute("aria-selected", "true")
    await userEvent.click(screen.getByText("Residencial Aurora"))
    expect(outro).toHaveAttribute("aria-selected", "false")
    expect(screen.getByText("Residencial Aurora").closest('[role="treeitem"]')).toHaveAttribute(
      "aria-selected",
      "true",
    )
  })

  it("asks for the children of a lazy node once and shows a loading row meanwhile", async () => {
    const onLoadChildren = vi.fn()
    const lazy: TreeNodeData[] = [{ id: "emp", label: "Residencial Aurora", hasChildren: true }]
    const { rerender } = render(<Tree data={lazy} onLoadChildren={onLoadChildren} />)
    const item = screen.getByText("Residencial Aurora").closest('[role="treeitem"]')
    expect(item).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(screen.getByText("Residencial Aurora"))
    expect(onLoadChildren).toHaveBeenCalledTimes(1)
    expect(onLoadChildren).toHaveBeenCalledWith(lazy[0])
    expect(screen.getByText("Carregando…")).toBeInTheDocument()
    expect(item).toHaveAttribute("aria-busy", "true")

    rerender(
      <Tree
        data={[{ ...lazy[0], children: [{ id: "bloco-a", label: "Bloco A" }] } as TreeNodeData]}
        onLoadChildren={onLoadChildren}
      />,
    )
    expect(screen.queryByText("Carregando…")).not.toBeInTheDocument()
    expect(screen.getByText("Bloco A")).toBeInTheDocument()
    expect(onLoadChildren).toHaveBeenCalledTimes(1)
  })

  it("takes its fixed texts from labels", () => {
    const deepChain: TreeNodeData[] = [
      {
        id: "a",
        label: "A",
        children: [{ id: "b", label: "B", children: [{ id: "c", label: "C" }] }],
      },
    ]
    render(
      <Tree
        data={deepChain}
        defaultExpanded={["a", "b"]}
        maxDepth={2}
        labels={{ depthLimit: "Mais níveis ocultos" }}
      />,
    )
    expect(screen.getByText("Mais níveis ocultos")).toBeInTheDocument()
  })
})

describe("Tree: large trees", () => {
  it("an arrow key re-renders the two items involved, not all 2,000", async () => {
    let renders = 0
    function CountingIcon({ className }: { className?: string }) {
      renders += 1
      return <span className={className} />
    }
    const big: TreeNodeData[] = Array.from({ length: 2000 }, (_, i) => ({
      id: `n${i}`,
      label: `Unidade ${i}`,
      icon: CountingIcon,
    }))
    render(<Tree data={big} />)
    expect(renders).toBe(2000)
    ;(screen.getAllByRole("treeitem")[0] as HTMLElement).focus()
    renders = 0
    await userEvent.keyboard("{ArrowDown}")
    expect(renders).toBeLessThanOrEqual(2)
    // Mounting 2,000 items takes seconds under coverage instrumentation; the
    // assertion is about re-renders, not time.
  }, 30_000)
})
