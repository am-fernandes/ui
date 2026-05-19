/**
 * Helper for raw HTML <table> usage when DataTable would be overkill.
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
    row: "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
    head: "px-4 py-4 text-left align-middle font-medium text-muted-foreground",
    cell: "px-4 py-4 align-middle",
    caption: "mt-4 text-sm text-muted-foreground",
  } as const
}

export type TableStyles = ReturnType<typeof tableStyles>
