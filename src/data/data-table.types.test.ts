import type { ColumnDef as TanstackColumnDef } from "@tanstack/react-table"
import { describe, expectTypeOf, it } from "vitest"

import type { ColumnDef, DataTableProps, PaginationState, SortingState } from "../index"

interface Contrato {
  numero: string
  cliente: { nome: string }
}

describe("DataTable types", () => {
  it("re-exports ColumnDef and the state types, so consumers need no transitive import", () => {
    expectTypeOf<ColumnDef<Contrato>>().toEqualTypeOf<TanstackColumnDef<Contrato>>()
    expectTypeOf<PaginationState>().toEqualTypeOf<{ pageIndex: number; pageSize: number }>()
    expectTypeOf<SortingState>().items.toHaveProperty("desc")
  })

  it("suggests the row's keys for searchableColumns and sortableColumns, and takes any id", () => {
    type Keys = NonNullable<DataTableProps<Contrato>["searchableColumns"]>[number]
    expectTypeOf<"numero">().toMatchTypeOf<Keys>()
    expectTypeOf<"cliente.nome">().toMatchTypeOf<Keys>()
    expectTypeOf<"acoes">().toMatchTypeOf<Keys>()
    type Sortable = NonNullable<DataTableProps<Contrato>["sortableColumns"]>[number]
    expectTypeOf<Keys>().toEqualTypeOf<Sortable>()
  })
})
