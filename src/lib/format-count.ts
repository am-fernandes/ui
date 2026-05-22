/**
 * Formats an integer count for badge / notification UIs, capping at `max`.
 *
 * - `count <= max` → `String(count)`
 * - `count > max` → `${max}+` (e.g. `9999+`)
 * - `count < 0` → `"0"` (clamped — counters are non-negative by convention)
 * - non-finite (`NaN`, `Infinity`) → `"0"`
 *
 * @example
 *   formatCount(3)        // "3"
 *   formatCount(9999)     // "9999"
 *   formatCount(12345)    // "9999+"
 *   formatCount(50, 9)    // "9+"
 */
export function formatCount(count: number, max = 9999): string {
  if (!Number.isFinite(count)) return "0"
  const n = Math.floor(count)
  if (n <= 0) return "0"
  if (n > max) return `${max}+`
  return String(n)
}
