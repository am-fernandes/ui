// WCAG contrast audit for the @amfernandesinc/ui color tokens, in both themes.
//
// Reads `src/styles/tokens.css` (the `:root` block is the light theme, `.dark`
// the dark one), resolves every OKLCH token and checks the pairs the
// components actually draw: text on its surface (≥ 4.5:1) and non-text UI
// such as the focus ring and solid accents (≥ 3:1, WCAG 1.4.11).
//
//   bun run audit:contrast
//
// Exits with 1 when any required pair fails.

import { readFileSync } from "node:fs"
import { join } from "node:path"

type OKLCH = readonly [L: number, C: number, H: number]
type RGB = readonly [r: number, g: number, b: number]

function oklchToLinearRgb([L, C, H]: OKLCH): RGB {
  const hRad = (H * Math.PI) / 180
  const a = C * Math.cos(hRad)
  const b = C * Math.sin(hRad)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const clamp = (x: number) => Math.max(0, Math.min(1, x))
  return [
    clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ]
}

const encode = (c: number) => (c >= 0.0031308 ? 1.055 * c ** (1 / 2.4) - 0.055 : 12.92 * c)
const decode = (c: number) => (c >= 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92)

function luminance([r, g, b]: RGB): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

/** `color` at `alpha` painted over `under`, blended in sRGB like the browser. */
function over(color: RGB, alpha: number, under: RGB): RGB {
  return color.map((c, i) => decode(encode(c) * alpha + encode(under[i]!) * (1 - alpha))) as RGB
}

function hex(c: RGB): string {
  return `#${c
    .map((x) =>
      Math.round(encode(x) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`
}

// ---- parse the tokens -------------------------------------------------------

const css = readFileSync(join(import.meta.dir, "../src/styles/tokens.css"), "utf8")

function block(selector: string): string {
  const start = css.search(new RegExp(`^${selector.replace(".", "\\.")} \\{`, "m"))
  if (start < 0) throw new Error(`block ${selector} not found in tokens.css`)
  return css.slice(start, css.indexOf("\n}", start))
}

type Theme = Map<string, RGB>

function parseTheme(selector: string, base?: Theme): Theme {
  const theme: Theme = new Map(base)
  const body = block(selector)
  const translucent: Array<[name: string, source: string, alpha: number]> = []
  for (const [, name, value] of body.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) {
    const oklch = value!.match(/^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/)
    if (oklch) {
      theme.set(name!, oklchToLinearRgb([Number(oklch[1]), Number(oklch[2]), Number(oklch[3])]))
      continue
    }
    // color-mix(in oklch, var(--x) N%, transparent): x at N% opacity.
    const mix = value!.match(
      /^color-mix\(in oklch, var\(--([a-z0-9-]+)\) ([\d.]+)%, transparent\)$/,
    )
    if (mix) translucent.push([name!, mix[1]!, Number(mix[2]) / 100])
  }
  // Translucent tokens are measured as they land on the page background.
  for (const [name, source, alpha] of translucent) {
    theme.set(name, over(get(theme, source), alpha, get(theme, "background")))
  }
  return theme
}

function get(theme: Theme, name: string): RGB {
  const value = theme.get(name)
  if (!value) throw new Error(`token --${name} is missing`)
  return value
}

const light = parseTheme(":root")
const dark = parseTheme(".dark", light)

// ---- the pairs the components draw ------------------------------------------

type Pair = [fg: string, bg: string, need: number | null, note?: string]

const STATUS = ["success", "warning", "info", "destructive"]
const CATEGORIES = ["gray", "red", "orange", "yellow", "green", "teal", "blue", "purple", "pink"]

const pairs: Pair[] = [
  ["foreground", "background", 4.5],
  ["card-foreground", "card", 4.5],
  ["popover-foreground", "popover", 4.5],
  ["primary-foreground", "primary", 4.5],
  ["secondary-foreground", "secondary", 4.5],
  ["muted-foreground", "muted", 4.5],
  ["muted-foreground", "background", 4.5],
  ["muted-foreground", "popover", 4.5],
  ["accent-foreground", "accent", 4.5],
  ["destructive-foreground", "destructive", 4.5],
  ["success-foreground", "success", 4.5],
  ["warning-foreground", "warning", 4.5],
  ["info-foreground", "info", 4.5],
  ["destructive", "background", 4.5, "error messages (text-destructive)"],
  ["placeholder", "background", 4.5],
  ["sidebar-foreground", "sidebar", 4.5],
  ["sidebar-accent-foreground", "sidebar-accent", 4.5],
  ["sidebar-primary-foreground", "sidebar-primary", 4.5],
  ...STATUS.map((s): Pair => [`status-${s}-text`, `status-${s}-bg`, 4.5]),
  ...CATEGORIES.map((c): Pair => [`category-${c}-text`, `category-${c}-bg`, 4.5]),
  ["ring", "background", 3, "focus ring"],
  ["primary", "background", 3, "checked controls, solid buttons"],
  ...CATEGORIES.map((c): Pair => [`category-${c}-solid`, "background", 3, "bars, dots"]),
  ["input", "background", null, "field border (reported only)"],
  ["border", "background", null, "translucent border (reported only)"],
]

let failures = 0
for (const [label, theme] of [
  ["Light (:root)", light],
  ["Dark (.dark)", dark],
] as const) {
  console.log(`\n${label}`)
  console.log("=".repeat(96))
  for (const [fg, bg, need, note] of pairs) {
    const ratio = contrast(get(theme, fg), get(theme, bg))
    const status = need === null ? "info" : ratio >= need ? "PASS" : "FAIL"
    if (status === "FAIL") failures++
    const target = need === null ? "      " : `≥${need.toFixed(1)}`
    console.log(
      `${`${fg} / ${bg}`.padEnd(48)} ${ratio.toFixed(2).padStart(6)}  ${target}  ${status.padEnd(4)}  ${hex(get(theme, fg))} on ${hex(get(theme, bg))}${note ? `  ${note}` : ""}`,
    )
  }
}

console.log(failures === 0 ? "\nAll required pairs pass." : `\n${failures} pair(s) fail.`)
process.exit(failures === 0 ? 0 : 1)
