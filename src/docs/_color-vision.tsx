/**
 * Helpers of the Foundations/Color Vision page: colour-vision-deficiency
 * simulation, colour distance and the figures the page draws.
 * Docs only: nothing here is exported by the lib.
 */
import type * as React from "react"

import {
  CVD_FLOOR,
  CVD_TARGET,
  type Rgb,
  type Vision,
  clamp,
  contrast,
  decode,
  distance,
  hexToRgb,
  oklchToRgb,
  rgbToHex,
  simulate,
} from "../../scripts/lib/color"
import tokensCss from "../styles/tokens.css?raw"

export const VISION_LABEL: Record<Vision, string> = {
  normal: "Visão típica",
  protan: "Protanopia",
  deutan: "Deuteranopia",
  tritan: "Tritanopia",
}

const pt = (n: number, digits: number) => n.toFixed(digits).replace(".", ",")

// ---- the lib's own tokens ----------------------------------------------------

type Theme = ReadonlyMap<string, Rgb>

/** Reads the colour tokens of one block of tokens.css (`:root` or `.dark`). */
function parseTheme(selector: string, base?: Theme): Theme {
  const theme = new Map<string, Rgb>(base)
  const start = tokensCss.search(new RegExp(`^${selector.replace(".", "\\.")} \\{`, "m"))
  if (start < 0) return theme
  const body = tokensCss.slice(start, tokensCss.indexOf("\n}", start))
  for (const [, name, value] of body.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) {
    if (!name || !value) continue
    const lch = value.match(/^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/)
    if (lch) {
      theme.set(name, oklchToRgb(Number(lch[1]), Number(lch[2]), Number(lch[3])))
    } else if (/^#[0-9a-f]{6}$/i.test(value)) {
      theme.set(name, hexToRgb(value))
    }
  }
  return theme
}

const LIGHT = parseTheme(":root")
const TOKENS: Record<"light" | "dark", Theme> = { light: LIGHT, dark: parseTheme(".dark", LIGHT) }

const FALLBACK: Rgb = [0.5, 0.5, 0.5]
const token = (theme: "light" | "dark", name: string): Rgb => TOKENS[theme].get(name) ?? FALLBACK

// ---- shared pieces -----------------------------------------------------------

const mono: React.CSSProperties = { fontFamily: "var(--font-mono)", fontSize: 12 }
const muted: React.CSSProperties = { color: "var(--muted-foreground)" }
const frame: React.CSSProperties = {
  border: "1px solid var(--border-strong)",
  borderRadius: "var(--radius-container)",
  padding: 16,
  margin: "16px 0 24px",
  color: "var(--foreground)",
  background: "var(--card)",
}

export interface Sample {
  label: string
  hex: string
  /** Text colour over the swatch. Defaults to white. */
  fg?: string
}

interface Worst {
  value: number
  a: string
  b: string
  vision: Vision
}

function worstPair(samples: readonly Sample[], visions: readonly Vision[]): Worst | null {
  let worst: Worst | null = null
  for (const vision of visions) {
    for (let i = 0; i < samples.length; i++) {
      for (let j = i + 1; j < samples.length; j++) {
        const a = samples[i]
        const b = samples[j]
        if (!a || !b) continue
        const value = distance(hexToRgb(a.hex), hexToRgb(b.hex), vision)
        if (!worst || value < worst.value) worst = { value, a: a.label, b: b.label, vision }
      }
    }
  }
  return worst
}

function verdict(value: number): string {
  if (value >= CVD_TARGET) return "dentro do alvo (0,08 ou mais)"
  if (value >= CVD_FLOOR) return "abaixo do alvo: só funciona com ícone e rótulo"
  return "abaixo do piso (0,06): as duas cores se confundem"
}

// ---- figures -----------------------------------------------------------------

const NM_MIN = 400
const NM_MAX = 700

// Schematic cone sensitivities: asymmetric bells at the usual peak wavelengths.
const CONES = {
  S: { peak: 440, left: 20, right: 26, color: "#6a67c9", dash: "2 4" },
  M: { peak: 535, left: 38, right: 42, color: "#2f8f66", dash: "8 4" },
  L: { peak: 562, left: 42, right: 46, color: "#c2553a", dash: "" },
} as const
type Cone = keyof typeof CONES

const MISSING: Record<Vision, Cone | null> = { normal: null, protan: "L", deutan: "M", tritan: "S" }
// Wavelength the dichromat sees as gray (approximate, from the literature).
const NEUTRAL: Record<Vision, number | null> = {
  normal: null,
  protan: 492,
  deutan: 498,
  tritan: 570,
}

/** Approximate sRGB colour of a wavelength (Bruton's piecewise fit). */
function wavelengthToRgb(nm: number): Rgb {
  let r = 0
  let g = 0
  let b = 0
  if (nm < 440) {
    r = (440 - nm) / 60
    b = 1
  } else if (nm < 490) {
    g = (nm - 440) / 50
    b = 1
  } else if (nm < 510) {
    g = 1
    b = (510 - nm) / 20
  } else if (nm < 580) {
    r = (nm - 510) / 70
    g = 1
  } else if (nm < 645) {
    r = 1
    g = (645 - nm) / 65
  } else {
    r = 1
  }
  // The eye fades at both ends of the visible range.
  const fade =
    nm < 420 ? 0.3 + (0.7 * (nm - 380)) / 40 : nm > 680 ? 0.3 + (0.7 * (780 - nm)) / 100 : 1
  return [
    decode(clamp(r * fade) ** 0.8),
    decode(clamp(g * fade) ** 0.8),
    decode(clamp(b * fade) ** 0.8),
  ]
}

/**
 * The three cones and the spectrum as seen with `vision`. The missing cone is
 * drawn as a faint outline and the neutral point (the wavelength that turns
 * gray) is marked.
 */
export function ConeChart({ vision = "normal" }: { vision?: Vision }) {
  const W = 640
  const H = 250
  const left = 36
  const right = W - 16
  const top = 16
  const base = 170
  const x = (nm: number) => left + ((nm - NM_MIN) / (NM_MAX - NM_MIN)) * (right - left)
  const y = (v: number) => base - v * (base - top)
  const missing = MISSING[vision]
  const neutral = NEUTRAL[vision]

  const path = (cone: Cone) => {
    const { peak, left: sl, right: sr } = CONES[cone]
    const points: string[] = []
    for (let nm = NM_MIN; nm <= NM_MAX; nm += 4) {
      const sigma = nm < peak ? sl : sr
      const v = Math.exp(-0.5 * ((nm - peak) / sigma) ** 2)
      points.push(`${nm === NM_MIN ? "M" : "L"}${x(nm).toFixed(1)} ${y(v).toFixed(1)}`)
    }
    return points.join(" ")
  }

  const strip: React.ReactNode[] = []
  for (let nm = NM_MIN; nm < NM_MAX; nm += 4) {
    strip.push(
      <rect
        key={nm}
        x={x(nm)}
        y={base + 22}
        width={x(nm + 4) - x(nm) + 0.6}
        height={22}
        fill={rgbToHex(simulate(wavelengthToRgb(nm + 2), vision))}
      />,
    )
  }

  return (
    <figure style={frame}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={
          missing
            ? `Sensibilidade dos cones na ${VISION_LABEL[vision].toLowerCase()}: o cone ${missing} está ausente`
            : "Sensibilidade dos três cones, S, M e L, ao longo do espectro visível"
        }
        style={{ width: "100%", maxWidth: 640, height: "auto", color: "var(--foreground)" }}
      >
        <line x1={left} y1={base} x2={right} y2={base} stroke="currentColor" strokeOpacity={0.35} />
        {(Object.keys(CONES) as Cone[]).map((cone) => {
          const { peak, color, dash } = CONES[cone]
          const gone = cone === missing
          return (
            <g key={cone}>
              <path
                d={path(cone)}
                fill="none"
                stroke={gone ? "currentColor" : color}
                strokeOpacity={gone ? 0.3 : 1}
                strokeWidth={gone ? 1.5 : 2.5}
                strokeDasharray={gone ? "3 5" : dash}
              />
              <text
                x={x(peak)}
                y={y(1) - 4}
                textAnchor="middle"
                fontSize={13}
                fontWeight={600}
                fill="currentColor"
                fillOpacity={gone ? 0.5 : 1}
              >
                {gone ? `${cone} (ausente)` : cone}
              </text>
            </g>
          )
        })}
        {strip}
        {neutral ? (
          <g>
            <line
              x1={x(neutral)}
              y1={top + 20}
              x2={x(neutral)}
              y2={base}
              stroke="currentColor"
              strokeDasharray="4 3"
            />
            <line
              x1={x(neutral)}
              y1={base + 18}
              x2={x(neutral)}
              y2={base + 50}
              stroke="currentColor"
              strokeDasharray="4 3"
            />
            <text
              x={x(neutral)}
              y={base + 62}
              textAnchor="middle"
              fontSize={11}
              fill="currentColor"
            >
              ponto neutro · {neutral} nm
            </text>
          </g>
        ) : null}
        {[400, 450, 500, 550, 600, 650, 700].map((nm) => (
          <text
            key={nm}
            x={x(nm)}
            y={base + 14}
            textAnchor="middle"
            fontSize={11}
            fill="currentColor"
            fillOpacity={0.7}
          >
            {nm}
          </text>
        ))}
        <text
          x={right}
          y={H - 2}
          textAnchor="end"
          fontSize={11}
          fill="currentColor"
          fillOpacity={0.7}
        >
          comprimento de onda (nm) · espectro como é visto
        </text>
      </svg>
      <figcaption style={{ fontSize: 13, ...muted }}>
        {missing
          ? `${VISION_LABEL[vision]}: sem o cone ${missing}. Curvas esquemáticas; a faixa de baixo é uma simulação.`
          : "Visão típica. Curvas esquemáticas, normalizadas no pico."}
      </figcaption>
    </figure>
  )
}

/** A sweep of screen hues, as each kind of vision sees it. */
export function HueRows({ visions = ["normal", "protan", "deutan", "tritan"] as Vision[] }) {
  const steps = 72
  const hues = Array.from({ length: steps }, (_, i) => (i / steps) * 330)
  // Fully saturated screen colours: one channel at 1, one at 0, one moving.
  const hueToRgb = (h: number): Rgb => {
    const k = h / 60
    const f = 1 - Math.abs((k % 2) - 1)
    const sextant = Math.floor(k) % 6
    const table: readonly Rgb[] = [
      [1, f, 0],
      [f, 1, 0],
      [0, 1, f],
      [0, f, 1],
      [f, 0, 1],
      [1, 0, f],
    ]
    const [r, g, b] = table[sextant] ?? [1, 0, 0]
    return [decode(r), decode(g), decode(b)]
  }
  return (
    <div style={{ ...frame, display: "flex", flexDirection: "column", gap: 10 }}>
      {visions.map((vision) => (
        <div
          key={vision}
          style={{
            display: "grid",
            gridTemplateColumns: "120px 1fr",
            gap: 12,
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13 }}>{VISION_LABEL[vision]}</span>
          <div
            style={{
              display: "flex",
              height: 28,
              borderRadius: "var(--radius-inner)",
              overflow: "hidden",
            }}
          >
            {hues.map((h) => (
              <span
                key={h}
                style={{ flex: 1, background: rgbToHex(simulate(hueToRgb(h), vision)) }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/** Pairs that are clearly different, and what is left of them with `vision`. */
export function ConfusionPairs({
  pairs,
  vision = "protan",
}: {
  pairs: readonly (readonly [Sample, Sample])[]
  vision?: Vision
}) {
  const swatch = (s: Sample, simulated: boolean) => {
    const hex = simulated ? rgbToHex(simulate(hexToRgb(s.hex), vision)) : s.hex
    return (
      <span style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
        <span style={{ height: 36, borderRadius: "var(--radius-inner)", background: hex }} />
        <span style={{ fontSize: 12, ...muted }}>{simulated ? hex : s.label}</span>
      </span>
    )
  }
  return (
    <div style={{ ...frame, display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 150px",
          gap: 16,
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        <span>Visão típica</span>
        <span>{VISION_LABEL[vision]}</span>
        <span>Distância</span>
      </div>
      {pairs.map(([a, b]) => {
        const ra = hexToRgb(a.hex)
        const rb = hexToRgb(b.hex)
        return (
          <div
            key={`${a.hex}${b.hex}`}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 150px",
              gap: 16,
              alignItems: "start",
            }}
          >
            <span style={{ display: "flex", gap: 6 }}>
              {swatch(a, false)}
              {swatch(b, false)}
            </span>
            <span style={{ display: "flex", gap: 6 }}>
              {swatch(a, true)}
              {swatch(b, true)}
            </span>
            <span style={{ ...mono, paddingTop: 10 }}>
              {pt(distance(ra, rb), 3)} → {pt(distance(ra, rb, vision), 3)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

interface ContrastRow {
  label: string
  fg: string
  bg: string
}

/** Contrast of the same pair for typical vision, protanopia and deuteranopia. */
export function ContrastByVision({ rows }: { rows: readonly ContrastRow[] }) {
  const visions: Vision[] = ["normal", "protan", "deutan"]
  const cols = "minmax(0, 1.6fr) 120px repeat(3, minmax(0, 1fr))"
  return (
    <div style={{ ...frame, display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: cols,
          gap: 12,
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        <span>Par</span>
        <span>Amostra</span>
        {visions.map((v) => (
          <span key={v}>{VISION_LABEL[v]}</span>
        ))}
      </div>
      {rows.map((row) => {
        const fg = hexToRgb(row.fg)
        const bg = hexToRgb(row.bg)
        return (
          <div
            key={row.label}
            style={{ display: "grid", gridTemplateColumns: cols, gap: 12, alignItems: "center" }}
          >
            <span style={{ fontSize: 13 }}>{row.label}</span>
            <span
              style={{
                padding: "6px 10px",
                borderRadius: "var(--radius-inner)",
                background: row.bg,
                color: row.fg,
                fontSize: 13,
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              Texto
            </span>
            {visions.map((v) => (
              <span key={v} style={mono}>
                {pt(contrast(fg, bg, v), 1)}:1
              </span>
            ))}
          </div>
        )
      })}
    </div>
  )
}

/**
 * The same colours for each kind of vision, with the closest pair measured.
 * `surface` paints the panel, so fills are judged against their real background.
 */
export function VisionTable({
  samples,
  visions = ["normal", "protan", "deutan"],
  surface,
  title,
}: {
  samples: readonly Sample[]
  visions?: readonly Vision[]
  surface?: { background: string; color: string }
  title?: string
}) {
  const worst = worstPair(samples, visions)
  const cols = `120px repeat(${samples.length}, minmax(0, 1fr))`
  return (
    <div
      style={{
        ...frame,
        ...(surface ? { background: surface.background, color: surface.color } : null),
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {title ? <strong style={{ fontSize: 14 }}>{title}</strong> : null}
      {visions.map((vision) => (
        <div
          key={vision}
          style={{ display: "grid", gridTemplateColumns: cols, gap: 8, alignItems: "center" }}
        >
          <span style={{ fontSize: 13 }}>{VISION_LABEL[vision]}</span>
          {samples.map((s) => (
            <span
              key={s.label}
              style={{
                height: 40,
                borderRadius: "var(--radius-inner)",
                background: rgbToHex(simulate(hexToRgb(s.hex), vision)),
                color: s.fg ?? "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {s.label}
            </span>
          ))}
        </div>
      ))}
      {worst ? (
        <span style={{ fontSize: 13, paddingTop: 4 }}>
          Par mais próximo: <strong>{worst.a.toLowerCase()}</strong> ×{" "}
          <strong>{worst.b.toLowerCase()}</strong> na {VISION_LABEL[worst.vision].toLowerCase()},{" "}
          <span style={mono}>{pt(worst.value, 3)}</span>: {verdict(worst.value)}.
        </span>
      ) : null}
    </div>
  )
}

const STATUS = [
  ["destructive", "Erro"],
  ["warning", "Alerta"],
  ["success", "Sucesso"],
  ["info", "Informação"],
] as const

/** The lib's status fills, read from tokens.css, for one theme. */
export function StatusTokens({ theme }: { theme: "light" | "dark" }) {
  const samples: Sample[] = STATUS.map(([name, label]) => ({
    label,
    hex: rgbToHex(token(theme, name)),
    fg: rgbToHex(token(theme, `${name}-foreground`)),
  }))
  return (
    <VisionTable
      title={theme === "light" ? "Tema claro" : "Tema escuro"}
      samples={samples}
      visions={["normal", "protan", "deutan", "tritan"]}
      surface={{
        background: rgbToHex(token(theme, "background")),
        color: rgbToHex(token(theme, "foreground")),
      }}
    />
  )
}

/** Contrast rows built from the lib's own error colours, for the red-darkening demo. */
export function redRows(): ContrastRow[] {
  const darkBg = rgbToHex(token("dark", "background"))
  return [
    { label: "Vermelho puro sobre preto", fg: "#ff0000", bg: "#000000" },
    {
      label: "O --destructive do tema claro usado sobre o fundo escuro",
      fg: rgbToHex(token("light", "destructive")),
      bg: darkBg,
    },
    {
      label: "O --destructive do tema escuro sobre o fundo escuro",
      fg: rgbToHex(token("dark", "destructive")),
      bg: darkBg,
    },
    {
      label: "Texto branco sobre o --destructive do tema claro",
      fg: "#ffffff",
      bg: rgbToHex(token("light", "destructive")),
    },
  ]
}
