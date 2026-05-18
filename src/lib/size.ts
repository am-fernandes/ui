/**
 * Tiny helpers to express byte sizes ergonomically.
 *
 * @example
 *   <FileUpload maxSize={mb(2)} />        // 2 MiB
 *   <FileUpload maxSize={kb(500)} />      // 500 KiB
 *   <FileUpload maxSize={gb(1)} />        // 1 GiB
 *
 * Units are binary (KiB / MiB / GiB), matching the formatter used by `FileUpload`.
 */
export const bytes = (n: number) => n
export const kb = (n: number) => n * 1024
export const mb = (n: number) => n * 1024 * 1024
export const gb = (n: number) => n * 1024 * 1024 * 1024
