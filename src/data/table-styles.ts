/**
 * Helper for raw HTML <table> usage when DataTable would be overkill. The
 * classes are the DataTable's own: same row density and selected colour.
 *
 * @example
 *   const t = tableStyles()
 *   <table className={t.table}>
 *     <thead className={t.header}><tr><th className={t.head}>Nome</th></tr></thead>
 *     <tbody>
 *       <tr className={t.row}><td className={t.cell}>...</td></tr>
 *     </tbody>
 *   </table>
 */
export function tableStyles() {
  return {
    table: "w-full caption-bottom text-sm",
    header: "[&_tr]:border-b",
    body: "[&_tr:last-child]:border-0",
    footer: "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
    // Selected (`data-state="selected"`): the DataTable's colours, and a system
    // outline in forced colours, where the fill is dropped.
    row: "border-b transition-colors hover:state-hover data-[state=selected]:bg-accent data-[state=selected]:text-accent-foreground forced-colors:data-[state=selected]:outline-2 forced-colors:data-[state=selected]:-outline-offset-2 forced-colors:data-[state=selected]:outline-[Highlight]",
    // The library's table row density: `py-2.5 px-3` (about 41px rows).
    head: "px-3 py-2.5 text-left align-middle font-medium text-muted-foreground",
    cell: "px-3 py-2.5 align-middle",
    caption: "mt-4 text-sm text-muted-foreground",
  } as const
}

export type TableStyles = ReturnType<typeof tableStyles>
