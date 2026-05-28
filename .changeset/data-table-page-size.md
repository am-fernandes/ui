---
"@amfernandesinc/ui": minor
---

DataTable: optional `pagination.pageSizeOptions`

Pass an array of page sizes (e.g. `[10, 20, 50, 100]`) and the footer
renders a "Linhas por página" select next to the page indicator. Picking
an option resets the cursor to page 0 (atomically, via `setPagination`)
and propagates the new pageSize through `onPaginationChange` — works for
both client- and manual-paginated tables. When `pageSizeOptions` is set
but `pagination.pageSize` is omitted, the initial size defaults to the
first option (instead of 10) so the `<select>` value always matches.
New label `pageSize` is overridable via the `labels` prop and doubles
as the accessible name (no separate `aria-label` — visible text equals
accessible name, satisfying WCAG 2.5.3).

Existing consumers that don't pass `pageSizeOptions` keep the previous
footer shape (no select rendered).
