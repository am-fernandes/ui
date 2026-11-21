// OKLCH to WCAG contrast audit for the @amfernandesinc/ui tokens.

type OKLCH = readonly [L: number, C: number, H: number]

function oklchToLinearRgb([L, C, H]: OKLCH): [number, number, number] {
  const hRad = (H * Math.PI) / 180
  const a = C * Math.cos(hRad)
  const b = C * Math.sin(hRad)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const lc = l_ ** 3
  const mc = m_ ** 3
  const sc = s_ ** 3
  const r = 4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc
  const g = -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc
  const bl = -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc
  return [r, g, bl]
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x))
}

function relativeLuminance(oklch: OKLCH): number {
  const [r, g, b] = oklchToLinearRgb(oklch).map(clamp01) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: OKLCH, b: OKLCH): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

function hex(oklch: OKLCH): string {
  const [r, g, bl] = oklchToLinearRgb(oklch).map(clamp01) as [number, number, number]
  const enc = (c: number) => (c >= 0.0031308 ? 1.055 * c ** (1 / 2.4) - 0.055 : 12.92 * c)
  const toByte = (c: number) =>
    Math.round(clamp01(enc(c)) * 255)
      .toString(16)
      .padStart(2, "0")
  return `#${toByte(r)}${toByte(g)}${toByte(bl)}`
}

const WHITE: OKLCH = [1, 0, 0]

const proposed: Array<[label: string, oklch: OKLCH, need: number]> = [
  ["destructive — current      oklch(.628 .258 29.2)", [0.628, 0.258, 29.2], 4.5],
  ["destructive — proposed     oklch(.50 .21 29.2)", [0.5, 0.21, 29.2], 4.5],
  ["destructive — alt          oklch(.55 .19 29.2)", [0.55, 0.19, 29.2], 4.5],
  ["info — current             oklch(.668 .151 236.3)", [0.668, 0.151, 236.3], 4.5],
  ["info — proposed            oklch(.50 .15 236.3)", [0.5, 0.15, 236.3], 4.5],
  ["border — current           oklch(.875 .01 252)", [0.875, 0.01, 252], 3.0],
  ["border — proposed          oklch(.80 .01 252)", [0.8, 0.01, 252], 3.0],
  ["placeholder — current      oklch(.875 .01 252)", [0.875, 0.01, 252], 4.5],
  ["placeholder — proposed     oklch(.55 .005 252)", [0.55, 0.005, 252], 4.5],
]

console.log("Contrast against white (#ffffff):")
console.log("=".repeat(85))
for (const [label, c, needed] of proposed) {
  const r = contrast(WHITE, c)
  const pass = r >= needed ? "PASS" : "FAIL"
  console.log(
    `${label.padEnd(54)} ratio=${r.toFixed(2).padStart(5)}  need≥${needed.toFixed(1)}  ${pass}  ${hex(c)}`,
  )
}

// Categorical palette (--category-*): text on its tinted bg (≥4.5) and the
// solid accent against white (≥3.0, non-text UI per WCAG 1.4.11).
const categorical: Array<[name: string, bg: OKLCH, text: OKLCH, solid: OKLCH]> = [
  ["gray", [0.965, 0.006, 252], [0.42, 0.02, 252], [0.55, 0.02, 252]],
  ["red", [0.965, 0.017, 27], [0.43, 0.15, 27], [0.58, 0.18, 27]],
  ["orange", [0.965, 0.019, 50], [0.44, 0.112, 50], [0.6, 0.15, 50]],
  ["yellow", [0.97, 0.035, 92.6], [0.42, 0.083, 92.6], [0.6, 0.117, 92.6]],
  ["green", [0.965, 0.03, 145], [0.42, 0.1, 145], [0.58, 0.14, 145]],
  ["teal", [0.965, 0.025, 185], [0.42, 0.071, 185], [0.58, 0.098, 185]],
  ["blue", [0.965, 0.017, 250], [0.42, 0.115, 250], [0.56, 0.152, 250]],
  ["purple", [0.965, 0.019, 300], [0.42, 0.15, 300], [0.56, 0.18, 300]],
  ["pink", [0.965, 0.019, 350], [0.43, 0.15, 350], [0.6, 0.18, 350]],
]

console.log("")
console.log("Categorical palette:")
console.log("=".repeat(85))
for (const [name, bg, text, solid] of categorical) {
  const textRatio = contrast(text, bg)
  const solidRatio = contrast(WHITE, solid)
  const pass = textRatio >= 4.5 && solidRatio >= 3 ? "PASS" : "FAIL"
  console.log(
    `${name.padEnd(8)} text/bg=${textRatio.toFixed(2).padStart(5)}  solid/white=${solidRatio.toFixed(2).padStart(5)}  ${pass}`,
  )
}
