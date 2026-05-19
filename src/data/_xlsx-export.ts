/**
 * Lazy-loaded XLSX export helper. Dynamic-imports `xlsx` only when called so the
 * main bundle of `@amfernandesinc/ui` stays small for consumers that never trigger
 * a download.
 */
export async function downloadXlsx(
  records: Record<string, unknown>[],
  filename: string,
  sheetName: string,
): Promise<void> {
  const XLSX = await import("xlsx")
  const worksheet = XLSX.utils.json_to_sheet(records)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, filename)
}
