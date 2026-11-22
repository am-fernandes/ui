// Colour audit for the @amfernandesinc/ui tokens, in both themes.
//
// Reads `src/styles/tokens.css` (the `:root` block is the light theme, `.dark`
// the dark one), resolves every colour token and checks two things:
//
//   1. Contrast (WCAG) of the pairs the components actually draw: text on its
//      surface (≥ 4.5:1) and non-text UI such as the focus ring, the field
//      border and solid marks (≥ 3:1, WCAG 1.4.11).
//   2. Colour-vision deficiency: colours that must be told apart (status fills,
//      category dots, chart series) stay far enough from each other when
//      protanopia and deuteranopia are simulated. See Foundations/Color Vision.
//
//   bun run audit:contrast
//
// Exits with 1 when any required check fails.

import { readFileSync } from "node:fs"
import { join } from "node:path"

import {
  CVD_TARGET,
  NORMAL_FLOOR,
  type Rgb,
  type Vision,
  contrast,
  distance,
  hexToRgb,
  oklchToRgb,
  over,
  rgbToHex,
} from "./lib/color"

// ---- parse the tokens -------------------------------------------------------

const css = readFileSync(join(import.meta.dir, "../src/styles/tokens.css"), "utf8")

function block(selector: string): string {
  const start = css.search(new RegExp(`^${selector.replace(".", "\\.")} \\{`, "m"))
  if (start < 0) throw new Error(`block ${selector} not found in tokens.css`)
  return css.slice(start, css.indexOf("\n}", start))
}

type Theme = Map<string, Rgb>

function parseTheme(selector: string, base?: Theme): Theme {
  const theme: Theme = new Map(base)
  const body = block(selector)
  const aliases: Array<[name: string, source: string]> = []
  const translucent: Array<[name: string, source: string, alpha: number]> = []
  for (const [, name, value] of body.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) {
    const oklch = value!.match(/^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/)
    if (oklch) {
      theme.set(name!, oklchToRgb(Number(oklch[1]), Number(oklch[2]), Number(oklch[3])))
      continue
    }
    if (/^#[0-9a-f]{6}$/i.test(value!)) {
      theme.set(name!, hexToRgb(value!))
      continue
    }
    const alias = value!.match(/^var\(--([a-z0-9-]+)\)$/)
    if (alias) {
      aliases.push([name!, alias[1]!])
      continue
    }
    // color-mix(in oklch, var(--x) N%, transparent): x at N% opacity.
    const mix = value!.match(
      /^color-mix\(in oklch, var\(--([a-z0-9-]+)\) ([\d.]+)%, transparent\)$/,
    )
    if (mix) translucent.push([name!, mix[1]!, Number(mix[2]) / 100])
  }
  // Translucent tokens are measured as they land on a surface (the card).
  for (const [name, source, alpha] of translucent) {
    theme.set(name, over(get(theme, source), alpha, get(theme, "card")))
  }
  // `--a: var(--b)`. Two passes cover an alias of an alias.
  for (let pass = 0; pass < 2; pass++) {
    for (const [name, source] of aliases) {
      const value = theme.get(source)
      if (value) theme.set(name, value)
    }
  }
  return theme
}

function get(theme: Theme, name: string): Rgb {
  const value = theme.get(name)
  if (!value) throw new Error(`token --${name} is missing`)
  return value
}

const light = parseTheme(":root")
const dark = parseTheme(".dark", light)
const themes = [
  ["Light (:root)", light],
  ["Dark (.dark)", dark],
] as const

// ---- 1. contrast: the pairs the components draw -------------------------------

type Pair = [fg: string, bg: string, need: number | null, note?: string]

const STATUS = ["destructive", "warning", "success", "info"]
const CATEGORIES = ["gray", "red", "orange", "yellow", "green", "teal", "blue", "purple", "pink"]
const CHARTS = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-6"]
const SURFACES = ["background", "card", "popover"]

const pairs: Pair[] = [
  ["foreground", "background", 4.5],
  ["card-foreground", "card", 4.5],
  ["popover-foreground", "popover", 4.5],
  ["primary-foreground", "primary", 4.5],
  ["primary-foreground", "primary-hover", 4.5],
  ["primary-foreground", "primary-pressed", 4.5],
  ["secondary-foreground", "secondary", 4.5],
  ["muted-foreground", "muted", 4.5],
  ...SURFACES.map((s): Pair => ["muted-foreground", s, 4.5]),
  ...SURFACES.map((s): Pair => ["subtle-foreground", s, 4.5, "third text level"]),
  ["placeholder", "card", 4.5, "fields paint the card"],
  ["accent-foreground", "accent", 4.5],
  ["muted-foreground", "accent", 4.5, "secondary text in a selected row"],
  ...SURFACES.map((s): Pair => ["link", s, 4.5]),
  ["link", "muted", 4.5],
  ["link", "accent", 4.5, "marker and links in a selected row"],
  ...STATUS.map((s): Pair => [`${s}-foreground`, s, 4.5]),
  ...SURFACES.map((s): Pair => ["destructive-text", s, 4.5, "error message"]),
  ["selection-foreground", "selection", 4.5],
  ["sidebar-foreground", "sidebar", 4.5],
  ["sidebar-accent-foreground", "sidebar-accent", 4.5],
  ["sidebar-primary-foreground", "sidebar-primary", 4.5],
  ...CATEGORIES.map((c): Pair => [`category-${c}-text`, `category-${c}-bg`, 4.5]),
  ...SURFACES.map((s): Pair => ["ring", s, 3, "focus ring"]),
  ["primary", "card", 3, "checked controls, solid buttons"],
  ...SURFACES.map((s): Pair => ["input", s, 3, "field border, unchecked controls"]),
  ...STATUS.map((s): Pair => [s, "card", 3, "status fill and dot"]),
  ...CATEGORIES.map((c): Pair => [`category-${c}-solid`, "card", 3, "bars, dots"]),
  ...CHARTS.map((c): Pair => [c, "card", 3, "chart mark"]),
  ["card", "background", null, "the two backgrounds (reported only)"],
  ["popover", "card", null, "floating layer over a surface (reported only)"],
  ["border", "card", null, "divider (reported only)"],
  ["border-strong", "card", null, "frame (reported only)"],
]

let failures = 0
for (const [label, theme] of themes) {
  console.log(`\n${label} · contrast`)
  console.log("=".repeat(100))
  for (const [fg, bg, need, note] of pairs) {
    const ratio = contrast(get(theme, fg), get(theme, bg))
    const status = need === null ? "info" : ratio >= need ? "PASS" : "FAIL"
    if (status === "FAIL") failures++
    const target = need === null ? "      " : `≥${need.toFixed(1)}`
    console.log(
      `${`${fg} / ${bg}`.padEnd(48)} ${ratio.toFixed(2).padStart(6)}  ${target}  ${status.padEnd(4)}  ${rgbToHex(get(theme, fg))} on ${rgbToHex(get(theme, bg))}${note ? `  ${note}` : ""}`,
    )
  }
}

// ---- 2. colour-vision deficiency ----------------------------------------------

const SIMULATED: Vision[] = ["protan", "deutan"]

interface Closest {
  value: number
  a: string
  b: string
  vision: Vision
}

/** The closest pair among `pairsOf(names)`, for each vision in `visions`. */
function closest(theme: Theme, pairList: Array<[string, string]>, visions: Vision[]): Closest {
  let worst: Closest = { value: Number.POSITIVE_INFINITY, a: "", b: "", vision: "normal" }
  for (const vision of visions) {
    for (const [a, b] of pairList) {
      const value = distance(get(theme, a), get(theme, b), vision)
      if (value < worst.value) worst = { value, a, b, vision }
    }
  }
  return worst
}

const allPairs = (names: string[]): Array<[string, string]> =>
  names.flatMap((a, i) => names.slice(i + 1).map((b): [string, string] => [a, b]))
const neighbours = (names: string[]): Array<[string, string]> =>
  names.slice(1).map((b, i): [string, string] => [names[i]!, b])

interface Check {
  label: string
  pairs: Array<[string, string]>
  visions: Vision[]
  need: number | null
}

const solids = CATEGORIES.map((c) => `category-${c}-solid`)
const checks: Check[] = [
  {
    label: "status fills, any pair",
    pairs: allPairs(STATUS),
    visions: ["normal", ...SIMULATED],
    need: CVD_TARGET,
  },
  {
    label: "status fills, tritanopia (reported only)",
    pairs: allPairs(STATUS),
    visions: ["tritan"],
    need: null,
  },
  {
    label: "category dots, any pair",
    pairs: allPairs(solids),
    visions: ["normal", ...SIMULATED],
    need: CVD_TARGET,
  },
  {
    label: "chart series, neighbours",
    pairs: neighbours(CHARTS),
    visions: SIMULATED,
    need: CVD_TARGET,
  },
  {
    label: "chart series, neighbours (typical vision)",
    pairs: neighbours(CHARTS),
    visions: ["normal"],
    need: NORMAL_FLOOR,
  },
  {
    label: "chart series 1-3, any pair",
    pairs: allPairs(CHARTS.slice(0, 3)),
    visions: SIMULATED,
    need: CVD_TARGET,
  },
  {
    label: "chart series 1-3, any pair (typical vision)",
    pairs: allPairs(CHARTS.slice(0, 3)),
    visions: ["normal"],
    need: NORMAL_FLOOR,
  },
]

for (const [label, theme] of themes) {
  console.log(`\n${label} · colour-vision deficiency (closest pair, OKLab distance)`)
  console.log("=".repeat(100))
  for (const check of checks) {
    const worst = closest(theme, check.pairs, check.visions)
    const status = check.need === null ? "info" : worst.value >= check.need ? "PASS" : "FAIL"
    if (status === "FAIL") failures++
    const target = check.need === null ? "      " : `≥${check.need.toFixed(2)}`
    console.log(
      `${check.label.padEnd(48)} ${worst.value.toFixed(3).padStart(6)}  ${target}  ${status.padEnd(4)}  ${worst.a} × ${worst.b} (${worst.vision})`,
    )
  }
}

console.log(failures === 0 ? "\nAll required checks pass." : `\n${failures} check(s) fail.`)
process.exit(failures === 0 ? 0 : 1)
