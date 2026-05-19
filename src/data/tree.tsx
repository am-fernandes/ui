"use client"

import { ChevronRight } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TreeNodeData {
  id: string
  label: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  children?: TreeNodeData[]
}

export interface TreeProps extends Omit<React.HTMLAttributes<HTMLUListElement>, "onSelect"> {
  data: TreeNodeData[]
  /** Controlled set of expanded node ids. */
  expanded?: Set<string>
  /** Called when a node is expanded or collapsed. */
  onExpandedChange?: (next: Set<string>) => void
  /** Default expanded ids (uncontrolled). */
  defaultExpanded?: string[]
  /** Selected node id (single-select). */
  selected?: string
  /** Called when a leaf or node is selected. */
  onSelectedChange?: (id: string) => void
  /** Maximum recursion depth. Default `64`. */
  maxDepth?: number
  /** Horizontal indent per nesting level in pixels. Default `16`. */
  indentSize?: number
}

const DEFAULT_MAX_DEPTH = 64
const DEFAULT_INDENT = 16

interface FlatNode {
  id: string
  parentId: string | null
  depth: number
  hasChildren: boolean
}

/** Walk `data` honoring expansion state, producing the visible nodes in order. */
function buildVisibleList(
  data: TreeNodeData[],
  expandedSet: Set<string>,
  maxDepth: number,
): FlatNode[] {
  const out: FlatNode[] = []
  const visited = new Set<string>()
  function walk(nodes: TreeNodeData[], depth: number, parentId: string | null) {
    if (depth >= maxDepth) return
    for (const node of nodes) {
      if (visited.has(node.id)) continue
      visited.add(node.id)
      const hasChildren = !!node.children && node.children.length > 0
      out.push({ id: node.id, parentId, depth, hasChildren })
      if (hasChildren && expandedSet.has(node.id)) {
        walk(node.children ?? [], depth + 1, node.id)
      }
    }
  }
  walk(data, 0, null)
  return out
}

/** Collect every id in the tree (no expansion filter), for duplicate-id detection.
 * Bounded against cyclic structures via a visited-node Set.
 */
function collectAllIds(data: TreeNodeData[]): string[] {
  const out: string[] = []
  const visited = new WeakSet<TreeNodeData>()
  function walk(nodes: TreeNodeData[]) {
    for (const node of nodes) {
      if (visited.has(node)) continue
      visited.add(node)
      out.push(node.id)
      if (node.children?.length) walk(node.children)
    }
  }
  walk(data)
  return out
}

interface TreeContextValue {
  expandedSet: Set<string>
  onToggle: (id: string) => void
  selected?: string
  onSelectedChange?: (id: string) => void
  maxDepth: number
  indentSize: number
  focusedId: string | null
  setFocusedId: (id: string) => void
  registerItemRef: (id: string, node: HTMLLIElement | null) => void
  handleItemKeyDown: (e: React.KeyboardEvent<HTMLLIElement>, id: string) => void
}

const TreeContext = React.createContext<TreeContextValue | null>(null)
function useTreeContext() {
  const ctx = React.useContext(TreeContext)
  if (!ctx) throw new Error("Tree subcomponents must be used inside <Tree />")
  return ctx
}

function Tree({
  data,
  expanded,
  onExpandedChange,
  defaultExpanded,
  selected,
  onSelectedChange,
  className,
  maxDepth = DEFAULT_MAX_DEPTH,
  indentSize = DEFAULT_INDENT,
  ref,
  ...rest
}: TreeProps & { ref?: React.Ref<HTMLUListElement> }) {
  const isControlled = expanded !== undefined
  const [internalExpanded, setInternalExpanded] = React.useState<Set<string>>(
    () => new Set(defaultExpanded ?? []),
  )
  const expandedSet = isControlled ? expanded : internalExpanded

  const toggle = React.useCallback(
    (id: string) => {
      const next = new Set(expandedSet)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      if (isControlled) onExpandedChange?.(next)
      else setInternalExpanded(next)
    },
    [expandedSet, isControlled, onExpandedChange],
  )

  // Dev-time check for duplicate ids.
  React.useMemo(() => {
    if (process.env.NODE_ENV === "production") return null
    const ids = collectAllIds(data)
    const seen = new Set<string>()
    const dupes = new Set<string>()
    for (const id of ids) {
      if (seen.has(id)) dupes.add(id)
      else seen.add(id)
    }
    if (dupes.size > 0) {
      console.warn(
        `[Tree] duplicate node id(s) detected: ${Array.from(dupes).join(", ")}. Tree expects unique ids on every node.`,
      )
    }
    return null
  }, [data])

  const visible = React.useMemo(
    () => buildVisibleList(data, expandedSet, maxDepth),
    [data, expandedSet, maxDepth],
  )

  // Track which item should receive tab focus (roving tabindex).
  const [focusedId, setFocusedIdState] = React.useState<string | null>(() => {
    if (selected) return selected
    return visible[0]?.id ?? null
  })

  // Ensure the focused id stays valid when visibility changes.
  React.useEffect(() => {
    if (visible.length === 0) {
      setFocusedIdState(null)
      return
    }
    if (focusedId && visible.some((n) => n.id === focusedId)) return
    setFocusedIdState(visible[0]?.id ?? null)
  }, [visible, focusedId])

  const itemRefs = React.useRef<Map<string, HTMLLIElement>>(new Map())

  const registerItemRef = React.useCallback((id: string, node: HTMLLIElement | null) => {
    if (node) itemRefs.current.set(id, node)
    else itemRefs.current.delete(id)
  }, [])

  const setFocusedId = React.useCallback((id: string) => {
    setFocusedIdState(id)
    const node = itemRefs.current.get(id)
    if (node) node.focus()
  }, [])

  const handleItemKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLLIElement>, id: string) => {
      const flat = visible
      const idx = flat.findIndex((n) => n.id === id)
      if (idx === -1) return
      const current = flat[idx]
      if (!current) return

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault()
          const next = flat[idx + 1]
          if (next) setFocusedId(next.id)
          break
        }
        case "ArrowUp": {
          e.preventDefault()
          const prev = flat[idx - 1]
          if (prev) setFocusedId(prev.id)
          break
        }
        case "ArrowRight": {
          e.preventDefault()
          if (current.hasChildren) {
            if (!expandedSet.has(current.id)) {
              toggle(current.id)
            } else {
              const next = flat[idx + 1]
              if (next && next.parentId === current.id) setFocusedId(next.id)
            }
          }
          break
        }
        case "ArrowLeft": {
          e.preventDefault()
          if (current.hasChildren && expandedSet.has(current.id)) {
            toggle(current.id)
          } else if (current.parentId) {
            setFocusedId(current.parentId)
          }
          break
        }
        case "Home": {
          e.preventDefault()
          const first = flat[0]
          if (first) setFocusedId(first.id)
          break
        }
        case "End": {
          e.preventDefault()
          const last = flat[flat.length - 1]
          if (last) setFocusedId(last.id)
          break
        }
        case "Enter":
        case " ": {
          e.preventDefault()
          if (current.hasChildren) toggle(current.id)
          onSelectedChange?.(current.id)
          break
        }
        default:
          break
      }
    },
    [visible, expandedSet, toggle, setFocusedId, onSelectedChange],
  )

  const contextValue: TreeContextValue = React.useMemo(
    () => ({
      expandedSet,
      onToggle: toggle,
      selected,
      onSelectedChange,
      maxDepth,
      indentSize,
      focusedId,
      setFocusedId,
      registerItemRef,
      handleItemKeyDown,
    }),
    [
      expandedSet,
      toggle,
      selected,
      onSelectedChange,
      maxDepth,
      indentSize,
      focusedId,
      setFocusedId,
      registerItemRef,
      handleItemKeyDown,
    ],
  )

  return (
    <TreeContext.Provider value={contextValue}>
      <ul ref={ref} role="tree" className={cn("text-sm", className)} data-slot="tree" {...rest}>
        {data.map((node) => (
          <TreeNode key={node.id} node={node} depth={0} visited={new Set([node.id])} />
        ))}
      </ul>
    </TreeContext.Provider>
  )
}

interface TreeNodeProps {
  node: TreeNodeData
  depth: number
  visited: Set<string>
}

const TreeNode = React.memo(function TreeNode({ node, depth, visited }: TreeNodeProps) {
  const {
    expandedSet,
    onToggle,
    selected,
    onSelectedChange,
    maxDepth,
    indentSize,
    focusedId,
    registerItemRef,
    handleItemKeyDown,
    setFocusedId,
  } = useTreeContext()

  // Depth-limit guard.
  if (depth >= maxDepth) {
    return (
      <li
        role="treeitem"
        className="select-none rounded-sm px-2 py-1.5 text-muted-foreground"
        style={{ paddingInlineStart: `${depth * indentSize + 8}px` }}
      >
        … (depth limit reached)
      </li>
    )
  }

  const hasChildren = !!node.children && node.children.length > 0
  const isExpanded = expandedSet.has(node.id)
  const isSelected = selected === node.id
  const isFocused = focusedId === node.id

  const handleRowActivate = () => {
    setFocusedId(node.id)
    if (hasChildren) onToggle(node.id)
    onSelectedChange?.(node.id)
  }

  return (
    <li
      ref={(el) => registerItemRef(node.id, el)}
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={selected !== undefined ? isSelected : undefined}
      tabIndex={isFocused ? 0 : -1}
      onKeyDown={(e) => handleItemKeyDown(e, node.id)}
    >
      <div
        className={cn(
          "flex cursor-pointer select-none items-center gap-1 rounded-sm px-2 py-1.5 transition-colors hover:bg-accent",
          isSelected && "bg-accent text-accent-foreground",
        )}
        style={{ paddingInlineStart: `${depth * indentSize + 8}px` }}
        onClick={handleRowActivate}
        onKeyDown={(e) => {
          // Row keyboard activation — defer to the parent <li> for arrow nav.
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleRowActivate()
          }
        }}
      >
        {hasChildren ? (
          <ChevronRight
            className={cn("size-4 shrink-0 transition-transform", isExpanded && "rotate-90")}
            aria-hidden
          />
        ) : (
          <span className="size-4 shrink-0" aria-hidden />
        )}
        {node.icon ? <node.icon className="size-4 shrink-0" aria-hidden /> : null}
        <span className="truncate">{node.label}</span>
      </div>
      {hasChildren && isExpanded ? (
        // biome-ignore lint/a11y/useSemanticElements: WAI-ARIA tree pattern requires role="group".
        <ul role="group">
          {node.children?.map((child) => {
            if (visited.has(child.id)) {
              if (process.env.NODE_ENV !== "production") {
                console.warn(
                  `[Tree] cycle detected at node id "${child.id}". Aborting recursion to prevent infinite render.`,
                )
              }
              return (
                <li
                  key={`${child.id}-cycle`}
                  role="treeitem"
                  className="select-none rounded-sm px-2 py-1.5 text-muted-foreground"
                  style={{ paddingInlineStart: `${(depth + 1) * indentSize + 8}px` }}
                >
                  … (cycle detected)
                </li>
              )
            }
            const nextVisited = new Set(visited)
            nextVisited.add(child.id)
            return <TreeNode key={child.id} node={child} depth={depth + 1} visited={nextVisited} />
          })}
        </ul>
      ) : null}
    </li>
  )
})

export { Tree }
