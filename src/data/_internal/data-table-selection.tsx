"use client"

import type { ColumnDef } from "@tanstack/react-table"
import * as React from "react"

import { Checkbox } from "../../primitives/checkbox"

/** Id of the checkbox column `DataTable` adds with `selectable`. */
export const SELECTION_COLUMN_ID = "__data_table_select"

export interface SelectionContextValue {
  isSelected: (rowId: string) => boolean
  /** Adds (`selected`) or removes the ids, keeping the others. */
  setSelected: (rowIds: string[], selected: boolean) => void
  /** Ids of the rows on screen (the current page). */
  pageIds: string[]
  /** Accessible name of a row's checkbox ("Selecionar C-2026-001"). */
  rowCheckboxLabel: (rowId: string) => string
  /** Accessible name of the header checkbox. */
  pageCheckboxLabel: string
}

const SelectionContext = React.createContext<SelectionContextValue | null>(null)

export const SelectionProvider = SelectionContext.Provider

/** The box stays 16px; the target grows to 24 × 24 (WCAG 2.5.8). */
const HIT_AREA = "relative before:absolute before:-inset-1"

function PageCheckbox() {
  const selection = React.useContext(SelectionContext)
  if (!selection) return null
  const selectedOnPage = selection.pageIds.filter(selection.isSelected).length
  const checked =
    selection.pageIds.length > 0 && selectedOnPage === selection.pageIds.length
      ? true
      : selectedOnPage > 0
        ? "indeterminate"
        : false
  return (
    <Checkbox
      data-slot="data-table-select-page"
      aria-label={selection.pageCheckboxLabel}
      checked={checked}
      disabled={selection.pageIds.length === 0}
      onCheckedChange={(next) => selection.setSelected(selection.pageIds, next)}
      className={HIT_AREA}
    />
  )
}

function RowCheckbox({ rowId }: { rowId: string }) {
  const selection = React.useContext(SelectionContext)
  if (!selection) return null
  return (
    <Checkbox
      data-slot="data-table-select-row"
      aria-label={selection.rowCheckboxLabel(rowId)}
      checked={selection.isSelected(rowId)}
      onCheckedChange={(next) => selection.setSelected([rowId], next)}
      className={HIT_AREA}
    />
  )
}

/**
 * The checkbox column. It reads the selection from context, so the column
 * definition stays the same across renders and TanStack keeps its models.
 */
export function selectionColumn<TData>(): ColumnDef<TData> {
  return {
    id: SELECTION_COLUMN_ID,
    header: () => <PageCheckbox />,
    cell: ({ row }) => <RowCheckbox rowId={row.id} />,
    enableSorting: false,
    enableGlobalFilter: false,
    meta: { export: false },
  }
}
