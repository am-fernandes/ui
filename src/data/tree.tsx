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

export interface TreeProps extends React.HTMLAttributes<HTMLUListElement> {
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
}

const Tree = React.forwardRef<HTMLUListElement, TreeProps>(
  (
    {
      data,
      expanded,
      onExpandedChange,
      defaultExpanded,
      selected,
      onSelectedChange,
      className,
      ...rest
    },
    ref,
  ) => {
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

    return (
      <ul ref={ref} role="tree" className={cn("text-sm", className)} data-slot="tree" {...rest}>
        {data.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            expandedSet={expandedSet}
            onToggle={toggle}
            selected={selected}
            onSelectedChange={onSelectedChange}
          />
        ))}
      </ul>
    )
  },
)
Tree.displayName = "Tree"

interface TreeNodeProps {
  node: TreeNodeData
  depth: number
  expandedSet: Set<string>
  onToggle: (id: string) => void
  selected?: string
  onSelectedChange?: (id: string) => void
}

function TreeNode({
  node,
  depth,
  expandedSet,
  onToggle,
  selected,
  onSelectedChange,
}: TreeNodeProps) {
  const hasChildren = !!node.children && node.children.length > 0
  const isExpanded = expandedSet.has(node.id)
  const isSelected = selected === node.id

  return (
    <li role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined}>
      <div
        className={cn(
          "flex cursor-pointer select-none items-center gap-1 rounded-sm px-2 py-1 hover:bg-accent",
          isSelected && "bg-accent text-accent-foreground",
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          if (hasChildren) onToggle(node.id)
          onSelectedChange?.(node.id)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            if (hasChildren) onToggle(node.id)
            onSelectedChange?.(node.id)
          }
        }}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: treeitem rows need keyboard focus.
        tabIndex={0}
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
          {node.children?.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedSet={expandedSet}
              onToggle={onToggle}
              selected={selected}
              onSelectedChange={onSelectedChange}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export { Tree }
