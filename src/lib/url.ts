/**
 * URL safety helpers shared by every component that takes a consumer-
 * supplied URL: `<img src>` (Image, Avatar), `<video src>` (Video) and
 * `<a href>` (Breadcrumb, Sidebar).
 *
 * The goal is to refuse `javascript:`, `vbscript:`, `file:`, and similar
 * pseudo-schemes that turn a URL into a script-execution vector when
 * rendered. Consumers can opt in to other schemes by passing a custom
 * allowlist (e.g. `["http:", "https:", "data:"]` to render base64-encoded
 * thumbnails).
 */

/** Default allowlist for media `src` props — Image, Video, Avatar. */
export const DEFAULT_ALLOWED_RESOURCE_PROTOCOLS = ["http:", "https:"] as const

/**
 * Default allowlist for navigation `href` props — Breadcrumb, Sidebar.
 * `mailto:` and `tel:` are added because contact links are a legitimate
 * use case in enterprise menus. Relative URLs and `#hash` links resolve
 * through the page origin's protocol, so they're already covered by the
 * `http:` / `https:` entries.
 */
export const DEFAULT_ALLOWED_LINK_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"] as const

/**
 * Returns true when `value` resolves to a URL with a protocol on the
 * `allowed` list. Always returns false for `javascript:`, regardless of
 * case or leading whitespace. Relative URLs resolve against
 * `window.location.href` client-side and `http://localhost/` during SSR,
 * so links like `/dashboard` or `#section` pass the link defaults.
 */
export function isAllowedUrl(value: string, allowed: readonly string[]): boolean {
  // Defense-in-depth: surface `javascript:` even if URL() somehow returned
  // a parsed object with a benign-looking protocol (legacy engines).
  if (/^\s*javascript:/i.test(value)) return false
  try {
    const base = typeof window !== "undefined" ? window.location.href : "http://localhost/"
    const u = new URL(value, base)
    return allowed.includes(u.protocol)
  } catch {
    // Inputs that don't parse as a URL fall back to a conservative check —
    // refuse known-dangerous schemes, accept everything else (fragments,
    // empty strings, etc.).
    return !/^\s*(javascript|data|vbscript|file):/i.test(value)
  }
}
