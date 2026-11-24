---
"@amfernandesinc/ui": minor
---

**`DataTable`: ids de coluna com chave aninhada e `ColumnDef` exportado.** `searchableColumns`, `sortableColumns`, `pinnedColumns` e `meta.exportOnly` aceitam a `accessorKey` como escrita (`"cliente.nome"`), além do id do TanStack (`"cliente_nome"`); antes só o segundo funcionava, e `exportOnly` numa chave aninhada não escondia a coluna. As listas passam a ser tipadas (`DataTableColumnKey<TData>`): o editor sugere as chaves da linha e aceita qualquer outro id.

`ColumnDef`, `PaginationState` e `SortingState` são reexportados por `@amfernandesinc/ui`, então não é mais preciso importar `@tanstack/react-table`, que é uma dependência transitiva.
