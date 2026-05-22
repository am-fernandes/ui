---
"@amfernandesinc/ui": minor
---

DataTable: optional `pagination.pageSizeOptions`

Pass an array of page sizes (e.g. `[10, 20, 50, 100]`) and the footer
renders a "Linhas por página" select next to the page indicator. Picking
an option resets the cursor to page 0 and propagates the new pageSize
through `onPaginationChange` — works for both client- and
manual-paginated tables. New labels `pageSize` / `pageSizeAriaLabel`
are overridable via the `labels` prop.

Existing consumers that don't pass `pageSizeOptions` keep the previous
footer shape (no select rendered).
