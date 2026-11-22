// Colour math shared by scripts/contrast-audit.ts and the Foundations/Color
// Vision page: sRGB and OKLCH conversion, WCAG contrast, colour-vision-
// deficiency simulation and OKLab distance. No dependencies, no I/O.

export type Rgb = readonly [r: number, g: number, b: number]
export type Vision = "normal" | "protan" | "deutan" | "tritan"

// Machado, Oliveira & Fernandes (2009), severity 1.0 (full dichromacy). The
// matrices apply to linear RGB.
const MACHADO: Record<Exclude<Vision, "normal">, readonly [Rgb, Rgb, Rgb]> = {
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritan: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
}

export const clamp = (x: number) => Math.min(1, Math.max(0, x))

/** sRGB channel (0-1) to linear light. */
export const decode = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)

/** Linear light to an sRGB channel (0-1). */
export const encode = (c: number) => {
  const x = clamp(c)
  return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055
}

/** `#rrggbb` to linear RGB. */
export function hexToRgb(hex: string): Rgb {
  const h = hex.replace("#", "")
  const at = (i: number) => decode(Number.parseInt(h.slice(i, i + 2), 16) / 255)
  return [at(0), at(2), at(4)]
}

export function rgbToHex(rgb: Rgb): string {
  const byte = (c: number) =>
    Math.round(encode(c) * 255)
      .toString(16)
      .padStart(2, "0")
  return `#${byte(rgb[0])}${byte(rgb[1])}${byte(rgb[2])}`
}

/** `oklch(L C H)` to linear RGB, clipped to sRGB. */
export function oklchToRgb(L: number, C: number, H: number): Rgb {
  const hRad = (H * Math.PI) / 180
  const a = C * Math.cos(hRad)
  const b = C * Math.sin(hRad)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ]
}

/** `color` at `alpha` painted over `under`, blended in sRGB like the browser. */
export function over(color: Rgb, alpha: number, under: Rgb): Rgb {
  const mix = (i: 0 | 1 | 2) => decode(encode(color[i]) * alpha + encode(under[i]) * (1 - alpha))
  return [mix(0), mix(1), mix(2)]
}

/** The colour as someone with that deficiency sees it (an approximation). */
export function simulate(rgb: Rgb, vision: Vision): Rgb {
  if (vision === "normal") return rgb
  const m = MACHADO[vision]
  const row = (r: Rgb) => clamp(r[0] * rgb[0] + r[1] * rgb[1] + r[2] * rgb[2])
  return [row(m[0]), row(m[1]), row(m[2])]
}

function oklab([r, g, b]: Rgb): Rgb {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

/** Euclidean distance in OKLab, as seen with `vision`. 0 is identical. */
export function distance(a: Rgb, b: Rgb, vision: Vision = "normal"): number {
  const x = oklab(simulate(a, vision))
  const y = oklab(simulate(b, vision))
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2])
}

export const luminance = ([r, g, b]: Rgb) => 0.2126 * r + 0.7152 * g + 0.0722 * b

/** WCAG contrast ratio, as seen with `vision`. */
export function contrast(a: Rgb, b: Rgb, vision: Vision = "normal"): number {
  const la = luminance(simulate(a, vision))
  const lb = luminance(simulate(b, vision))
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** Distances below these read as "the same colour" (OKLab, after simulation). */
export const CVD_TARGET = 0.08
export const CVD_FLOOR = 0.06
/** Neighbouring chart series must also be this far apart for typical vision. */
export const NORMAL_FLOOR = 0.15
