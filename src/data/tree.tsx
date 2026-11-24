"use client"

import { ChevronRight, Loader2 } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TreeNodeData {
  id: string
  label: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  children?: TreeNodeData[]
  /**
   * The node has children that are not loaded yet. Leave `children`
   * undefined: opening the node calls `onLoadChildren(node)` and shows a
   * loading row until you pass the children.
   */
  hasChildren?: boolean
}

export interface TreeLabels {
  /** Row shown while the children of an opened node load. */
  loading: string
  /** Row shown where `maxDepth` stops the tree. */
  depthLimit: string
  /** Row shown where a node would contain itself. */
  cycle: string
}

export const defaultTreeLabels: TreeLabels = {
  loading: "Carregando…",
  depthLimit: "… (limite de profundidade)",
  cycle: "… (ciclo detectado)",
}

export interface TreeProps
  extends Omit<React.HTMLAttributes<HTMLUListElement>, "onSelect" | "defaultValue"> {
  data: TreeNodeData[]
  /** Expanded node ids (controlled): an array or a `Set`. */
  expanded?: Set<string> | string[]
  /** Called when a node is expanded or collapsed. */
  onExpandedChange?: (next: Set<string>) => void
  /** Expanded ids at first render (uncontrolled): an array or a `Set`. */
  defaultExpanded?: Set<string> | string[]
  /** Selected node id (controlled, single selection). */
  selected?: string
  /** Selected node id at first render (uncontrolled). */
  defaultSelected?: string
  /** Called when a node is selected, with its id. */
  onSelectedChange?: (id: string) => void
  /**
   * Called once when a node with `hasChildren` and no `children` is opened.
   * Load its children and pass them in `data`.
   */
  onLoadChildren?: (node: TreeNodeData) => void
  /** Maximum recursion depth. Default `64`. */
  maxDepth?: number
  /** Horizontal indent per nesting level in pixels. Default `16`. */
  indentSize?: number
  labels?: Partial<TreeLabels>
}

const DEFAULT_MAX_DEPTH = 64
const DEFAULT_INDENT = 16
// Separates ids in a node's ancestor path (used to break cycles).
const PATH_SEP = "\u0000"

function nodeHasChildren(node: TreeNodeData): boolean {
  return (node.children?.length ?? 0) > 0 || (node.hasChildren === true && !node.children)
}

function toSet(value: Set<string> | string[] | undefined): Set<string> {
  if (!value) return new Set()
  return value instanceof Set ? value : new Set(value)
}

interface FlatNode {
  id: string
  parentId: string | null
  depth: number
  hasChildren: boolean
  node: TreeNodeData
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
      const hasChildren = nodeHasChildren(node)
      out.push({ id: node.id, parentId, depth, hasChildren, node })
      if (hasChildren && expandedSet.has(node.id) && node.children) {
        walk(node.children, depth + 1, node.id)
      }
    }
  }
  walk(data, 0, null)
  return out
}

/** Collect every id in the tree (no expansion filter), for duplicate-id detection. */
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

/*
 * Per-node state lives in a tiny store. Each node subscribes to its own
 * booleans (focused, expanded, selected), so moving focus with an arrow key
 * re-renders the two nodes involved, not the whole tree.
 */
interface TreeState {
  focusedId: string | null
  expanded: Set<string>
  selected: string | undefined
}

function createTreeStore(initial: TreeState) {
  let state = initial
  const listeners = new Set<() => void>()
  return {
    get: () => state,
    set(next: Partial<TreeState>) {
      state = { ...state, ...next }
      for (const listener of listeners) listener()
    },
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
type TreeStore = ReturnType<typeof createTreeStore>

function useTreeState<T>(store: TreeStore, select: (state: TreeState) => T): T {
  return React.useSyncExternalStore(
    store.subscribe,
    () => select(store.get()),
    () => select(store.get()),
  )
}

interface TreeContextValue {
  store: TreeStore
  activate: (id: string) => void
  toggle: (id: string) => void
  registerItemRef: (id: string, node: HTMLLIElement | null) => void
  maxDepth: number
  indentSize: number
  labels: TreeLabels
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
  defaultSelected,
  onSelectedChange,
  onLoadChildren,
  className,
  maxDepth = DEFAULT_MAX_DEPTH,
  indentSize = DEFAULT_INDENT,
  labels: labelsProp,
  onKeyDown,
  ref,
  ...rest
}: TreeProps & { ref?: React.Ref<HTMLUListElement> }) {
  const isExpandedControlled = expanded !== undefined
  const isSelectedControlled = selected !== undefined
  const [internalExpanded, setInternalExpanded] = React.useState<Set<string>>(() =>
    toSet(defaultExpanded),
  )
  const [internalSelected, setInternalSelected] = React.useState<string | undefined>(
    defaultSelected,
  )
  // A new array every render must not count as a new value.
  const expandedKey = isExpandedControlled ? [...toSet(expanded)].sort().join(PATH_SEP) : ""
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed by the ids, not the object.
  const controlledExpanded = React.useMemo(() => toSet(expanded), [expandedKey])
  const expandedSet = isExpandedControlled ? controlledExpanded : internalExpanded
  const selectedId = isSelectedControlled ? selected : internalSelected

  const labels = React.useMemo(() => ({ ...defaultTreeLabels, ...labelsProp }), [labelsProp])

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

  const [store] = React.useState(() =>
    createTreeStore({
      focusedId: selectedId ?? visible[0]?.id ?? null,
      expanded: expandedSet,
      selected: selectedId,
    }),
  )

  // Keep the store in step with props and the visible list.
  React.useLayoutEffect(() => {
    const { focusedId } = store.get()
    const focusStillVisible = focusedId != null && visible.some((n) => n.id === focusedId)
    store.set({
      expanded: expandedSet,
      selected: selectedId,
      focusedId: focusStillVisible ? focusedId : (visible[0]?.id ?? null),
    })
  }, [store, expandedSet, selectedId, visible])

  // Ask for the children of an opened node once, until they arrive.
  const requested = React.useRef(new Set<string>())
  React.useEffect(() => {
    if (!onLoadChildren) return
    for (const flat of visible) {
      const { node } = flat
      const waiting = node.hasChildren === true && !node.children
      if (!waiting) {
        requested.current.delete(node.id)
        continue
      }
      if (expandedSet.has(node.id) && !requested.current.has(node.id)) {
        requested.current.add(node.id)
        onLoadChildren(node)
      }
    }
  }, [visible, expandedSet, onLoadChildren])

  const itemRefs = React.useRef<Map<string, HTMLLIElement>>(new Map())
  const registerItemRef = React.useCallback((id: string, node: HTMLLIElement | null) => {
    if (node) itemRefs.current.set(id, node)
    else itemRefs.current.delete(id)
  }, [])

  // Callbacks read the latest props through a ref, so they stay stable and
  // the memoised nodes do not re-render when the parent does.
  const latest = React.useRef({
    expandedSet,
    isExpandedControlled,
    isSelectedControlled,
    onExpandedChange,
    onSelectedChange,
    visible,
  })
  latest.current = {
    expandedSet,
    isExpandedControlled,
    isSelectedControlled,
    onExpandedChange,
    onSelectedChange,
    visible,
  }

  const focusItem = React.useCallback(
    (id: string) => {
      store.set({ focusedId: id })
      itemRefs.current.get(id)?.focus()
    },
    [store],
  )

  const toggle = React.useCallback((id: string) => {
    const {
      expandedSet: current,
      isExpandedControlled: controlled,
      onExpandedChange: onChange,
    } = latest.current
    const next = new Set(current)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    if (!controlled) setInternalExpanded(next)
    onChange?.(next)
  }, [])

  const select = React.useCallback((id: string) => {
    const { isSelectedControlled: controlled, onSelectedChange: onChange } = latest.current
    if (!controlled) setInternalSelected(id)
    onChange?.(id)
  }, [])

  /** Click on a row's label: select it, and open a closed folder. */
  const activate = React.useCallback(
    (id: string) => {
      focusItem(id)
      const flat = latest.current.visible.find((n) => n.id === id)
      if (flat?.hasChildren && !latest.current.expandedSet.has(id)) toggle(id)
      select(id)
    },
    [focusItem, toggle, select],
  )

  const typeahead = React.useRef({ text: "", at: 0 })

  // One handler on the tree: a key pressed on a nested item is handled once,
  // for that item (a handler per item also received the keys of its
  // descendants, and ArrowDown stopped at the second level).
  const handleKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    const item = (event.target as HTMLElement).closest<HTMLLIElement>('[role="treeitem"]')
    const id = item?.dataset.id
    if (!item || id === undefined || item !== event.target) return
    const flat = visible
    const idx = flat.findIndex((n) => n.id === id)
    const current = flat[idx]
    if (!current) return

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault()
        const next = flat[idx + 1]
        if (next) focusItem(next.id)
        break
      }
      case "ArrowUp": {
        event.preventDefault()
        const prev = flat[idx - 1]
        if (prev) focusItem(prev.id)
        break
      }
      case "ArrowRight": {
        event.preventDefault()
        if (!current.hasChildren) break
        if (!expandedSet.has(current.id)) toggle(current.id)
        else {
          const next = flat[idx + 1]
          if (next && next.parentId === current.id) focusItem(next.id)
        }
        break
      }
      case "ArrowLeft": {
        event.preventDefault()
        if (current.hasChildren && expandedSet.has(current.id)) toggle(current.id)
        else if (current.parentId) focusItem(current.parentId)
        break
      }
      case "Home": {
        event.preventDefault()
        const first = flat[0]
        if (first) focusItem(first.id)
        break
      }
      case "End": {
        event.preventDefault()
        const last = flat[flat.length - 1]
        if (last) focusItem(last.id)
        break
      }
      case "Enter": {
        event.preventDefault()
        if (current.hasChildren) toggle(current.id)
        select(current.id)
        break
      }
      case " ": {
        event.preventDefault()
        select(current.id)
        break
      }
      default: {
        // Typeahead: letters jump to the next visible item whose text starts
        // with what was typed (a pause of 500ms starts a new search).
        if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) break
        const now = Date.now()
        const buffer = now - typeahead.current.at > 500 ? "" : typeahead.current.text
        const text = (buffer + event.key).toLocaleLowerCase("pt-BR")
        typeahead.current = { text, at: now }
        const textOf = (n: FlatNode) =>
          (itemRefs.current.get(n.id)?.querySelector('[data-slot="tree-label"]')?.textContent ?? "")
            .trim()
            .toLocaleLowerCase("pt-BR")
        // The same letter typed again cycles through the items that start
        // with it; a longer prefix ("blo") stays on the current match.
        const cycling = [...text].every((char) => char === text[0])
        const needle = cycling ? (text[0] as string) : text
        const start = cycling ? idx + 1 : idx
        const ordered = [...flat.slice(start), ...flat.slice(0, start)]
        let match = ordered.find((n) => textOf(n).startsWith(needle))
        if (!match && text.length > 1) {
          // Nothing starts with the whole buffer: start over from this key.
          const key = event.key.toLocaleLowerCase("pt-BR")
          typeahead.current = { text: key, at: now }
          const fresh = [...flat.slice(idx + 1), ...flat.slice(0, idx + 1)]
          match = fresh.find((n) => textOf(n).startsWith(key))
        }
        if (match) {
          event.preventDefault()
          focusItem(match.id)
        }
      }
    }
  }

  const contextValue = React.useMemo<TreeContextValue>(
    () => ({
      store,
      activate,
      toggle,
      registerItemRef,
      maxDepth,
      indentSize,
      labels,
    }),
    [store, activate, toggle, registerItemRef, maxDepth, indentSize, labels],
  )

  return (
    <TreeContext.Provider value={contextValue}>
      <ul
        ref={ref}
        role="tree"
        className={cn("text-sm", className)}
        data-slot="tree"
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {data.map((node) => (
          <TreeNode key={node.id} node={node} depth={0} path={node.id} />
        ))}
      </ul>
    </TreeContext.Provider>
  )
}

interface TreeNodeProps {
  node: TreeNodeData
  depth: number
  /** Ancestor ids, joined: a child already on the path is a cycle. */
  path: string
}

const placeholderRow = "select-none rounded-element px-2 py-1.5 text-muted-foreground"

const TreeNode = React.memo(function TreeNode({ node, depth, path }: TreeNodeProps) {
  const { store, activate, toggle, registerItemRef, maxDepth, indentSize, labels } =
    useTreeContext()
  const isFocused = useTreeState(store, (s) => s.focusedId === node.id)
  const isExpanded = useTreeState(store, (s) => s.expanded.has(node.id))
  const isSelected = useTreeState(store, (s) => s.selected === node.id)
  const hasSelection = useTreeState(store, (s) => s.selected !== undefined)

  const labelId = React.useId()
  const registerRef = React.useCallback(
    (el: HTMLLIElement | null) => registerItemRef(node.id, el),
    [registerItemRef, node.id],
  )

  if (depth >= maxDepth) {
    return (
      <li
        role="treeitem"
        className={placeholderRow}
        style={{ paddingInlineStart: `${depth * indentSize + 8}px` }}
      >
        {labels.depthLimit}
      </li>
    )
  }

  const hasChildren = nodeHasChildren(node)
  const loading = hasChildren && isExpanded && !node.children
  const childIndent = `${(depth + 1) * indentSize + 8}px`

  return (
    <li
      ref={registerRef}
      role="treeitem"
      data-id={node.id}
      // Named by its own label: without this, an open folder would be read
      // with the names of everything inside it.
      aria-labelledby={labelId}
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={hasSelection ? isSelected : undefined}
      aria-busy={loading || undefined}
      tabIndex={isFocused ? 0 : -1}
      // The ring goes on the row, not around the whole branch.
      className="outline-none [&:focus-visible>[data-slot=tree-row]]:focus-outline-inset"
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: the keyboard is handled by the tree (role="tree"). */}
      <div
        data-slot="tree-row"
        className={cn(
          "flex cursor-pointer select-none items-center gap-1 rounded-element py-1.5 pr-2 transition-colors state-layer",
          // Forced colours drop the selected fill: an outline marks it there.
          isSelected &&
            "bg-accent text-accent-foreground forced-colors:outline forced-colors:outline-2 forced-colors:-outline-offset-2 forced-colors:outline-[Highlight]",
        )}
        style={{ paddingInlineStart: `${depth * indentSize + 4}px` }}
        onClick={() => activate(node.id)}
      >
        {hasChildren ? (
          // The chevron only opens and closes; it does not change the selection.
          // biome-ignore lint/a11y/useKeyWithClickEvents: the keyboard is handled by the tree.
          <span
            data-slot="tree-toggle"
            aria-hidden="true"
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-inner"
            onClick={(event) => {
              event.stopPropagation()
              store.set({ focusedId: node.id })
              toggle(node.id)
            }}
          >
            <ChevronRight
              className={cn(
                "size-4 transition-transform duration-(--duration-fast)",
                isExpanded && "rotate-90",
              )}
            />
          </span>
        ) : (
          <span className="size-6 shrink-0" aria-hidden="true" />
        )}
        {node.icon ? <node.icon className="size-4 shrink-0" aria-hidden /> : null}
        <span id={labelId} data-slot="tree-label" className="truncate">
          {node.label}
        </span>
      </div>
      {hasChildren && isExpanded ? (
        // biome-ignore lint/a11y/useSemanticElements: WAI-ARIA tree pattern requires role="group".
        <ul role="group">
          {loading ? (
            <li
              role="treeitem"
              aria-disabled="true"
              data-slot="tree-loading"
              className={cn(placeholderRow, "flex items-center gap-2")}
              style={{ paddingInlineStart: childIndent }}
            >
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              {labels.loading}
            </li>
          ) : null}
          {node.children?.map((child) => {
            if (path.split(PATH_SEP).includes(child.id)) {
              if (process.env.NODE_ENV !== "production") {
                console.warn(
                  `[Tree] cycle detected at node id "${child.id}". Aborting recursion to prevent infinite render.`,
                )
              }
              return (
                <li
                  key={`${child.id}-cycle`}
                  role="treeitem"
                  className={placeholderRow}
                  style={{ paddingInlineStart: childIndent }}
                >
                  {labels.cycle}
                </li>
              )
            }
            return (
              <TreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                path={`${path}${PATH_SEP}${child.id}`}
              />
            )
          })}
        </ul>
      ) : null}
    </li>
  )
})

Tree.displayName = "Tree"

export { Tree }
